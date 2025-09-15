// src/app/api/buyers/import/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserFromCookies } from "@/lib/auth";
import { buyerCreateValidated, bhkUiToDb, timelineUiToDb, sourceUiToDb } from "@/utils/validation";
import { Buyer } from "@prisma/client";

interface RowError {
  row: number;
  errors: any;
}

export async function POST(request: Request) {
  const user = await getCurrentUserFromCookies();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await request.json();
  const rows: any[] = body.rows || [];

  if (!Array.isArray(rows)) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  if (rows.length > 200) return NextResponse.json({ error: "Max 200 rows allowed" }, { status: 400 });

  // Server-side validate each row, build array of valid entries
  const valid: Omit<Buyer, "id" | "createdAt" | "updatedAt">[] = [];
  const errors: RowError[] = [];

  rows.forEach((r, i) => {
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