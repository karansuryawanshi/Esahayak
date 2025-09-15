"use client";

import React from "react";
import BuyerForm from "@/components/BuyerForm";

export default function BuyerEditor({
  initial,
  id,
  isOwner,
  updatedAt,
}: {
  initial: any;
  id: string;
  isOwner: boolean;
  updatedAt: string;
}) {
  if (!isOwner) {
    return (
      <div className="p-4 bg-yellow-50">
        You cannot edit this record (not owner).
      </div>
    );
  }

  async function onSubmit(values: any) {
    const payload = { ...values, updatedAt };
    const res = await fetch(`/api/buyers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.status === 409) {
      alert("Record changed, please refresh");
      return;
    }
    if (!res.ok) {
      const json = await res.json();
      alert("Error: " + JSON.stringify(json));
      return;
    }
    alert("Saved");
    location.reload();
  }

  return (
    <BuyerForm
      initial={initial}
      onSubmit={onSubmit}
      submitLabel="Save changes"
    />
  );
}
