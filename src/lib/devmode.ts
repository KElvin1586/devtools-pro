/**
 * Development-only Premium test mode.
 *
 * `import.meta.env.DEV` is statically replaced by Vite at build time, so in
 * production builds every code path guarded by `DEV_TEST_MODE` is dead code
 * and is removed by the bundler. The test-mode toggle therefore cannot be
 * reached in production.
 *
 * Rules enforced here:
 *  - the test mode never processes or claims a real payment;
 *  - it never stores credentials or secrets — only a plan flag in
 *    localStorage, clearly marked with source 'dev-test';
 *  - a premium entitlement granted by the test mode is honored ONLY in
 *    development builds (see lib/entitlements.ts).
 */

/** True only in development builds (`vite dev` / `vitest`). */
export const DEV_TEST_MODE: boolean = import.meta.env.DEV;
