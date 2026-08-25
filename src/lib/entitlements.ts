/**
 * Centralized FREE | PREMIUM entitlement system.
 *
 * Every premium gate in the app flows through `useEntitlement()` so there is
 * exactly one source of truth. The record persisted to localStorage contains
 * a Lemon Squeezy license key + activation instance id — it is NOT a trusted
 * "premium: true" flag:
 *
 *  - production premium exists only as source 'provider', backed by a license
 *    record that is re-validated against Lemon Squeezy's servers on every app
 *    load (see EntitlementContext). A revoked, refunded, expired or forged
 *    record is downgraded to free as soon as the server answers;
 *  - editing localStorage with a made-up key cannot unlock Premium: the first
 *    server validation fails and the record is discarded;
 *  - development/test activation is source 'dev-test' and is honored ONLY in
 *    development builds (import.meta.env.DEV), so a test activation can never
 *    leak into production.
 */

import { DEV_TEST_MODE } from './devmode';
import type { LicenseRecord } from './license';

export type Plan = 'free' | 'premium';
export type EntitlementSource = 'dev-test' | 'provider';

const ENTITLEMENT_KEY = 'devtools.entitlement';

export interface EntitlementRecord {
  plan: Plan;
  source: EntitlementSource;
  license?: LicenseRecord;
}

function loadRecord(): EntitlementRecord | null {
  try {
    const raw = localStorage.getItem(ENTITLEMENT_KEY);
    if (!raw) return null;
    // Legacy formats: plain string 'premium' or a dev-test record — only
    // ever honored in development builds.
    if (raw === 'premium') return { plan: 'premium', source: 'dev-test' };
    const parsed = JSON.parse(raw) as Partial<EntitlementRecord>;
    if (parsed.plan !== 'premium') return null;
    if (parsed.source === 'dev-test') return { plan: 'premium', source: 'dev-test' };
    if (
      parsed.source === 'provider' &&
      parsed.license &&
      typeof parsed.license.key === 'string' &&
      typeof parsed.license.instanceId === 'string' &&
      parsed.license.status === 'active'
    ) {
      return { plan: 'premium', source: 'provider', license: parsed.license };
    }
  } catch {
    // storage unavailable or malformed — fall through to free
  }
  return null;
}

/**
 * Pure entitlement resolution. Exported (with the dev-test flag as a
 * parameter) so the production rule — dev-test records are NEVER honored
 * outside development builds — is directly testable.
 */
export function resolvePlan(record: EntitlementRecord | null, devTestMode: boolean): Plan {
  if (!record) return 'free';
  // A test-mode premium is honored only in development builds.
  if (record.source === 'dev-test') return devTestMode ? 'premium' : 'free';
  // Provider premium additionally requires a last-known-active license.
  return record.license?.status === 'active' ? 'premium' : 'free';
}

export function getPlan(): Plan {
  return resolvePlan(loadRecord(), DEV_TEST_MODE);
}

export function getEntitlementSource(): EntitlementSource | null {
  return loadRecord()?.source ?? null;
}

/** The stored license record, if premium comes from a real purchase. */
export function getLicense(): LicenseRecord | null {
  return loadRecord()?.license ?? null;
}

export function setPlan(plan: Plan, source: EntitlementSource = 'dev-test', license?: LicenseRecord): void {
  try {
    if (plan === 'free') {
      localStorage.removeItem(ENTITLEMENT_KEY);
    } else {
      localStorage.setItem(ENTITLEMENT_KEY, JSON.stringify({ plan, source, license }));
    }
  } catch {
    // storage unavailable (private mode) — entitlement stays in-memory only
  }
}

/** Refresh the stored license after a successful server re-validation. */
export function updateLicense(license: LicenseRecord): void {
  setPlan('premium', 'provider', license);
}

export function isPremium(): boolean {
  return getPlan() === 'premium';
}
