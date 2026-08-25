/**
 * Centralized FREE | PREMIUM entitlement system.
 *
 * Every premium gate in the app flows through `useEntitlement()` so there is
 * exactly one source of truth. Entitlement is persisted to localStorage.
 *
 * There is deliberately NO fake payment or license-key system:
 *  - development/test activation is source 'dev-test' and is honored ONLY in
 *    development builds (import.meta.env.DEV), so a test activation can never
 *    leak into production;
 *  - production activation is reserved for a future real payment provider
 *    (source 'provider'), wired up via configuration — not implemented here.
 */

import { DEV_TEST_MODE } from './devmode';

export type Plan = 'free' | 'premium';
export type EntitlementSource = 'dev-test' | 'provider';

const ENTITLEMENT_KEY = 'devtools.entitlement';

interface EntitlementRecord {
  plan: Plan;
  source: EntitlementSource;
}

function loadRecord(): EntitlementRecord | null {
  try {
    const raw = localStorage.getItem(ENTITLEMENT_KEY);
    if (!raw) return null;
    // Legacy format: plain string 'premium' written by older local builds.
    if (raw === 'premium') return { plan: 'premium', source: 'dev-test' };
    const parsed = JSON.parse(raw) as Partial<EntitlementRecord>;
    if (parsed.plan === 'premium' && (parsed.source === 'dev-test' || parsed.source === 'provider')) {
      return { plan: 'premium', source: parsed.source };
    }
  } catch {
    // storage unavailable or malformed — fall through to free
  }
  return null;
}

export function getPlan(): Plan {
  const record = loadRecord();
  if (!record) return 'free';
  // A test-mode premium is honored only in development builds.
  if (record.source === 'dev-test') return DEV_TEST_MODE ? 'premium' : 'free';
  return record.plan;
}

export function getEntitlementSource(): EntitlementSource | null {
  return loadRecord()?.source ?? null;
}

export function setPlan(plan: Plan, source: EntitlementSource = 'dev-test'): void {
  try {
    if (plan === 'free') {
      localStorage.removeItem(ENTITLEMENT_KEY);
    } else {
      localStorage.setItem(ENTITLEMENT_KEY, JSON.stringify({ plan, source }));
    }
  } catch {
    // storage unavailable (private mode) — entitlement stays in-memory only
  }
}

export function isPremium(): boolean {
  return getPlan() === 'premium';
}
