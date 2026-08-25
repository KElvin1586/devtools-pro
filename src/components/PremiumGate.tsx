import type { ReactNode } from 'react';
import { useEntitlement } from '../context/EntitlementContext';

/**
 * Wraps premium-only UI. Free users still SEE the feature (never hidden),
 * marked 🔒 PREMIUM; interacting with it opens the upgrade modal.
 */
export function PremiumGate({ feature, children }: { feature: string; children: ReactNode }) {
  const { premium, requestUpgrade } = useEntitlement();
  if (premium) return <>{children}</>;
  return (
    <button
      type="button"
      className="group relative block w-full cursor-pointer text-left"
      onClick={() => requestUpgrade(feature)}
      aria-label={`${feature} — Premium feature. Click to upgrade.`}
    >
      <span className="pointer-events-none block opacity-60 blur-[1px]" aria-hidden="true">
        {children}
      </span>
      <span className="absolute inset-0 flex items-center justify-center rounded-md bg-surface-900/60 transition-colors group-hover:bg-surface-900/70">
        <span className="rounded-md border border-amber-500/50 bg-surface-800 px-3 py-1.5 text-sm font-semibold text-amber-400">
          🔒 PREMIUM
        </span>
      </span>
    </button>
  );
}
