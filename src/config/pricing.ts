/**
 * Commercial configuration for DevTools Pro.
 *
 * The upgrade URL and price are intentionally configurable so distributors
 * can point the checkout at their own store without touching app logic.
 */
export interface PricingConfig {
  planName: string;
  /** One-time price in USD. `null` means free. */
  priceUsd: number | null;
  /** External checkout page users are sent to when upgrading. */
  upgradeUrl: string;
  currency: string;
}

export const FREE_PLAN: PricingConfig = {
  planName: 'Free',
  priceUsd: 0,
  upgradeUrl: '',
  currency: 'USD',
};

export const PREMIUM_PLAN: PricingConfig = {
  planName: 'Premium',
  // Default one-time price; override via localStorage key `devtools.pricing`.
  priceUsd: 9.99,
  upgradeUrl: 'https://example.com/checkout/devtools-pro',
  currency: 'USD',
};

const PRICING_KEY = 'devtools.pricing';

/** Load saved pricing overrides (used for admin configuration). */
export function loadPricing(): { free: PricingConfig; premium: PricingConfig } {
  try {
    const raw = localStorage.getItem(PRICING_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<{ premium: Partial<PricingConfig> }>;
      return {
        free: FREE_PLAN,
        premium: { ...PREMIUM_PLAN, ...(parsed.premium ?? {}) },
      };
    }
  } catch {
    // ignore malformed overrides
  }
  return { free: FREE_PLAN, premium: PREMIUM_PLAN };
}

export function savePremiumPricing(update: Partial<PricingConfig>): void {
  localStorage.setItem(PRICING_KEY, JSON.stringify({ premium: update }));
}

export function formatPrice(config: PricingConfig): string {
  if (config.priceUsd === null || config.priceUsd === 0) return 'Free';
  return `$${config.priceUsd.toFixed(2)} ${config.currency}`;
}
