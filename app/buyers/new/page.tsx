// src/app/buyers/new/page.tsx
"use client";

import BuyerForm from "@/components/BuyerForm";
import type { z } from "zod";
import { buyerCreateZ } from "@/utils/validation";

type FormValues = z.infer<typeof buyerCreateZ>;

export default function NewBuyerPage() {
  async function onSubmit(data: FormValues) {
    // console.log("Submitting", data);

    if (data.propertyType !== "Apartment" && data.propertyType !== "Villa") {
      data.bhk = "Studio"; // or number 0 depending on schema
    }

    const res = await fetch("/api/buyers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      let errorMessage = "Login Required";

      try {
        const json = await res.json();
        errorMessage = json?.error?.message || errorMessage;
      } catch {
        // Ignore JSON parsing errors
      }

      alert("Error: " + errorMessage);
      return;
    }

    alert("Buyer created successfully!");
    window.location.href = "/buyers";
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Create Lead</h2>
      <BuyerForm onSubmit={onSubmit} submitLabel="Create Lead" />
    </div>
  );
}
