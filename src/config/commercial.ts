/**
 * Centralized commercial configuration for DevTools Pro — the single source
 * of truth for plan names, pricing and the upgrade (checkout) destination.
 *
 * Resolution order for each value:
 *   1. Runtime override saved from the Settings page (localStorage)
 *   2. Build-time environment variables:
 *        VITE_PREMIUM_PRICE, VITE_PREMIUM_CURRENCY, VITE_UPGRADE_URL
 *   3. Built-in defaults below
 *
 * There is intentionally NO payment processing inside this app. UPGRADE_URL
 * points to the real Lemon Squeezy checkout (LEMONSQUEEZY_CHECKOUT_URL);
 * purchases are verified via Lemon Squeezy's License API (src/lib/license.ts).
 * The app's own internal checkout page (#/checkout) remains only as a safe
 * fallback for self-hosted builds and states clearly that no payment is
 * processed there.
 */

export const PRODUCT_NAME = 'DevTools Pro';

/** Free tier price. Always zero. */
export const FREE_PRICE = 0;

/**
 * Premium one-time price. The Lemon Squeezy product is priced in KES
 * (Kenyan Shillings); buyers in other countries are shown an automatic
 * converted price at checkout by Lemon Squeezy.
 */
export const PREMIUM_PRICE = parsePrice(import.meta.env.VITE_PREMIUM_PRICE) ?? 1299;

/** ISO 4217 currency code used for the premium price. */
export const PREMIUM_CURRENCY = (import.meta.env.VITE_PREMIUM_CURRENCY ?? 'KES').toUpperCase();

/**
 * Approximate USD equivalent of the KES price, shown alongside it for
 * international buyers (Lemon Squeezy converts automatically at checkout).
 */
export const PREMIUM_PRICE_USD_EQUIVALENT = parsePrice(import.meta.env.VITE_PREMIUM_PRICE_USD) ?? 10.04;

/**
 * Route of the app's internal checkout page. Kept only as a safe fallback
 * for self-hosted builds that override the upgrade URL; the production
 * default below points at the real Lemon Squeezy checkout.
 */
export const INTERNAL_CHECKOUT_URL = '#/checkout';

/**
 * The real Lemon Squeezy checkout for Premium (production default).
 * Customers pay there and receive a license key, which they activate inside
 * the app (#/activate). The key is verified against Lemon Squeezy's License
 * API before Premium unlocks — see src/lib/license.ts.
 */
export const LEMONSQUEEZY_CHECKOUT_URL =
  'https://kelvindigitaltools.lemonsqueezy.com/checkout/buy/5a9a0680-dbb4-4c1b-b38c-02c8bbd20fe1';

/**
 * Where the "Upgrade" button sends users: VITE_UPGRADE_URL at build time,
 * else the real Lemon Squeezy checkout. The internal page is only a
 * deliberate self-hosting override.
 */
export const UPGRADE_URL: string = import.meta.env.VITE_UPGRADE_URL || LEMONSQUEEZY_CHECKOUT_URL;

function parsePrice(raw: unknown): number | null {
  const n = typeof raw === 'number' ? raw : typeof raw === 'string' ? Number(raw) : NaN;
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export interface PlanPricing {
  planName: string;
  /** One-time price in `currency`. 0 means free. */
  price: number;
  currency: string;
}

export const FREE_PLAN: PlanPricing = {
  planName: 'Free',
  price: FREE_PRICE,
  currency: PREMIUM_CURRENCY,
};

export const PREMIUM_PLAN: PlanPricing = {
  planName: 'Premium',
  price: PREMIUM_PRICE,
  currency: PREMIUM_CURRENCY,
};

const PRICING_KEY = 'devtools.pricing';

interface PricingOverride {
  price?: number;
  currency?: string;
  upgradeUrl?: string;
}

function loadOverride(): PricingOverride {
  try {
    const raw = localStorage.getItem(PRICING_KEY);
    if (raw) return JSON.parse(raw) as PricingOverride;
  } catch {
    // ignore malformed overrides
  }
  return {};
}

/** Effective premium pricing after runtime overrides. */
export function loadPricing(): { free: PlanPricing; premium: PlanPricing } {
  const o = loadOverride();
  return {
    free: FREE_PLAN,
    premium: {
      planName: PREMIUM_PLAN.planName,
      price: parsePrice(o.price) ?? PREMIUM_PRICE,
      currency: (o.currency ?? PREMIUM_CURRENCY).toUpperCase(),
    },
  };
}

/** Effective checkout URL: runtime override → build-time env → internal page. Unsafe URLs are rejected. */
export function resolveUpgradeUrl(): string {
  const candidate = loadOverride().upgradeUrl || UPGRADE_URL;
  return isSafeCheckoutUrl(candidate) ? candidate : INTERNAL_CHECKOUT_URL;
}

export function savePremiumPricing(update: PricingOverride): void {
  try {
    localStorage.setItem(PRICING_KEY, JSON.stringify(update));
  } catch {
    // storage unavailable — overrides stay in-memory only
  }
}

/** True when the checkout destination is the app's own internal page (not an external store). */
export function isInternalCheckout(url: string): boolean {
  return url.startsWith('#') || url.startsWith('/');
}

/**
 * Only http(s) and app-internal URLs may be used as checkout destinations.
 * Blocks javascript:/data:/vbscript: injection through stored overrides.
 */
export function isSafeCheckoutUrl(url: string): boolean {
  const t = url.trim();
  if (isInternalCheckout(t)) return true;
  try {
    const parsed = new URL(t);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

/** Format a one-time price for display; returns "Free" for zero. */
export function formatPrice(price: number, currency: string): string {
  if (price <= 0) return 'Free';
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(price);
  } catch {
    return `${price.toFixed(2)} ${currency}`;
  }
}

export function formatPlanPrice(plan: PlanPricing): string {
  return formatPrice(plan.price, plan.currency);
}

/**
 * Approximate USD equivalent of a non-USD plan price (e.g. "$10.04"),
 * or null when not applicable. Used to show a secondary hint next to KES.
 */
export function premiumUsdHint(plan: PlanPricing = PREMIUM_PLAN): string | null {
  if (plan.price <= 0 || plan.currency === 'USD') return null;
  return formatPrice(PREMIUM_PRICE_USD_EQUIVALENT, 'USD');
}

/**
 * Display the premium price with its approximate USD equivalent when the
 * primary currency is not USD, e.g. "KES 1,299.00 (≈ $10.04)".
 */
export function formatPremiumDisplay(plan: PlanPricing = PREMIUM_PLAN): string {
  const primary = formatPlanPrice(plan);
  const hint = premiumUsdHint(plan);
  return hint ? `${primary} (≈ ${hint})` : primary;
}
