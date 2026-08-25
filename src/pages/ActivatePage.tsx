import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useEntitlement } from '../context/EntitlementContext';
import { PRODUCT_NAME, formatPremiumDisplay, loadPricing, resolveUpgradeUrl, isInternalCheckout } from '../config/commercial';
import type { LicenseErrorCode } from '../lib/license';

const ERROR_ICONS: Record<LicenseErrorCode, string> = {
  invalid: '❌',
  expired: '⌛',
  revoked: '🚫',
  inactive: '⏸',
  limit: '👥',
  network: '📡',
};

/**
 * Premium activation screen — the customer enters the license key issued by
 * Lemon Squeezy after purchase. The key is activated and verified against
 * Lemon Squeezy's License API; Premium unlocks only when the server confirms
 * the key. Nothing here unlocks Premium locally.
 */
export function ActivatePage() {
  const { premium, license, activateWithLicense, deactivate } = useEntitlement();
  const [key, setKey] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ code: LicenseErrorCode; message: string } | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const pricing = loadPricing();
  const upgradeUrl = resolveUpgradeUrl();

  const openCheckout = () => {
    if (isInternalCheckout(upgradeUrl)) {
      navigate(upgradeUrl.replace(/^#/, '') || '/');
    } else {
      window.open(upgradeUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    setSuccess(false);
    const result = await activateWithLicense(key);
    setBusy(false);
    if (result.ok) {
      setSuccess(true);
      setKey('');
    } else {
      setError(result.error);
    }
  };

  if (premium && license.license && license.license.key) {
    return (
      <div className="mx-auto max-w-lg">
        <h1 className="text-2xl font-bold text-white">Premium is active ✨</h1>
        <section className="panel mt-4 p-4">
          <h2 className="font-semibold text-white">Your license</h2>
          <dl className="mt-2 space-y-1 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-gray-400">Status</dt>
              <dd className="font-semibold text-green-400">Active — verified with Lemon Squeezy</dd>
            </div>
            {license.license.customerEmail && (
              <div className="flex justify-between gap-4">
                <dt className="text-gray-400">Licensed to</dt>
                <dd className="truncate text-gray-200">{license.license.customerEmail}</dd>
              </div>
            )}
            <div className="flex justify-between gap-4">
              <dt className="text-gray-400">License key</dt>
              <dd className="font-mono text-xs text-gray-300">
                {license.license.key.slice(0, 8)}…{license.license.key.slice(-4)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-400">Last verified</dt>
              <dd className="text-gray-300">{new Date(license.license.validatedAt).toLocaleString()}</dd>
            </div>
          </dl>
          <p className="mt-3 text-xs text-gray-500">
            Your license is re-verified with Lemon Squeezy every time the app loads, so a refunded
            or revoked license stops working automatically.
          </p>
          <button
            className="btn mt-4"
            onClick={() => {
              void deactivate();
            }}
          >
            Deactivate on this device
          </button>
          <p className="mt-2 text-xs text-gray-500">
            Deactivating frees the activation seat so you can use the key on another device.
          </p>
        </section>
        <p className="mt-4 text-sm text-gray-500">
          <Link to="/" className="text-accent-500 underline">← Back to {PRODUCT_NAME}</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-bold text-white">Activate Premium</h1>
      <p className="mt-1 text-sm text-gray-400">
        Enter the license key from your Lemon Squeezy purchase email or receipt. The key is verified
        directly with Lemon Squeezy — Premium unlocks only after the server confirms it.
      </p>

      <form className="panel mt-4 p-4" onSubmit={submit}>
        <label>
          <span className="label">License key</span>
          <input
            className="field font-mono"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
            autoComplete="off"
            spellCheck={false}
            aria-describedby="activate-help"
          />
        </label>
        <p id="activate-help" className="mt-1 text-xs text-gray-500">
          Sent to your email after checkout at our Lemon Squeezy store.
        </p>
        {error && (
          <p role="alert" className="mt-3 rounded border border-red-500/40 bg-red-500/10 p-2 text-sm text-red-300">
            {ERROR_ICONS[error.code]} {error.message}
          </p>
        )}
        {success && (
          <p role="status" className="mt-3 rounded border border-green-500/40 bg-green-500/10 p-2 text-sm text-green-300">
            ✓ License verified by Lemon Squeezy — Premium is now active on this device.
          </p>
        )}
        <button className="btn btn-primary mt-4 w-full justify-center" type="submit" disabled={busy || !key.trim()}>
          {busy ? 'Verifying with Lemon Squeezy…' : 'Activate Premium'}
        </button>
      </form>

      <section className="panel mt-4 p-4">
        <h2 className="font-semibold text-white">No license key yet?</h2>
        <p className="mt-1 text-sm text-gray-400">
          Premium is a {formatPremiumDisplay(pricing.premium)} one-time purchase. After checkout, Lemon
          Squeezy emails you a license key you can enter above.
        </p>
        <button className="btn btn-primary mt-3 w-full justify-center" onClick={openCheckout}>
          Buy Premium → {formatPremiumDisplay(pricing.premium)}
        </button>
        <p className="mt-2 text-center text-xs text-gray-500">
          Secure checkout at Lemon Squeezy. {PRODUCT_NAME} never sees your card details.
        </p>
      </section>

      <p className="mt-4 text-sm text-gray-500">
        <Link to="/" className="text-accent-500 underline">← Back to {PRODUCT_NAME}</Link>
      </p>
    </div>
  );
}
