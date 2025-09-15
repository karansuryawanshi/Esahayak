// src/app/api/buyers/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserFromCookies } from "@/lib/auth";
import { buyerCreateValidated, bhkUiToDb, timelineUiToDb, sourceUiToDb } from "@/utils/validation";
import { isRateLimited } from "@/utils/rateLimit";
import { Prisma } from "@prisma/client";
// import { notFound } from "next/navigation";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const page = Number(url.searchParams.get("page") || "1");
  const pageSize = Math.min(Number(url.searchParams.get("pageSize") || "10"), 50);
  const skip = (page - 1) * pageSize;

  const city = url.searchParams.get("city");
  const propertyType = url.searchParams.get("propertyType");
  const status = url.searchParams.get("status");
  const timeline = url.searchParams.get("timeline");
  const q = url.searchParams.get("q"); // search
  const sort = url.searchParams.get("sort") || "updatedAt";
  const order = url.searchParams.get("order") || "desc";

  const where: Prisma.BuyerWhereInput = {};
  if (city) where.city = city as any;
  if (propertyType) where.propertyType = propertyType as any;
  if (status) where.status = status as any;
  if (timeline) {
    // timeline may be UI value like "0-3m"
    where.timeline = timeline as any;
  }
  if (q) {
    where.OR = [
      { fullName: { contains: q, mode: "insensitive" } },
      { phone: { contains: q } },
      { email: { contains: q, mode: "insensitive" } }
    ];
  }

  const [total, items] = await Promise.all([
    prisma.buyer.count({ where }),
    prisma.buyer.findMany({
      where,
      orderBy: { [sort]: order === "desc" ? "desc" : "asc" },
      skip,
      take: pageSize
    })
  ]);

  return NextResponse.json({
    page,
    pageSize,
    total,
    items
  });
}

export async function POST(request: Request) {
  const body = await request.json();

  // Rate limit: by user or IP
  const userCookie = await getCurrentUserFromCookies();
  console.log("userCookie", userCookie)

  if (!userCookie) {
    console.log("user cookie not notFound")
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const rateKey = userCookie?.id ?? (request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "anon");
  if (isRateLimited(rateKey)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  // Validate input using zod
  const parseRes = buyerCreateValidated.safeParse(body);
  if (!parseRes.success) {
    return NextResponse.json({ error: parseRes.error.flatten() }, { status: 400 });
  }
  const data = parseRes.data;

  // Must have owner
  if (!userCookie) {
    return NextResponse.json({ error: "Not authenticated (demo login required)" }, { status: 401 });
  }

  // Map UI values to DB enums
  const bhkDb = data.bhk ? bhkUiToDb(data.bhk as any) : null;
  const timelineDb = timelineUiToDb(data.timeline as any);
  const sourceDb = sourceUiToDb(data.source as any);

  const created = await prisma.$transaction(async (tx) => {
    const buyer = await tx.buyer.create({
      data: {
        fullName: data.fullName,
        email: data.email || null,
        phone: data.phone,
        city: data.city as any,
        propertyType: data.propertyType as any,
        bhk: bhkDb as any,
        purpose: data.purpose as any,
        budgetMin: data.budgetMin as any,
        budgetMax: data.budgetMax as any,
        timeline: timelineDb as any,
        source: sourceDb as any,
        notes: data.notes || null,
        tags: (data.tags as string[]) || [],
        owner: {
          connect: { id: userCookie.id }, // ✅ connect the user relation
        },

      }
    });

    await tx.buyerHistory.create({
      data: {
        buyerId: buyer.id,
        changedBy: userCookie.email,
        diff: { op: "create", after: buyer }
      }
    });

    return buyer;
  });

  return NextResponse.json(created, { status: 201 });
}