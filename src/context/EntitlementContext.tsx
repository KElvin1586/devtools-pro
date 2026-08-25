import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { getPlan, setPlan, type Plan } from '../lib/entitlements';

interface EntitlementContextValue {
  plan: Plan;
  premium: boolean;
  activatePremium: () => void;
  downgrade: () => void;
  /** Open the global upgrade modal. */
  requestUpgrade: (featureName?: string) => void;
  upgradeModal: { open: boolean; feature?: string };
  closeUpgradeModal: () => void;
}

const EntitlementContext = createContext<EntitlementContextValue | null>(null);

export function EntitlementProvider({ children }: { children: ReactNode }) {
  const [plan, setPlanState] = useState<Plan>(() => getPlan());
  const [upgradeModal, setUpgradeModal] = useState<{ open: boolean; feature?: string }>({ open: false });

  const activatePremium = useCallback(() => {
    setPlan('premium');
    setPlanState('premium');
    setUpgradeModal({ open: false });
  }, []);

  const downgrade = useCallback(() => {
    setPlan('free');
    setPlanState('free');
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
        activatePremium,
        downgrade,
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
