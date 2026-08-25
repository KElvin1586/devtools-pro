import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEntitlement } from '../context/EntitlementContext';
import { loadPricing, formatPlanPrice, resolveUpgradeUrl, isInternalCheckout } from '../config/commercial';

/**
 * Shown whenever a locked premium feature is used. Never hides the feature —
 * every locked tool surfaces 🔒 PREMIUM and opens this modal.
 */
export function UpgradeModal() {
  const { upgradeModal, closeUpgradeModal, premium } = useEntitlement();
  const pricing = loadPricing();
  const upgradeUrl = resolveUpgradeUrl();
  const dialogRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!upgradeModal.open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeUpgradeModal();
    };
    document.addEventListener('keydown', onKey);
    dialogRef.current?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [upgradeModal.open, closeUpgradeModal]);

  if (!upgradeModal.open || premium) return null;

  const benefits = [
    'Advanced formatters & minifiers (HTML, CSS, JS, JSON minify)',
    'JSON ↔ CSV and other advanced converters',
    'Hash generator (MD5, SHA-1/256/384/512)',
    'Regex tester and JWT decoder',
    'Batch processing & export to file',
    'Tool history and saved favorite tools',
    'One-time purchase — yours forever',
  ];

  const goToCheckout = () => {
    closeUpgradeModal();
    if (isInternalCheckout(upgradeUrl)) {
      // '#…' → hash-router path
      navigate(upgradeUrl.replace(/^#/, '') || '/');
    } else {
      window.open(upgradeUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-title"
      aria-describedby="upgrade-desc"
      onClick={(e) => e.target === e.currentTarget && closeUpgradeModal()}
    >
      <div ref={dialogRef} tabIndex={-1} className="panel max-h-[90vh] w-full max-w-md overflow-y-auto p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <h2 id="upgrade-title" className="text-xl font-bold text-white">
            🔒 Upgrade to {pricing.premium.planName}
          </h2>
          <button className="btn-ghost btn" onClick={closeUpgradeModal} aria-label="Close dialog">
            ✕
          </button>
        </div>
        {upgradeModal.feature && (
          <p id="upgrade-desc" className="mt-2 text-sm text-gray-400">
            <span className="font-semibold text-gray-200">{upgradeModal.feature}</span> is a Premium feature.
          </p>
        )}
        <div className="mt-4 rounded-md bg-surface-900 p-4">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-accent-500">{formatPlanPrice(pricing.premium)}</span>
            <span className="text-sm text-gray-400">one-time</span>
          </div>
          <ul className="mt-3 space-y-1.5 text-sm text-gray-300">
            {benefits.map((b) => (
              <li key={b} className="flex gap-2">
                <span aria-hidden="true" className="text-green-400">✓</span>
                {b}
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-5 flex flex-col gap-2">
          <button className="btn btn-primary justify-center" onClick={goToCheckout}>
            Upgrade now → {formatPlanPrice(pricing.premium)}
          </button>
          <button
            className="btn justify-center"
            onClick={() => {
              closeUpgradeModal();
              navigate('/activate');
            }}
          >
            Already purchased? Enter license key
          </button>
          <button className="btn-ghost btn justify-center" onClick={closeUpgradeModal}>
            Maybe later
          </button>
        </div>
        <p className="mt-3 text-center text-xs text-gray-500">
          Secure checkout at Lemon Squeezy. After purchase you'll receive a license key to activate
          Premium. No payment is processed inside this app.
        </p>
      </div>
    </div>
  );
}
