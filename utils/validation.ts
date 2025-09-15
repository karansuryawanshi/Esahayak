// src/utils/validation.ts
import { z } from "zod";

/**
 * UI strings (what dropdown shows) -> DB enums
 * We accept both the UI string and the DB enum in the zod union for flexibility.
 */
export const CityEnum = z.enum(["Chandigarh", "Mohali", "Zirakpur", "Panchkula", "Other"]);
export const PropertyTypeEnum = z.enum(["Apartment", "Villa", "Plot", "Office", "Retail"]);
export const BHK_UI = z.enum(["1", "2", "3", "4", "Studio"]);
export const BHK_DB = z.enum(["ONE", "TWO", "THREE", "FOUR", "STUDIO"]);
export const PurposeEnum = z.enum(["Buy", "Rent"]);
export const TimelineEnum = z.enum(["0-3m", "3-6m", ">6m", "Exploring"]);
export const SourceEnum = z.enum(["Website", "Referral", "Walk-in", "Call", "Other"]);
export const StatusEnum = z.enum([
  "New",
  "Qualified",
  "Contacted",
  "Visited",
  "Negotiation",
  "Converted",
  "Dropped"
]);

// Map UI values -> DB enums used in Prisma
const BHK_UI_TO_DB = {
  "1": "ONE",
  "2": "TWO",
  "3": "THREE",
  "4": "FOUR",
  Studio: "STUDIO",
} as const;

export function bhkUiToDb(v?: keyof typeof BHK_UI_TO_DB | null) {
  if (!v) return null;
  return BHK_UI_TO_DB[v] ?? null;
}


export function timelineUiToDb(v: string) {
  if (v === "0-3m") return "ZERO_3M";
  if (v === "3-6m") return "THREE_6M";
  if (v === ">6m") return "GT_6M";
  return "Exploring";
}

export function sourceUiToDb(v: string) {
  if (v === "Walk-in") return "WalkIn";
  return (v as any) ?? "Other";
}

// export const buyerCreateZ = z.object({
//   fullName: z.string().min(2).max(80),
//   email: z.string().email().or(z.literal("")).optional(),
//   phone: z
//     .string()
//     .regex(/^\d{10,15}$/, "Phone must be numeric and 10–15 digits"),
//   city: CityEnum,
//   propertyType: PropertyTypeEnum,
//   bhk: z
//     .union([BHK_UI, BHK_DB, z.undefined(), z.null()])
//     .optional(),
//   purpose: PurposeEnum,
//   budgetMin: z
//     .string()
//     .optional()
//     .transform((s) => (s === undefined || s === "" ? undefined : Number(s)))
//     .refine((v) => v === undefined || Number.isInteger(v), {
//       message: "budgetMin must be an integer"
//     }),
//   budgetMax: z
//     .string()
//     .optional()
//     .transform((s) => (s === undefined || s === "" ? undefined : Number(s)))
//     .refine((v) => v === undefined || Number.isInteger(v), {
//       message: "budgetMax must be an integer"
//     }),
//   timeline: TimelineEnum,
//   source: SourceEnum,
//   notes: z.string().max(1000).optional().or(z.literal("")).optional(),
//   tags: z.string().optional()
//   .transform((s) => (!s ? [] : s.split(",").map((t) => t.trim()).filter(Boolean)))
//   .pipe(z.array(z.string()))
// });
export const buyerCreateZ = z.object({
  fullName: z.string().min(2).max(80),
  email: z.string().email().optional(),
  phone: z.string().min(10).max(15),
  city: z.enum(["Chandigarh", "Mohali", "Zirakpur", "Panchkula", "Other"]),
  propertyType: z.enum(["Apartment", "Villa", "Plot", "Office", "Retail"]),
  bhk: z.enum(["1", "2", "3", "4", "Studio"]).optional(),
  purpose: z.enum(["Buy", "Rent"]),
  // budgetMin: z.number().int().optional(),
  // budgetMax: z.number().int().optional(),
  budgetMin: z.coerce.number().nonnegative().optional(),
  budgetMax: z.coerce.number().nonnegative().optional(),
  timeline: z.enum(["0-3m", "3-6m", ">6m", "Exploring"]),
  source: z.enum(["Website", "Referral", "Walk-in", "Call", "Other"]),
  notes: z.string().max(1000).optional(),
  tags: z
    .union([
      z.string().transform((val) =>
        val
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      ),
      z.array(z.string())
    ])
    .optional()

});


// Additional constraints: bhk required for Apartment/Villa, budgetMax >= budgetMin
export const buyerCreateValidated = buyerCreateZ.superRefine((data, ctx) => {
  // bhk required for Apartment or Villa
  if (["Apartment", "Villa"].includes(data.propertyType)) {
    const bhkDb = data.bhk;
    if (!bhkDb) {
      ctx.addIssue({
        path: ["bhk"],
        code: z.ZodIssueCode.custom,
        message: "BHK is required for Apartment or Villa"
      });
    }
  }

  // budget check
  const min = typeof data.budgetMin === "number" ? data.budgetMin : undefined;
  const max = typeof data.budgetMax === "number" ? data.budgetMax : undefined;
  if (min !== undefined && max !== undefined && max < min) {
    ctx.addIssue({
      path: ["budgetMax"],
      code: z.ZodIssueCode.custom,
      message: "budgetMax must be >= budgetMin"
    });
  }
});
