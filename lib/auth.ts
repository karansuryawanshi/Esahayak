
// // src/lib/auth.ts
// import { cookies } from "next/headers";

// import { prisma } from "./prisma";
// import { NextResponse } from "next/server";


// export const COOKIE_NAME = "esahayak_user";
// const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// export async function loginDemoUser(email: string, name?: string) {
//   // create or find user
//   let user = await prisma.user.findUnique({ where: { email } });
//   if (!user) {
//     user = await prisma.user.create({ data: { email, name } });
//   }

//   // set cookie server-side (called inside route handler)
//   const res = NextResponse.json({ success: true });
//   res.cookies.set({
//     name: COOKIE_NAME,
//     value: JSON.stringify({ id: user.id, email: user.email }),
//     httpOnly: true,
//     sameSite: "strict",
//     path: "/",
//     maxAge: COOKIE_MAX_AGE,
//   });

//   return user;
// }
// export async function logout() {
//   const res = NextResponse.json({ success: true });
//   res.cookies.set({
//     name: COOKIE_NAME,
//     value: "",
//     httpOnly: true,
//     sameSite: "strict",
//     path: "/",
//     maxAge: 0,
//   });
//   return res;
// }

// export async function getCurrentUserFromCookies() {
//   const cookieStore = await cookies(); // await it if your version returns a Promise
//   const cookie = cookieStore.get(COOKIE_NAME); 
//   console.log("cookie Executed", cookie)
//   if (!cookie) return null;

//   try {
//     return JSON.parse(cookie.value) as { id: string; email: string };
//   } catch {
//     return null;
//   }
// }

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
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);
  console.log("cookie Executed", cookie);
  if (!cookie) return null;

  try {
    return JSON.parse(cookie.value) as { id: string; email: string };
  } catch {
    return null;
  }
}
