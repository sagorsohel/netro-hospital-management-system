/**
 * Pages a restricted role may open. Roles not listed here keep full routing
 * (the sidebar already filters their menu).
 */
const RESTRICTED_ROLE_PATHS: Record<string, string[]> = {
  // Shareholders: their own shares (home) + hospital expenses & equipment, all view-only
  shareholder: ['/my-shares', '/expenses', '/equipment'],
};

const normalize = (role?: string | null) => (role || '').toLowerCase();

export const isRestrictedRole = (role?: string | null) => normalize(role) in RESTRICTED_ROLE_PATHS;

export const homePathForRole = (role?: string | null): string =>
  RESTRICTED_ROLE_PATHS[normalize(role)]?.[0] ?? '/dashboard';

export const isPathAllowedForRole = (role: string | null | undefined, pathname: string): boolean => {
  const allowed = RESTRICTED_ROLE_PATHS[normalize(role)];
  if (!allowed) return true;
  // exact page only — no /expenses/new, /expenses/edit/...
  return allowed.includes(pathname.replace(/\/+$/, '') || '/');
};
