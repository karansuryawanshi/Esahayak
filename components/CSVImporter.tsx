// src/components/CSVImporter.tsx
"use client";
import React, { useState } from "react";
import Papa from "papaparse";
import { buyerCreateValidated } from "@/utils/validation";

export default function CSVImporter() {
  const [errors, setErrors] = useState<any[]>([]);
  const [previewCount, setPreviewCount] = useState(0);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: any) => {
        const rows = results.data as any[];
        const rowErrors: any[] = [];
        const valids: any[] = [];

        rows.forEach((r, i) => {
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
          // send valids
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
    <div className="p-4 bg-white rounded">
      <label className="block">
        <span>Upload CSV</span>
        <input type="file" accept=".csv" onChange={handleFile} />
      </label>

      {errors.length > 0 && (
        <div className="mt-4">
          <h4>Row errors</h4>
          <table className="w-full">
            <thead>
              <tr>
                <th>#</th>
                <th>Messages</th>
              </tr>
            </thead>
            <tbody>
              {errors.map((e, idx) => (
                <tr key={idx}>
                  <td>{e.row}</td>
                  <td>
                    <pre>{JSON.stringify(e.errors, null, 2)}</pre>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {previewCount > 0 && (
        <div className="mt-2">Valid rows to be inserted: {previewCount}</div>
      )}
    </div>
  );
}
