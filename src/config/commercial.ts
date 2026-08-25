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
 * must point to a real checkout you operate (Stripe Payment Link, Lemon
 * Squeezy, Gumroad, …). Until one is configured it falls back to the app's
 * own internal checkout page (#/checkout), which states clearly that no
 * payment is processed there.
 */

export const PRODUCT_NAME = 'DevTools Pro';

/** Free tier price. Always zero. */
export const FREE_PRICE = 0;

/** Premium one-time price (minor units are cents). */
export const PREMIUM_PRICE = parsePrice(import.meta.env.VITE_PREMIUM_PRICE) ?? 9.99;

/** ISO 4217 currency code used for the premium price. */
export const PREMIUM_CURRENCY = (import.meta.env.VITE_PREMIUM_CURRENCY ?? 'USD').toUpperCase();

/**
 * Route of the app's internal checkout page. Used as the default upgrade
 * destination in development and as a safe fallback in production until a
 * real payment provider URL is configured.
 */
export const INTERNAL_CHECKOUT_URL = '#/checkout';

/**
 * Where the "Upgrade" button sends users. Configure a real checkout URL via
 * VITE_UPGRADE_URL at build time or the Settings page at runtime.
 */
export const UPGRADE_URL: string = import.meta.env.VITE_UPGRADE_URL || INTERNAL_CHECKOUT_URL;

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
