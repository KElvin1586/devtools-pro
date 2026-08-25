import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { getEntitlementSource, getLicense, getPlan, setPlan, updateLicense, type Plan } from '../lib/entitlements';
import {
  activateLicense,
  deactivateLicense,
  validateLicense,
  type LicenseError,
  type LicenseRecord,
} from '../lib/license';

export interface LicenseState {
  /** 'checking' while a stored license is being re-validated on load. */
  status: 'none' | 'checking' | 'active';
  license: LicenseRecord | null;
}

interface EntitlementContextValue {
  plan: Plan;
  premium: boolean;
  license: LicenseState;
  /** Dev-test only: simulate premium in development builds. */
  activatePremium: () => void;
  downgrade: () => void;
  /**
   * Real activation: verifies a Lemon Squeezy license key with Lemon
   * Squeezy's servers and only unlocks Premium when the server confirms it.
   */
  activateWithLicense: (key: string) => Promise<{ ok: true } | { ok: false; error: LicenseError }>;
  /** Deactivate the license on this device (frees the seat) and return to Free. */
  deactivate: () => Promise<void>;
  /** Open the global upgrade modal. */
  requestUpgrade: (featureName?: string) => void;
  upgradeModal: { open: boolean; feature?: string };
  closeUpgradeModal: () => void;
}

const EntitlementContext = createContext<EntitlementContextValue | null>(null);

export function EntitlementProvider({ children }: { children: ReactNode }) {
  const [plan, setPlanState] = useState<Plan>(() => getPlan());
  const [license, setLicense] = useState<LicenseState>(() => {
    const stored = getLicense();
    return stored && getEntitlementSource() === 'provider'
      ? { status: 'checking', license: stored }
      : { status: 'none', license: null };
  });
  const [upgradeModal, setUpgradeModal] = useState<{ open: boolean; feature?: string }>({ open: false });
  const validating = useRef(false);

  // Re-validate a stored license against Lemon Squeezy on every app load.
  // A forged, revoked, refunded or expired record is downgraded immediately.
  // If the license server is unreachable, keep the last-known state (offline
  // grace) — offline users are not punished for a network failure.
  useEffect(() => {
    const stored = getLicense();
    if (!stored || getEntitlementSource() !== 'provider' || validating.current) return;
    validating.current = true;
    validateLicense(stored)
      .then((result) => {
        if (result.ok) {
          updateLicense(result.record);
          setLicense({ status: 'active', license: result.record });
          setPlanState('premium');
        } else if (result.error.code === 'network') {
          setLicense({ status: 'active', license: stored });
        } else {
          setPlan('free');
          setPlanState('free');
          setLicense({ status: 'none', license: null });
        }
      })
      .finally(() => {
        validating.current = false;
      });
  }, []);

  const activatePremium = useCallback(() => {
    setPlan('premium');
    setPlanState('premium');
    setUpgradeModal({ open: false });
  }, []);

  const downgrade = useCallback(() => {
    setPlan('free');
    setPlanState('free');
    setLicense({ status: 'none', license: null });
  }, []);

  const activateWithLicense = useCallback(async (key: string) => {
    const result = await activateLicense(key);
    if (result.ok) {
      setPlan('premium', 'provider', result.record);
      setPlanState('premium');
      setLicense({ status: 'active', license: result.record });
      setUpgradeModal({ open: false });
      return { ok: true } as const;
    }
    return { ok: false, error: result.error } as const;
  }, []);

  const deactivate = useCallback(async () => {
    const stored = getLicense();
    if (stored) {
      // Best effort: free the activation seat server-side, then downgrade
      // locally regardless of the network result.
      await deactivateLicense(stored).catch(() => false);
    }
    setPlan('free');
    setPlanState('free');
    setLicense({ status: 'none', license: null });
  }, []);

  const requestUpgrade = useCallback((featureName?: string) => {
    setUpgradeModal({ open: true, feature: featureName });
  }, []);

  const closeUpgradeModal = useCallback(() => setUpgradeModal({ open: false }), []);

  return (
    <EntitlementContext.Provider
      value={{
        plan,
        premium: plan === 'premium',
        license,
        activatePremium,
        downgrade,
        activateWithLicense,
        deactivate,
        requestUpgrade,
        upgradeModal,
        closeUpgradeModal,
      }}
    >
      {children}
    </EntitlementContext.Provider>
  );
}

export function useEntitlement(): EntitlementContextValue {
  const ctx = useContext(EntitlementContext);
  if (!ctx) throw new Error('useEntitlement must be used inside <EntitlementProvider>');
  return ctx;
}
