// src/components/CSVImporter.tsx
"use client";
import React, { useState } from "react";
import Papa, { ParseResult } from "papaparse";
import { buyerCreateValidated } from "@/utils/validation";
// CHANGE 1: Import zod to infer types from your schema
import { z } from "zod";

// CHANGE 2: Use `unknown` for unvalidated row data for better type safety.
interface RowData {
  [key: string]: unknown;
}

// CHANGE 3: Create specific types for validated data and row errors using zod's inference.
type ValidatedData = z.infer<typeof buyerCreateValidated>;
interface RowError {
  row: number;
  errors: z.inferFlattenedErrors<typeof buyerCreateValidated>;
}

export default function CSVImporter() {
  // CHANGE 4: Use the specific `RowError` type for the errors state.
  const [errors, setErrors] = useState<RowError[]>([]);
  const [previewCount, setPreviewCount] = useState(0);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrors([]);
    setPreviewCount(0);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: ParseResult<RowData>) => {
        const rows = results.data;
        // CHANGE 5: Use the specific types for local variables.
        const rowErrors: RowError[] = [];
        const valids: ValidatedData[] = [];

        rows.forEach((r, i) => {
          // `safeParse` is designed to handle `unknown` data, so this works perfectly.
          const parsed = buyerCreateValidated.safeParse(r);
          if (!parsed.success) {
            rowErrors.push({ row: i + 1, errors: parsed.error.flatten() });
          } else {
            valids.push(parsed.data);
          }
        });

        setErrors(rowErrors);
        setPreviewCount(valids.length);

        if (rowErrors.length === 0 && valids.length) {
          if (!confirm(`Insert ${valids.length} rows?`)) return;

          fetch("/api/buyers/import", {
            method: "POST",
            body: JSON.stringify({ rows: valids }),
            headers: { "Content-Type": "application/json" },
          }).then(async (res) => {
            if (!res.ok) {
              const json = await res.json();
              alert("Import error: " + JSON.stringify(json));
            } else {
              alert("Imported");
              location.reload();
            }
          });
        }
      },
    });
  }

  return (
    <div className="p-4 bg-white rounded shadow-sm border">
      <h3 className="font-semibold text-lg mb-2">Import from CSV</h3>
      <label className="block">
        <span className="sr-only">Upload CSV</span>
        <input type="file" accept=".csv" onChange={handleFile} />
      </label>

      {/* The `e` in `errors.map` is now fully typed as `RowError` */}
      {errors.length > 0 && (
        <div className="mt-4">
          <h4 className="text-red-600 font-semibold">
            Please fix these errors in your CSV and re-upload:
          </h4>
          <table className="w-full text-sm mt-2">
            <thead className="text-left bg-gray-50">
              <tr>
                <th className="p-2">Row #</th>
                <th className="p-2">Error Messages</th>
              </tr>
            </thead>
            <tbody>
              {errors.map((e, idx) => (
                <tr key={idx} className="border-t">
                  <td className="p-2 align-top">{e.row}</td>
                  <td className="p-2">
                    <pre className="whitespace-pre-wrap text-xs bg-red-50 p-2 rounded">
                      {JSON.stringify(e.errors, null, 2)}
                    </pre>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {previewCount > 0 && errors.length === 0 && (
        <div className="mt-2 text-green-700">
          Found {previewCount} valid rows. Ready to import.
        </div>
      )}
    </div>
  );
}
