// src/app/login/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("demo@example.com");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email }),
      headers: { "Content-Type": "application/json" },
    });
    setLoading(false);
    if (res.ok) {
      router.push("/buyers");
    } else {
      alert("Login failed");
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl mb-4">Demo login</h2>
      <form onSubmit={handleLogin}>
        <label className="block mb-2">
          <span>Email</span>
          <input
            className="w-full p-2 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            aria-label="email"
            required
          />
        </label>
        <button
          className="px-4 py-2 rounded bg-[#3282b8] text-white"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign in (demo)"}
        </button>
      </form>
    </div>
  );
}
