import { NextResponse } from "next/server";
import { loginDemoUser, COOKIE_NAME } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json();
  const email: string = body.email;
  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  const user = await loginDemoUser(email);

  const res = NextResponse.json({
    ok: true,
    user: { id: user.id, email: user.email },
  });

  res.cookies.set({
    name: COOKIE_NAME,
    value: JSON.stringify({ id: user.id, email: user.email }),
    httpOnly: true,
    sameSite: "strict",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return res;
}
