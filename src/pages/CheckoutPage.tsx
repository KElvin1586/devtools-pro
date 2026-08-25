import { Link } from 'react-router-dom';
import { PRODUCT_NAME, loadPricing, formatPlanPrice } from '../config/commercial';
import { DEV_TEST_MODE } from '../lib/devmode';
import { useEntitlement } from '../context/EntitlementContext';

/**
 * Internal checkout page — the default upgrade destination.
 *
 * This page deliberately does NOT process payments, collect card details, or
 * claim a purchase happened. It exists so the upgrade flow works end-to-end
 * during development and so self-hosted builds have a safe destination until
 * a real payment provider URL is configured (VITE_UPGRADE_URL or Settings).
 */
export function CheckoutPage() {
  const pricing = loadPricing();
  const { premium, activatePremium, downgrade } = useEntitlement();

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-bold text-white">Checkout — {PRODUCT_NAME} Premium</h1>
      <p className="mt-1 text-sm text-gray-400">Internal checkout page</p>

      <section className="panel mt-4 p-4" aria-label="Order summary">
        <h2 className="font-semibold text-white">Order summary</h2>
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-gray-300">{PRODUCT_NAME} Premium — one-time license</span>
          <span className="font-semibold text-white">{formatPlanPrice(pricing.premium)}</span>
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-surface-600 pt-2 text-sm">
          <span className="text-gray-400">Total</span>
          <span className="font-bold text-accent-500">{formatPlanPrice(pricing.premium)}</span>
        </div>
      </section>

      <section className="panel mt-4 border-amber-500/40 p-4">
        <h2 className="font-semibold text-amber-400">⚠ No payment is processed here</h2>
        <p className="mt-2 text-sm text-gray-300">
          This build has no payment provider connected. Nothing is charged, no card details are
          collected, and no purchase is completed on this page.
        </p>
        <p className="mt-2 text-sm text-gray-400">
          To sell Premium, point the upgrade button at your real checkout (Stripe Payment Link,
          Lemon Squeezy, Gumroad, …) by setting <code className="rounded bg-surface-900 px-1">VITE_UPGRADE_URL</code> at
          build time or the Upgrade URL on the <Link to="/settings" className="text-accent-500 underline">Settings</Link> page.
          See <code className="rounded bg-surface-900 px-1">PRICING.md</code> for integration instructions.
        </p>
      </section>

      {DEV_TEST_MODE && (
        <section className="panel mt-4 border-dashed border-amber-500/60 p-4" data-testid="dev-test-mode">
          <h2 className="font-semibold text-amber-400">🧪 Development test mode</h2>
          <p className="mt-1 text-sm text-gray-400">
            Development builds only — never shipped in production. Simulates the entitlement state
            locally without any payment. No credentials are stored or transmitted.
          </p>
          <div className="mt-3 flex gap-2">
            {!premium ? (
              <button className="btn btn-primary" onClick={activatePremium}>
                Enable Premium (test)
              </button>
            ) : (
              <button className="btn" onClick={downgrade}>
                Disable Premium (test)
              </button>
            )}
            <Link to="/" className="btn">Back to app</Link>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Current plan: <span className="font-semibold">{premium ? 'Premium (test)' : 'Free'}</span>
          </p>
        </section>
      )}

      {!DEV_TEST_MODE && (
        <p className="mt-4 text-sm text-gray-500">
          <Link to="/" className="text-accent-500 underline">← Back to {PRODUCT_NAME}</Link>
        </p>
      )}
    </div>
  );
}
