// src/app/layout.tsx
import Link from "next/link";
import "./globals.css";

export const metadata = {
  title: "Buyer Leads",
  description: "Mini Buyer Lead Intake app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{
          background: "#f3f4f4",
          color: "#040506",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        <div className="min-h-screen">
          <header
            className="p-4 border-b"
            style={{ background: "#1b262c", color: "#fff" }}
          >
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              <h1 className="text-xl font-semibold">Buyer Leads</h1>
              <nav>
                <Link href="/buyers" className="mr-4">
                  Leads
                </Link>
                <Link href="/buyers/new" className="mr-4">
                  New
                </Link>
                <Link href="/login">Login</Link>
              </nav>
            </div>
          </header>

          <main className="max-w-6xl mx-auto p-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
