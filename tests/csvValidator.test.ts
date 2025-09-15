// tests/csvValidator.test.ts
import { describe, it, expect } from "vitest";
import { buyerCreateValidated } from "@/utils/validation";

describe("buyer validation", () => {
  it("rejects when budgetMax < budgetMin", () => {
    const res = buyerCreateValidated.safeParse({
      fullName: "Tom",
      phone: "1234567890",
      city: "Chandigarh",
      propertyType: "Apartment",
      bhk: "1",
      purpose: "Buy",
      timeline: "0-3m",
      source: "Website",
      budgetMin: "1000000",
      budgetMax: "500000"
    });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.flatten().fieldErrors.budgetMax?.length).toBeGreaterThan(0);
    }
  });

  it("requires bhk for apartment", () => {
    const r = buyerCreateValidated.safeParse({
      fullName: "A",
      phone: "1234567890",
      city: "Chandigarh",
      propertyType: "Apartment",
      bhk: "",
      purpose: "Buy",
      timeline: "0-3m",
      source: "Website"
    });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(Object.keys(r.error.flatten().fieldErrors)).toContain("bhk");
    }
  });

  it("accepts a valid row", () => {
    const r = buyerCreateValidated.safeParse({
      fullName: "Rina",
      phone: "9876543210",
      city: "Mohali",
      propertyType: "Plot",
      purpose: "Buy",
      timeline: "Exploring",
      source: "Referral",
      budgetMin: "500000"
    });
    expect(r.success).toBe(true);
  });
});
