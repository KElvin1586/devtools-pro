import { describe, it, expect } from 'vitest';
import { FREE_PLAN, PREMIUM_PLAN, formatPrice } from '../src/config/pricing';

describe('pricing config', () => {
  it('free plan is $0', () => {
    expect(FREE_PLAN.priceUsd).toBe(0);
    expect(formatPrice(FREE_PLAN)).toBe('Free');
  });
  it('premium defaults to $9.99 one-time', () => {
    expect(PREMIUM_PLAN.priceUsd).toBe(9.99);
    expect(formatPrice(PREMIUM_PLAN)).toBe('$9.99 USD');
  });
  it('premium has a configurable upgrade URL', () => {
    expect(PREMIUM_PLAN.upgradeUrl).toMatch(/^https:\/\//);
  });
});
