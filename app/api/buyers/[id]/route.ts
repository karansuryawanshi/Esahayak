// // src/app/api/buyers/[id]/route.ts
// import { NextResponse,NextRequest } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { getCurrentUserFromCookies } from "@/lib/auth";
// import { buyerCreateValidated, buyerCreateZ, bhkUiToDb, timelineUiToDb, sourceUiToDb } from "@/utils/validation";
// import { isRateLimited } from "@/utils/rateLimit";

// export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
//   const id = params.id;
//   const buyer = await prisma.buyer.findUnique({
//     where: { id },
//     include: { history: { orderBy: { changedAt: "desc" }, take: 5 } }
//   });
//   if (!buyer) return NextResponse.json({ error: "Not found" }, { status: 404 });
//   return NextResponse.json(buyer);
// }

// export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
//   const id = params.id;
//   const user = await getCurrentUserFromCookies();
//   if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

//   if (isRateLimited(user.id)) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

//   const body = await request.json();
//   const { updatedAt: clientUpdatedAt, ...rest } = body;

//   // Validate incoming
//   const parseRes = buyerCreateValidated.safeParse(rest);
//   if (!parseRes.success) {
//     return NextResponse.json({ error: parseRes.error.flatten() }, { status: 400 });
//   }
//   const data = parseRes.data;

//   const existing = await prisma.buyer.findUnique({ where: { id } });
//   if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

//   // Ownership check
//   console.log("existing.ownerId",existing.ownerId)
//   console.log("user.id",user.id)
//   if (existing.ownerId !== user.id) {
//     return NextResponse.json({ error: "Forbidden: not the owner" }, { status: 403 });
//   }

//   // Concurrency
//   if (new Date(clientUpdatedAt).getTime() !== new Date(existing.updatedAt).getTime()) {
//     return NextResponse.json({ error: "Record changed, please refresh" }, { status: 409 });
//   }

//   // Map enums
//   const bhkDb = data.bhk ? bhkUiToDb(data.bhk as any) : null;
//   const timelineDb = timelineUiToDb(data.timeline as any);
//   const sourceDb = sourceUiToDb(data.source as any);

//   const updated = await prisma.$transaction(async (tx:any) => {
//     const after = await tx.buyer.update({
//       where: { id },
//       data: {
//         fullName: data.fullName,
//         email: data.email || null,
//         phone: data.phone,
//         city: data.city as any,
//         propertyType: data.propertyType as any,
//         bhk: bhkDb as any,
//         purpose: data.purpose as any,
//         budgetMin: data.budgetMin as any,
//         budgetMax: data.budgetMax as any,
//         timeline: timelineDb as any,
//         source: sourceDb as any,
//         notes: data.notes || null,
//         tags: (data.tags as string[]) || []
//       }
//     });

//     const diff = {
//       before: existing,
//       after
//     };

//     await tx.buyerHistory.create({
//       data: {
//         buyerId: id,
//         changedBy: user.email,
//         diff
//       }
//     });

//     return after;
//   });

//   return NextResponse.json(updated);
// }

// export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
//   const id = params.id;
//   const user = await getCurrentUserFromCookies();
//   if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

//   const existing = await prisma.buyer.findUnique({ where: { id } });
//   if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
//   if (existing.ownerId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

//   await prisma.buyer.delete({ where: { id } });

//   await prisma.buyerHistory.create({
//     data: {
//       buyerId: id,
//       changedBy: user.email,
//       diff: { op: "delete", before: existing }
//     }
//   });

//   return NextResponse.json({ ok: true });
// }
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserFromCookies } from "@/lib/auth";
import { buyerCreateValidated, bhkUiToDb, timelineUiToDb, sourceUiToDb } from "@/utils/validation";
import { isRateLimited } from "@/utils/rateLimit";
import { Prisma } from "@prisma/client";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // <- must await
  const buyer = await prisma.buyer.findUnique({
    where: { id },
    include: { history: { orderBy: { changedAt: "desc" }, take: 5 } }
  });
  if (!buyer) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(buyer);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const user = await getCurrentUserFromCookies();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  if (isRateLimited(user.id)) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

  const body = await request.json();
  const { updatedAt: clientUpdatedAt, ...rest } = body;

  const parseRes = buyerCreateValidated.safeParse(rest);
  if (!parseRes.success) {
    return NextResponse.json({ error: parseRes.error.flatten() }, { status: 400 });
  }
  const data = parseRes.data;

  const existing = await prisma.buyer.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (existing.ownerId !== user.id) {
    return NextResponse.json({ error: "Forbidden: not the owner" }, { status: 403 });
  }

  if (new Date(clientUpdatedAt).getTime() !== new Date(existing.updatedAt).getTime()) {
    return NextResponse.json({ error: "Record changed, please refresh" }, { status: 409 });
  }

  const bhkDb = data.bhk ? bhkUiToDb(data.bhk) : null;
  const timelineDb = timelineUiToDb(data.timeline);
  const sourceDb = sourceUiToDb(data.source);

  const updated = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const after = await tx.buyer.update({
      where: { id },
      data: {
        fullName: data.fullName,
        email: data.email || null,
        phone: data.phone,
        city: data.city,
        propertyType: data.propertyType,
        bhk: bhkDb,
        purpose: data.purpose,
        budgetMin: data.budgetMin,
        budgetMax: data.budgetMax,
        timeline: timelineDb,
        source: sourceDb,
        notes: data.notes || null,
        tags: (data.tags as string[]) || []
      }
    });

    await tx.buyerHistory.create({
      data: {
        buyerId: id,
        changedBy: user.email,
        diff: { before: existing, after }
      }
    });

    return after;
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const user = await getCurrentUserFromCookies();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const existing = await prisma.buyer.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.ownerId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.buyer.delete({ where: { id } });

  await prisma.buyerHistory.create({
    data: {
      buyerId: id,
      changedBy: user.email,
      diff: { op: "delete", before: existing }
    }
  });

  return NextResponse.json({ ok: true });
}