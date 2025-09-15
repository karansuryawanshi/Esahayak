import { prisma } from "@/lib/prisma";
import { getCurrentUserFromCookies } from "@/lib/auth.server"; // server-only
import BuyerEditor from "./BuyerEditor"; // client component
import { BuyerHistory } from "@prisma/client";

export default async function BuyerView({
  params,
}: {
  params: { id: string };
}) {
  const id = params.id;

  const buyer = await prisma.buyer.findUnique({
    where: { id },
    include: { history: { orderBy: { changedAt: "desc" }, take: 5 } },
  });

  if (!buyer) return <div>Not found</div>;

  const current = await getCurrentUserFromCookies();
  const isOwner = current?.id === buyer.ownerId;

  return (
    <div>
      <h2 className="text-xl mb-4">View / Edit</h2>

      <div className="mb-4">
        <strong>Status:</strong> {buyer.status} • <strong>Owner:</strong>{" "}
        {buyer.ownerId}
      </div>

      <div>
        <BuyerEditor
          initial={{
            fullName: buyer.fullName,
            phone: buyer.phone,
            city: buyer.city,
            propertyType: buyer.propertyType,
            purpose: buyer.purpose,
            bhk:
              buyer.bhk === "ONE"
                ? "1"
                : buyer.bhk === "TWO"
                ? "2"
                : buyer.bhk === "THREE"
                ? "3"
                : buyer.bhk === "FOUR"
                ? "4"
                : buyer.bhk === "STUDIO"
                ? "Studio"
                : undefined,
            timeline:
              buyer.timeline === "ZERO_3M"
                ? "0-3m"
                : buyer.timeline === "THREE_6M"
                ? "3-6m"
                : buyer.timeline === "GT_6M"
                ? ">6m"
                : "Exploring",
            source: buyer.source === "WalkIn" ? "Walk-in" : buyer.source,
            email: buyer.email ?? undefined,
            notes: buyer.notes ?? undefined,
            budgetMin: buyer.budgetMin ?? undefined,
            budgetMax: buyer.budgetMax ?? undefined,
            tags: buyer.tags ?? [],
          }}
          id={id}
          isOwner={isOwner}
          updatedAt={buyer.updatedAt.toISOString()}
        />
      </div>

      <div className="mt-6">
        <h3>Recent changes</h3>
        <ul>
          {buyer.history.map((h: BuyerHistory) => (
            <li key={h.id}>
              <div>
                {new Date(h.changedAt).toLocaleString()} by {h.changedBy}
              </div>
              <pre className="bg-gray-100 p-2 rounded">
                {JSON.stringify(h.diff, null, 2)}
              </pre>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
