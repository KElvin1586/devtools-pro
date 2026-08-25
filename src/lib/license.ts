/**
 * Lemon Squeezy license verification — the real, server-side verification
 * mechanism for Premium.
 *
 * Uses Lemon Squeezy's public License API:
 *   POST /v1/licenses/activate   { license_key, instance_name }
 *   POST /v1/licenses/validate   { license_key, instance_id }
 *   POST /v1/licenses/deactivate { license_key, instance_id }
 *
 * These endpoints are designed to be called from client applications
 * (desktop apps, browser apps): they require no API key and send
 * `Access-Control-Allow-Origin: *`, so they work from a static site.
 * The Lemon Squeezy *store* API key is NEVER used here and must never be
 * placed in VITE_* variables — license validation needs no credentials.
 *
 * Premium is granted only when Lemon Squeezy's servers confirm the license
 * key is valid, active, and matches this device's activation instance.
 */

const LS_API = 'https://api.lemonsqueezy.com/v1/licenses';

/** Activation instance name recorded in the Lemon Squeezy dashboard. */
const INSTANCE_NAME = 'devtools-pro-web';

export type LicenseStatus = 'active' | 'inactive' | 'expired' | 'disabled';

export interface LicenseRecord {
  /** The license key exactly as issued by Lemon Squeezy. */
  key: string;
  /** Activation instance id returned by /licenses/activate. */
  instanceId: string;
  /** Server-reported license status from the last successful check. */
  status: LicenseStatus;
  /** Customer email reported by Lemon Squeezy (display only). */
  customerEmail?: string;
  /** Timestamp (ms) of the last successful server validation. */
  validatedAt: number;
}

export type LicenseErrorCode =
  | 'invalid' // key not found
  | 'expired' // license exists but expired
  | 'revoked' // license disabled/refunded
  | 'inactive' // exists but never activated
  | 'limit' // activation limit reached
  | 'network'; // could not reach Lemon Squeezy

export interface LicenseError {
  code: LicenseErrorCode;
  message: string;
}

export type LicenseResult =
  | { ok: true; record: LicenseRecord }
  | { ok: false; error: LicenseError };

interface LsLicenseKeyPayload {
  status?: string;
  key?: string;
  expires_at?: string | null;
}

interface LsResponseBody {
  valid?: boolean;
  activated?: boolean;
  deactivated?: boolean;
  error?: string;
  license_key?: LsLicenseKeyPayload;
  instance?: { id?: string; name?: string };
  meta?: { customer_email?: string };
}

async function post(endpoint: string, params: Record<string, string>): Promise<LsResponseBody> {
  const res = await fetch(`${LS_API}/${endpoint}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(params).toString(),
  });
  // Lemon Squeezy returns 4xx for unknown keys but still sends a JSON body.
  return (await res.json()) as LsResponseBody;
}

function asStatus(raw: string | undefined): LicenseStatus {
  return raw === 'active' || raw === 'inactive' || raw === 'expired' || raw === 'disabled' ? raw : 'inactive';
}

/** Map a Lemon Squeezy response body to a user-facing error. Pure function. */
export function mapLicenseError(body: LsResponseBody): LicenseError {
  const serverMsg = (body.error ?? '').toLowerCase();

  if (serverMsg.includes('not found') || serverMsg.includes('invalid')) {
    return {
      code: 'invalid',
      message: 'This license key was not found. Check for typos — copy the key exactly from your purchase email.',
    };
  }
  if (serverMsg.includes('limit')) {
    return {
      code: 'limit',
      message: 'This license key has reached its activation limit. Deactivate it on another device first.',
    };
  }
  // Status-based errors only apply when the server actually returned a license object.
  if (body.license_key) {
    const status = asStatus(body.license_key.status);
    if (status === 'expired') {
      return { code: 'expired', message: 'This license has expired. Contact support or purchase a new license.' };
    }
    if (status === 'disabled') {
      return { code: 'revoked', message: 'This license has been revoked or refunded and is no longer valid.' };
    }
    if (status === 'inactive') {
      return { code: 'inactive', message: 'This license exists but is not active yet. Try activating it again.' };
    }
  }
  return {
    code: 'invalid',
    message: body.error || 'The license could not be verified. Please try again.',
  };
}

function networkError(): LicenseError {
  return {
    code: 'network',
    message: 'Could not reach the license server. Check your internet connection and try again.',
  };
}

function isExpired(body: LsResponseBody): boolean {
  const exp = body.license_key?.expires_at;
  return typeof exp === 'string' && exp.length > 0 && new Date(exp).getTime() < Date.now();
}

/**
 * Activate a license key on this device. Creates an activation instance in
 * Lemon Squeezy; the returned instance id is stored locally and required for
 * all future validations on this device.
 */
export async function activateLicense(licenseKey: string): Promise<LicenseResult> {
  const key = licenseKey.trim();
  if (!key) return { ok: false, error: { code: 'invalid', message: 'Enter your license key first.' } };
  try {
    const body = await post('activate', { license_key: key, instance_name: INSTANCE_NAME });
    if (body.activated === true && body.license_key?.status === 'active' && body.instance?.id) {
      return {
        ok: true,
        record: {
          key,
          instanceId: body.instance.id,
          status: 'active',
          customerEmail: body.meta?.customer_email,
          validatedAt: Date.now(),
        },
      };
    }
    return { ok: false, error: mapLicenseError(body) };
  } catch {
    return { ok: false, error: networkError() };
  }
}

/**
 * Re-validate a stored license against Lemon Squeezy's servers. Called on
 * every app load so a revoked, refunded or expired license stops working.
 * Returns ok:false with code 'network' when the server is unreachable — the
 * caller decides the grace policy for offline use.
 */
export async function validateLicense(record: LicenseRecord): Promise<LicenseResult> {
  try {
    const body = await post('validate', { license_key: record.key, instance_id: record.instanceId });
    const status = asStatus(body.license_key?.status);
    if (body.valid === true && status === 'active' && !isExpired(body)) {
      return {
        ok: true,
        record: { ...record, status, customerEmail: body.meta?.customer_email ?? record.customerEmail, validatedAt: Date.now() },
      };
    }
    return { ok: false, error: mapLicenseError({ ...body, license_key: { ...body.license_key, status } }) };
  } catch {
    return { ok: false, error: networkError() };
  }
}

/** Deactivate this device's activation instance (frees the seat). Best effort. */
export async function deactivateLicense(record: LicenseRecord): Promise<boolean> {
  try {
    const body = await post('deactivate', { license_key: record.key, instance_id: record.instanceId });
    return body.deactivated === true;
  } catch {
    return false;
  }
}
