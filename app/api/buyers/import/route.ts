// src/app/api/buyers/import/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserFromCookies } from "@/lib/auth";
import { buyerCreateValidated, bhkUiToDb, timelineUiToDb, sourceUiToDb } from "@/utils/validation";

export async function POST(request: Request) {
  const user = await getCurrentUserFromCookies();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await request.json();
  const rows: any[] = body.rows || [];

  if (!Array.isArray(rows)) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  if (rows.length > 200) return NextResponse.json({ error: "Max 200 rows allowed" }, { status: 400 });

  // Server-side validate each row, build array of valid entries
  const valid: any[] = [];
  const errors: Array<{ row: number; errors: any }> = [];

  rows.forEach((r, i) => {
    const parsed = buyerCreateValidated.safeParse(r);
    if (!parsed.success) {
      errors.push({ row: i + 1, errors: parsed.error.flatten() });
    } else {
      // map enums
      valid.push({
        ...parsed.data,
        bhk: parsed.data.bhk ? bhkUiToDb(parsed.data.bhk as any) : null,
        timeline: timelineUiToDb(parsed.data.timeline as any),
        source: sourceUiToDb(parsed.data.source as any),
        ownerId: user.id
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
        data: {
          fullName: v.fullName,
          email: v.email || null,
          phone: v.phone,
          city: v.city,
          propertyType: v.propertyType,
          bhk: v.bhk as any,
          purpose: v.purpose,
          budgetMin: v.budgetMin,
          budgetMax: v.budgetMax,
          timeline: v.timeline as any,
          source: v.source as any,
          notes: v.notes || null,
          tags: v.tags || [],
          ownerId: v.ownerId
        }
      })
    )
  );

  // create histories
  await prisma.$transaction(
    created.map((c:any) =>
      prisma.buyerHistory.create({
        data: { buyerId: c.id, changedBy: user.email, diff: { op: "import_create", after: c } }
      })
    )
  );

  return NextResponse.json({ created: created.length });
}
