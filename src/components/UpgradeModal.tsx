import { useEffect, useRef } from 'react';
import { useEntitlement } from '../context/EntitlementContext';
import { loadPricing, formatPrice } from '../config/pricing';

/**
 * Shown whenever a locked premium feature is used. Never hides the feature —
 * every locked tool surfaces 🔒 PREMIUM and opens this modal.
 */
export function UpgradeModal() {
  const { upgradeModal, closeUpgradeModal, premium } = useEntitlement();
  const pricing = loadPricing();
  const dialogRef = useRef<HTMLDivElement>(null);

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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-title"
      onClick={(e) => e.target === e.currentTarget && closeUpgradeModal()}
    >
      <div ref={dialogRef} tabIndex={-1} className="panel w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <h2 id="upgrade-title" className="text-xl font-bold text-white">
            🔒 Upgrade to {pricing.premium.planName}
          </h2>
          <button className="btn-ghost btn" onClick={closeUpgradeModal} aria-label="Close dialog">
            ✕
          </button>
        </div>
        {upgradeModal.feature && (
          <p className="mt-2 text-sm text-gray-400">
            <span className="font-semibold text-gray-200">{upgradeModal.feature}</span> is a Premium feature.
          </p>
        )}
        <div className="mt-4 rounded-md bg-surface-900 p-4">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-accent-500">{formatPrice(pricing.premium)}</span>
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
          <a
            href={pricing.premium.upgradeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary justify-center"
          >
            Upgrade now → {formatPrice(pricing.premium)}
          </a>
          <button className="btn justify-center" onClick={closeUpgradeModal}>
            Maybe later
          </button>
        </div>
        <p className="mt-3 text-center text-xs text-gray-500">
          Already purchased? Activate your license from Settings.
        </p>
      </div>
    </div>
  );
}
