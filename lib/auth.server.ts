// lib/auth.server.ts
import { cookies } from "next/headers";
import { prisma } from "./prisma";

export const COOKIE_NAME = "esahayak_user";

export async function loginDemoUser(email: string, name?: string) {
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({ data: { email, name } });
  }
  return user;
}

export async function getCurrentUserFromCookies() {
  const cookieStore = await cookies(); // ✅ no await needed
  const cookie = cookieStore.get(COOKIE_NAME);

  if (!cookie) return null;

  try {
    return JSON.parse(cookie.value) as { id: string; email: string };
  } catch {
    return null;
  }
}
