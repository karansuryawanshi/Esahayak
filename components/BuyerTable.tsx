// src/components/BuyerTable.tsx
"use client";
// CHANGE 1: Import `useMemo` instead of `useCallback`
import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import debounce from "lodash.debounce";
import { Button } from "@/components/ui/button";
import { Input } from "./ui/input";
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

  // CHANGE 2: Use `useMemo` to memoize the debounced function itself.
  // This ensures the same function instance is used across re-renders,
  // allowing the debounce timer to work correctly.
  const debouncedUpdate = useMemo(
    () =>
      debounce((val: string) => {
        const params = new URLSearchParams(Array.from(searchParams.entries()));
        if (val) {
          params.set("q", val);
        } else {
          params.delete("q");
        }
        params.set("page", "1");
        router.push(`/buyers?${params.toString()}`);
      }, 500),
    [router, searchParams]
  );

  // This useEffect now correctly uses the memoized debounced function
  useEffect(() => {
    debouncedUpdate(q);
    // Cleanup function to cancel the debounce on component unmount or if q changes
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
        <Button asChild>
          <Link href={`/api/buyers/export?${searchParams.toString()}`}>
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
                <TableCell>
                  {
                    {
                      ZERO_3M: "0-3m",
                      THREE_6M: "3-6m",
                      GT_6M: "> 6m",
                      Exploring: "Exploring",
                    }[row.timeline]
                  }
                </TableCell>
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
