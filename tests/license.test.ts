import { describe, it, expect, beforeEach } from 'vitest';

// Minimal in-memory localStorage for the node test environment.
const store = new Map<string, string>();
(globalThis as Record<string, unknown>).localStorage = {
  getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
  setItem: (k: string, v: string) => void store.set(k, String(v)),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
};

import { mapLicenseError } from '../src/lib/license';
import { getPlan, getLicense, setPlan, updateLicense, isPremium, resolvePlan } from '../src/lib/entitlements';
import type { LicenseRecord } from '../src/lib/license';

const ACTIVE_LICENSE: LicenseRecord = {
  key: '11111111-2222-3333-4444-555555555555',
  instanceId: 'inst-abc',
  status: 'active',
  validatedAt: Date.now(),
};

describe('mapLicenseError', () => {
  it('maps "not found" server errors to invalid', () => {
    const err = mapLicenseError({ valid: false, error: 'license_key not found.' });
    expect(err.code).toBe('invalid');
    expect(err.message).toMatch(/not found/i);
  });

  it('maps activation-limit errors', () => {
    const err = mapLicenseError({ activated: false, error: 'This license key has reached the activation limit.' });
    expect(err.code).toBe('limit');
  });

  it('maps expired status', () => {
    const err = mapLicenseError({ valid: false, license_key: { status: 'expired' } });
    expect(err.code).toBe('expired');
  });

  it('maps disabled (refunded/revoked) status', () => {
    const err = mapLicenseError({ valid: false, license_key: { status: 'disabled' } });
    expect(err.code).toBe('revoked');
  });

  it('maps inactive status', () => {
    const err = mapLicenseError({ valid: false, license_key: { status: 'inactive' } });
    expect(err.code).toBe('inactive');
  });

  it('falls back to the server message for unknown failures', () => {
    const err = mapLicenseError({ valid: false, error: 'Something unusual happened.' });
    expect(err.code).toBe('invalid');
    expect(err.message).toBe('Something unusual happened.');
  });
});

describe('license-based entitlements', () => {
  beforeEach(() => store.clear());

  it('is free by default', () => {
    expect(getPlan()).toBe('free');
    expect(isPremium()).toBe(false);
    expect(getLicense()).toBeNull();
  });

  it('a provider record with an active license grants premium', () => {
    setPlan('premium', 'provider', ACTIVE_LICENSE);
    expect(getPlan()).toBe('premium');
    expect(getLicense()?.key).toBe(ACTIVE_LICENSE.key);
  });

  it('a provider record without an active license does NOT grant premium', () => {
    setPlan('premium', 'provider', { ...ACTIVE_LICENSE, status: 'expired' });
    expect(getPlan()).toBe('free');
    // forged record shape missing instanceId → free
    store.set('devtools.entitlement', JSON.stringify({ plan: 'premium', source: 'provider', license: { key: 'x' } }));
    expect(getPlan()).toBe('free');
  });

  it('dev-test and legacy records NEVER grant premium in production mode', () => {
    // Production rule, asserted directly: with devTestMode=false every
    // dev-test-shaped record resolves to free.
    expect(resolvePlan({ plan: 'premium', source: 'dev-test' }, false)).toBe('free');
    // A bare legacy string parses to the same dev-test record → free in prod.
    store.set('devtools.entitlement', 'premium');
    expect(resolvePlan({ plan: 'premium', source: 'dev-test' }, false)).toBe('free');
    // In development mode the same record grants premium (test toggle).
    expect(resolvePlan({ plan: 'premium', source: 'dev-test' }, true)).toBe('premium');
  });

  it('provider records require an active license in both modes', () => {
    const expired = { plan: 'premium' as const, source: 'provider' as const, license: { ...ACTIVE_LICENSE, status: 'expired' as const } };
    expect(resolvePlan(expired, false)).toBe('free');
    expect(resolvePlan(expired, true)).toBe('free');
    const active = { plan: 'premium' as const, source: 'provider' as const, license: ACTIVE_LICENSE };
    expect(resolvePlan(active, false)).toBe('premium');
  });

  it('updateLicense refreshes the stored record', () => {
    setPlan('premium', 'provider', ACTIVE_LICENSE);
    const updated = { ...ACTIVE_LICENSE, validatedAt: Date.now() + 1000 };
    updateLicense(updated);
    expect(getLicense()?.validatedAt).toBe(updated.validatedAt);
    expect(getPlan()).toBe('premium');
  });

  it('downgrade clears everything', () => {
    setPlan('premium', 'provider', ACTIVE_LICENSE);
    setPlan('free');
    expect(getPlan()).toBe('free');
    expect(getLicense()).toBeNull();
  });
});
