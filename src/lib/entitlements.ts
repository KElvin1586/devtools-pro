/**
 * Centralized FREE | PREMIUM entitlement system.
 *
 * Every premium gate in the app flows through `useEntitlement()` so there is
 * exactly one source of truth. Entitlement is persisted to localStorage.
 *
 * There is deliberately NO fake payment or license-key system: upgrading is
 * handled by an external checkout (see config/pricing.ts). For local
 * evaluation a manual activation toggle lives in Settings.
 */

export type Plan = 'free' | 'premium';

const ENTITLEMENT_KEY = 'devtools.entitlement';

export function getPlan(): Plan {
  try {
    return localStorage.getItem(ENTITLEMENT_KEY) === 'premium' ? 'premium' : 'free';
  } catch {
    return 'free';
  }
}

export function setPlan(plan: Plan): void {
  try {
    localStorage.setItem(ENTITLEMENT_KEY, plan);
  } catch {
    // storage unavailable (private mode) — entitlement stays in-memory only
  }
}

export function isPremium(): boolean {
  return getPlan() === 'premium';
}
