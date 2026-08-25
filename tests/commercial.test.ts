import { describe, it, expect, beforeEach } from 'vitest';

// Minimal in-memory localStorage for the node test environment.
const store = new Map<string, string>();
(globalThis as Record<string, unknown>).localStorage = {
  getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
  setItem: (k: string, v: string) => void store.set(k, String(v)),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
};

import {
  FREE_PLAN,
  PREMIUM_PLAN,
  PREMIUM_PRICE,
  PREMIUM_CURRENCY,
  UPGRADE_URL,
  INTERNAL_CHECKOUT_URL,
  formatPrice,
  formatPlanPrice,
  isInternalCheckout,
  isSafeCheckoutUrl,
  loadPricing,
  resolveUpgradeUrl,
  savePremiumPricing,
} from '../src/config/commercial';
import { getPlan, setPlan, isPremium, getEntitlementSource } from '../src/lib/entitlements';

describe('commercial config', () => {
  beforeEach(() => localStorage.clear());

  it('free plan is always $0', () => {
    expect(FREE_PLAN.price).toBe(0);
    expect(formatPlanPrice(FREE_PLAN)).toBe('Free');
  });

  it('premium defaults to $9.99 USD one-time', () => {
    expect(PREMIUM_PRICE).toBe(9.99);
    expect(PREMIUM_CURRENCY).toBe('USD');
    expect(formatPlanPrice(PREMIUM_PLAN)).toBe('$9.99');
  });

  it('default upgrade URL is the internal checkout page, never a placeholder domain', () => {
    expect(UPGRADE_URL).toBe(INTERNAL_CHECKOUT_URL);
    expect(UPGRADE_URL).not.toMatch(/example\.(com|org|net)/);
    expect(resolveUpgradeUrl()).not.toMatch(/example\.(com|org|net)/);
  });

  it('formatPrice handles currencies', () => {
    expect(formatPrice(0, 'USD')).toBe('Free');
    expect(formatPrice(9.99, 'USD')).toBe('$9.99');
    expect(formatPrice(9.99, 'EUR')).toContain('9.99');
    // invalid currency falls back gracefully instead of throwing
    expect(formatPrice(5, 'XX')).toBe('5.00 XX');
  });

  it('accepts only safe checkout URLs', () => {
    expect(isSafeCheckoutUrl('#/checkout')).toBe(true);
    expect(isSafeCheckoutUrl('/checkout')).toBe(true);
    expect(isSafeCheckoutUrl('https://store.example-shop.io/buy')).toBe(true);
    expect(isSafeCheckoutUrl('http://192.168.1.10:8080/pay')).toBe(true);
    expect(isSafeCheckoutUrl('javascript:alert(1)')).toBe(false);
    expect(isSafeCheckoutUrl('data:text/html,<script>1</script>')).toBe(false);
    expect(isSafeCheckoutUrl('vbscript:x')).toBe(false);
    expect(isSafeCheckoutUrl('not a url')).toBe(false);
  });

  it('falls back to the internal checkout when a stored override is unsafe', () => {
    savePremiumPricing({ upgradeUrl: 'javascript:alert(1)' });
    expect(resolveUpgradeUrl()).toBe(INTERNAL_CHECKOUT_URL);
  });

  it('applies stored pricing overrides', () => {
    savePremiumPricing({ price: 19, currency: 'eur', upgradeUrl: 'https://payments.example-shop.io/p' });
    const { premium } = loadPricing();
    expect(premium.price).toBe(19);
    expect(premium.currency).toBe('EUR');
    expect(resolveUpgradeUrl()).toBe('https://payments.example-shop.io/p');
    expect(isInternalCheckout(resolveUpgradeUrl())).toBe(false);
  });
});

describe('entitlements', () => {
  beforeEach(() => localStorage.clear());

  it('defaults to free', () => {
    expect(getPlan()).toBe('free');
    expect(isPremium()).toBe(false);
  });

  it('activates premium in dev test mode (vitest runs with DEV=true)', () => {
    setPlan('premium', 'dev-test');
    expect(getPlan()).toBe('premium');
    expect(isPremium()).toBe(true);
    expect(getEntitlementSource()).toBe('dev-test');
    setPlan('free');
    expect(getPlan()).toBe('free');
  });

  it('migrates legacy plain-string premium records', () => {
    localStorage.setItem('devtools.entitlement', 'premium');
    expect(getPlan()).toBe('premium');
    expect(getEntitlementSource()).toBe('dev-test');
  });

  it('ignores malformed records', () => {
    localStorage.setItem('devtools.entitlement', '{"plan":"premium","source":"hacked"}');
    expect(getPlan()).toBe('free');
    localStorage.setItem('devtools.entitlement', '{not json');
    expect(getPlan()).toBe('free');
  });
});
