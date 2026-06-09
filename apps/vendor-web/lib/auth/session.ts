const COOKIE = "gomarket_auth";
const TTL = 30 * 24 * 60 * 60; // 30 days — mirrors refresh token TTL

export function setAuthSession(): void {
  document.cookie = `${COOKIE}=1; path=/; max-age=${TTL}; SameSite=Lax`;
}

export function clearAuthSession(): void {
  document.cookie = `${COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}
