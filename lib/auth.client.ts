// lib/auth.client.ts
export const COOKIE_NAME = "esahayak_user";

export function getCurrentUserFromClientCookie() {
  if (typeof document === "undefined") return null;

  const match = document.cookie.match(
    new RegExp("(^| )" + COOKIE_NAME + "=([^;]+)")
  );
  if (!match) return null;

  try {
    return JSON.parse(decodeURIComponent(match[2])) as {
      id: string;
      email: string;
    };
  } catch {
    return null;
  }
}
