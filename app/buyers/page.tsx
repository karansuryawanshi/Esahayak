// app/buyers/page.tsx
import { prisma } from "@/lib/prisma";
import BuyerTable from "@/components/BuyerTable";
import CSVImporter from "@/components/CSVImporter";
import { Prisma } from "@prisma/client";

export default async function BuyersPage({
  searchParams = {},
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  // Normalize search params safely
  const page = Number(
    Array.isArray(searchParams?.page)
      ? searchParams.page[0]
      : searchParams?.page || 1
  );
  const pageSize = 10;
  const skip = (page - 1) * pageSize;

  const city = Array.isArray(searchParams?.city)
    ? searchParams.city[0]
    : searchParams?.city;
  const propertyType = Array.isArray(searchParams?.propertyType)
    ? searchParams.propertyType[0]
    : searchParams?.propertyType;
  const status = Array.isArray(searchParams?.status)
    ? searchParams.status[0]
    : searchParams?.status;
  const timeline = Array.isArray(searchParams?.timeline)
    ? searchParams.timeline[0]
    : searchParams?.timeline;
  const q = Array.isArray(searchParams?.q)
    ? searchParams.q[0]
    : searchParams?.q;

  const where: Prisma.BuyerWhereInput = {};
  if (city) where.city = city as any;
  if (propertyType) where.propertyType = propertyType as any;
  if (status) where.status = status as any;
  if (timeline) where.timeline = timeline as any;
  if (q) {
    where.OR = [
      { fullName: { contains: q, mode: "insensitive" } },
      { phone: { contains: q } },
      { email: { contains: q, mode: "insensitive" } },
    ];
  }

  const [total, items] = await Promise.all([
    prisma.buyer.count({ where }),
    prisma.buyer.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip,
      take: pageSize,
    }),
  ]);

  return (
    <div>
      <h2 className="text-xl mb-4">Buyers</h2>
      <CSVImporter></CSVImporter>
      <BuyerTable items={items} total={total} page={page} pageSize={pageSize} />
    </div>
  );
}
