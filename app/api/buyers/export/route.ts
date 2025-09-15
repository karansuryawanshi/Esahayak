import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { bhkDbToUi, timelineDbToUi, sourceDbToUi } from "@/utils/mappers";

function toCsvRow(fields: string[]) {
  return fields
    .map((f) => (f ?? "").toString().replace(/"/g, '""'))
    .map((v) => `"${v}"`)
    .join(",");
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const where: any = {};
  if (q) {
    where.OR = [
      { fullName: { contains: q, mode: "insensitive" } },
      { phone: { contains: q } },
      { email: { contains: q, mode: "insensitive" } },
    ];
  }

  const items = await prisma.buyer.findMany({
    where,
    orderBy: { updatedAt: "desc" },
  });

  const headers = [
    "fullName",
    "email",
    "phone",
    "city",
    "propertyType",
    "bhk",
    "purpose",
    "budgetMin",
    "budgetMax",
    "timeline",
    "source",
    "notes",
    "tags",
    "status",
    "updatedAt",
  ];

  const csv = [toCsvRow(headers)]
    .concat(
      items.map((it: any) =>
        toCsvRow([
          it.fullName,
          it.email,
          it.phone,
          it.city,
          it.propertyType,
          bhkDbToUi(it.bhk),             // 👈 map back
          it.purpose,
          it.budgetMin ?? "",
          it.budgetMax ?? "",
          timelineDbToUi(it.timeline),   // 👈 map back
          sourceDbToUi(it.source),       // 👈 map back
          it.notes ?? "",
          (it.tags || []).join(","),
          it.status,
          it.updatedAt.toISOString(),
        ])
      )
    )
    .join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="buyers-export-${new Date().toISOString()}.csv"`,
    },
  });
}
