// src/app/api/buyers/import/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserFromCookies } from "@/lib/auth";
import { buyerCreateValidated, bhkUiToDb, timelineUiToDb, sourceUiToDb } from "@/utils/validation";
import { Buyer, Status } from "@prisma/client";
import { z } from "zod"; // CHANGE 1: Import z to infer error types

// CHANGE 2: Define a precise type for validation errors using Zod's inference.
// This replaces `errors: any` with a fully-typed structure.
interface RowError {
  row: number;
  errors: z.inferFlattenedErrors<typeof buyerCreateValidated>;
}

// CHANGE 3: Define a type for the incoming request payload.
// This prevents the `body` variable from being `any`.
interface ImportPayload {
  rows?: unknown[]; // Use `unknown` to enforce validation before use.
}


export async function POST(request: Request) {
  const user = await getCurrentUserFromCookies();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  // CHANGE 4: Type the incoming body and extract rows safely.
  // This replaces `const body = await request.json()` and `const rows: any[]`.
  const body: ImportPayload = await request.json();
  const rows = body.rows || [];

  if (!Array.isArray(rows)) return NextResponse.json({ error: "Invalid payload: 'rows' must be an array" }, { status: 400 });
  if (rows.length > 200) return NextResponse.json({ error: "Max 200 rows allowed" }, { status: 400 });

  // Server-side validate each row, build array of valid entries
  const valid: Omit<Buyer, "id" | "createdAt" | "updatedAt">[] = [];
  const errors: RowError[] = [];

  // Because `rows` is now `unknown[]`, the `r` parameter is correctly inferred as `unknown`.
  rows.forEach((r, i) => {
    // `safeParse` is designed to accept `unknown` input, so this works perfectly.
    const parsed = buyerCreateValidated.safeParse(r);
    if (!parsed.success) {
      errors.push({ row: i + 1, errors: parsed.error.flatten() });
    } else {
      // map enums
      valid.push({
        ...parsed.data,
        bhk: parsed.data.bhk ? bhkUiToDb(parsed.data.bhk) : null,
        timeline: timelineUiToDb(parsed.data.timeline),
        source: sourceUiToDb(parsed.data.source),
        ownerId: user.id,
        email: parsed.data.email || null,
        notes: parsed.data.notes || null,
        tags: parsed.data.tags || [],
        status: 'New' as Status,
        budgetMin: typeof parsed.data.budgetMin === 'number' ? parsed.data.budgetMin : null,
        budgetMax: typeof parsed.data.budgetMax === 'number' ? parsed.data.budgetMax : null,
      });

    }
  });

  if (errors.length) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  // Transactional insert
  const created = await prisma.$transaction(
    valid.map((v) =>
      prisma.buyer.create({
        data: v,
      })
    )
  );

  // create histories
  await prisma.$transaction(
    created.map((c: Buyer) =>
      prisma.buyerHistory.create({
        data: { buyerId: c.id, changedBy: user.email, diff: { op: "import_create", after: c } },
      })
    )
  );

  return NextResponse.json({ created: created.length });
}