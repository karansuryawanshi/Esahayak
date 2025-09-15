// src/components/BuyerTable.tsx
"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import debounce from "lodash.debounce";
import { Button } from "@/components/ui/button";
import { Input } from "./ui/input";
// import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Buyer } from "@prisma/client";

export default function BuyerTable({
  items,
  total,
  page,
  pageSize,
}: {
  items: Buyer[];
  total: number;
  page: number;
  pageSize: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") || "");

  const debouncedUpdate = useCallback(
    debounce((val: string) => {
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      if (val) params.set("q", val);
      else params.delete("q");
      params.set("page", "1");
      router.push(`/buyers?${params.toString()}`);
    }, 500),
    [router, searchParams]
  );

  // debounced update
  useEffect(() => {
    debouncedUpdate(q);
    return () => debouncedUpdate.cancel();
  }, [q, debouncedUpdate]);

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <Input
          aria-label="Search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, phone, email..."
          className="p-2 border rounded flex-1"
        />
        <Button>
          <Link
            href={`/api/buyers/export?${searchParams.toString()}`}
            // className="px-3 py-2 rounded bg-[#3282b8] text-white"
          >
            Export CSV
          </Link>
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="p-6 bg-white rounded">
          No results. Try different filters.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead>Timeline</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((row: Buyer) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.fullName}</TableCell>
                <TableCell>{row.phone}</TableCell>
                <TableCell>{row.city}</TableCell>
                <TableCell>{row.propertyType}</TableCell>
                <TableCell>
                  {row.budgetMin ?? "-"} - {row.budgetMax ?? "-"}
                </TableCell>
                {row.timeline === "ZERO_3M" && <TableCell>0-3m</TableCell>}
                {row.timeline === "THREE_6M" && <TableCell>3-6m</TableCell>}
                {row.timeline === "GT_6M" && <TableCell>&gt; 6m</TableCell>}
                {row.timeline === "Exploring" && (
                  <TableCell>Exploring</TableCell>
                )}

                <TableCell>{row.status}</TableCell>
                <TableCell suppressHydrationWarning>
                  {new Date(row.updatedAt)
                    .toISOString()
                    .slice(0, 16)
                    .replace("T", " ")}
                </TableCell>

                <TableCell>
                  <Link
                    href={`/buyers/${row.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    View
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <div className="mt-3 flex items-center justify-between">
        <div>
          Showing {(page - 1) * pageSize + 1} -{" "}
          {Math.min(page * pageSize, total)} of {total}
        </div>
        <div className="space-x-2">
          {page > 1 && (
            <Link
              href={`/buyers?page=${page - 1}`}
              className="px-3 py-1 border rounded"
            >
              Prev
            </Link>
          )}
          {page * pageSize < total && (
            <Link
              href={`/buyers?page=${page + 1}`}
              className="px-3 py-1 border rounded"
            >
              Next
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
