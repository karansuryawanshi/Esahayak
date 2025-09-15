// src/app/api/buyers/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserFromCookies } from "@/lib/auth";
import { buyerCreateValidated, bhkUiToDb, timelineUiToDb, sourceUiToDb } from "@/utils/validation";
import { isRateLimited } from "@/utils/rateLimit";
// CHANGE 1: Import all necessary Prisma types and enums
import { Prisma, Buyer, Status, City, PropertyType, Timeline, BHK, Purpose, Source } from "@prisma/client";
import { z } from "zod"; // CHANGE 2: Import zod for type inference

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

  // CHANGE 3: Use specific Enum types instead of `any` for type safety
  if (city) where.city = city as City;
  if (propertyType) where.propertyType = propertyType as PropertyType;
  if (status) where.status = status as Status;
  if (timeline) {
    // Note: timeline is a string from the UI, but the DB expects an enum.
    // This cast assumes the string value is a valid member of the Timeline enum.
    where.timeline = timeline as Timeline;
  }
  if (q) {
    where.OR = [
      { fullName: { contains: q, mode: "insensitive" } },
      { phone: { contains: q } },
      { email: { contains: q, mode: "insensitive" } }
    ];
  }

  // Types are now correctly inferred by Prisma Client
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
  // CHANGE 4: Treat the incoming body as `unknown` to enforce validation
  const body: unknown = await request.json();

  // Rate limit: by user or IP
  const userCookie = await getCurrentUserFromCookies();

  if (!userCookie) {
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
  
  // CHANGE 5: Infer the type of `data` directly from the Zod schema
  const data: z.infer<typeof buyerCreateValidated> = parseRes.data;

  // Map UI values to DB enums
  // CHANGE 6: Remove `as any` as types are now correctly inferred from the Zod schema
  const bhkDb = data.bhk ? bhkUiToDb(data.bhk) : null;
  const timelineDb = timelineUiToDb(data.timeline);
  const sourceDb = sourceUiToDb(data.source);

  const created = await prisma.$transaction(async (tx) => {
    const buyer = await tx.buyer.create({
      data: {
        // CHANGE 7: Use specific Enum types for database creation
        fullName: data.fullName,
        email: data.email || null,
        phone: data.phone,
        city: data.city as City,
        propertyType: data.propertyType as PropertyType,
        bhk: bhkDb as BHK | null, // Cast the result of the mapping function
        purpose: data.purpose as Purpose,
        budgetMin: data.budgetMin, // `as any` is not needed for numbers
        budgetMax: data.budgetMax, // `as any` is not needed for numbers
        timeline: timelineDb as Timeline, // Cast the result of the mapping function
        source: sourceDb as Source, // Cast the result of the mapping function
        notes: data.notes || null,
        tags: data.tags || [], // Simplified from `(data.tags as string[])`
        owner: {
          connect: { id: userCookie.id },
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