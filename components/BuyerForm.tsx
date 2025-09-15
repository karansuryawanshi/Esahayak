// components/BuyerForm.tsx

"use client";

import React from "react";
import { useForm, type Resolver, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { buyerCreateZ } from "@/utils/validation";
import type { z } from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FormValues = z.infer<typeof buyerCreateZ>;

export default function BuyerForm({
  initial,
  onSubmit,
  submitLabel = "Save",
}: {
  initial?: Partial<FormValues>;
  onSubmit: (v: FormValues) => Promise<void> | void;
  submitLabel?: string;
}) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(buyerCreateZ) as Resolver<FormValues>, // ✅ now works
    defaultValues: (initial ?? {}) as Partial<FormValues>,
    shouldFocusError: false,
  });

  const propertyType = watch("propertyType");

  return (
    <form
  onSubmit={handleSubmit((data: FormValues) => {
    console.log("handleSubmit called", data);
    onSubmit(data);
  })}
  // Increased vertical spacing between field groups for clarity
  className="bg-white p-4 rounded shadow space-y-6"
  aria-label="Buyer form"
>
  {/* Full Name */}
  <div>
    <label className="block text-sm font-medium text-gray-700">
      <span>Full Name</span>
      <Input {...register("fullName")} className="w-full mt-1" />
      {errors.fullName && (
        <p role="alert" className="text-red-600 text-sm mt-1">
          {errors.fullName.message}
        </p>
      )}
    </label>
  </div>

  {/* Email + Phone */}
  {/* On small screens: 1 column. On medium screens and up: 2 columns */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <label className="block text-sm font-medium text-gray-700">
      <span>Email</span>
      <Input {...register("email")} className="w-full mt-1" />
      {errors.email && (
        <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
      )}
    </label>
    <label className="block text-sm font-medium text-gray-700">
      <span>Phone</span>
      <Input {...register("phone")} className="w-full mt-1" />
      {errors.phone && (
        <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>
      )}
    </label>
  </div>

  {/* City, PropertyType, BHK */}
  {/* On small: 1 col, medium: 2 cols, large: 3 cols */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {/* City */}
    <label className="block text-sm font-medium text-gray-700">
      <span>City</span>
      <Controller
        name="city"
        control={control}
        render={({ field }) => (
          <Select onValueChange={field.onChange} value={field.value}>
            {/* Removed fixed width, now it's responsive */}
            <SelectTrigger className="w-full mt-1">
              <SelectValue placeholder="Select a city" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>City</SelectLabel>
                <SelectItem value="Chandigarh">Chandigarh</SelectItem>
                <SelectItem value="Mohali">Mohali</SelectItem>
                <SelectItem value="Zirakpur">Zirakpur</SelectItem>
                <SelectItem value="Panchkula">Panchkula</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        )}
      />
    </label>

    {/* Property Type */}
    <label className="block text-sm font-medium text-gray-700">
      <span>Property Type</span>
      <Controller
        name="propertyType"
        control={control}
        render={({ field }) => (
          <Select onValueChange={field.onChange} value={field.value}>
            <SelectTrigger className="w-full mt-1">
              <SelectValue placeholder="Select a Property Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Property type</SelectLabel>
                <SelectItem value="Apartment">Apartment</SelectItem>
                <SelectItem value="Villa">Villa</SelectItem>
                <SelectItem value="Plot">Plot</SelectItem>
                <SelectItem value="Office">Office</SelectItem>
                <SelectItem value="Retail">Retail</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        )}
      />
    </label>

    {/* BHK (conditionally rendered) */}
    {["Apartment", "Villa"].includes(propertyType || "") && (
      <label className="block text-sm font-medium text-gray-700">
        <span>BHK</span>
        <Controller
          name="bhk"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Select BHK" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>BHK</SelectLabel>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="Studio">Studio</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        />
        {errors.bhk && <p className="text-red-600 text-sm mt-1">{errors.bhk.message}</p>}
      </label>
    )}
  </div>

  {/* Purpose + Budget */}
  {/* On small: 1 col, medium: 2 cols, large: 3 cols */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <label className="block text-sm font-medium text-gray-700">
      <span>Purpose</span>
      <Controller
        name="purpose"
        control={control}
        render={({ field }) => (
          <Select onValueChange={field.onChange} value={field.value}>
            <SelectTrigger className="w-full mt-1">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Select</SelectLabel>
                <SelectItem value="Buy">Buy</SelectItem>
                <SelectItem value="Rent">Rent</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        )}
      />
    </label>

    <label className="block text-sm font-medium text-gray-700">
      <span>Budget Min (INR)</span>
      <Input
        {...register("budgetMin", {
          valueAsNumber: true,
          setValueAs: (v) => (v === "" ? undefined : Number(v)),
        })}
        className="w-full mt-1"
      />
    </label>

    <label className="block text-sm font-medium text-gray-700">
      <span>Budget Max (INR)</span>
      <Input
        {...register("budgetMax", {
          valueAsNumber: true,
          setValueAs: (v) => (v === "" ? undefined : Number(v)),
        })}
        className="w-full mt-1"
      />
      {errors.budgetMax && (
        <p className="text-red-600 text-sm mt-1">{errors.budgetMax.message}</p>
      )}
    </label>
  </div>

  {/* Timeline, Source, Tags */}
  {/* On small: 1 col, medium: 2 cols, large: 3 cols */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <label className="block text-sm font-medium text-gray-700">
      <span>Timeline</span>
      <Controller
        name="timeline"
        control={control}
        render={({ field }) => (
          <Select onValueChange={field.onChange} value={field.value}>
            <SelectTrigger className="w-full mt-1">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Select</SelectLabel>
                <SelectItem value="0-3m">0-3m</SelectItem>
                <SelectItem value="3-6m">3-6m</SelectItem>
                <SelectItem value=">6m">&gt;6m</SelectItem>
                <SelectItem value="Exploring">Exploring</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        )}
      />
    </label>

    <label className="block text-sm font-medium text-gray-700">
      <span>Source</span>
      <Controller
        name="source"
        control={control}
        render={({ field }) => (
          <Select onValueChange={field.onChange} value={field.value}>
            <SelectTrigger className="w-full mt-1">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Select</SelectLabel>
                <SelectItem value="Website">Website</SelectItem>
                <SelectItem value="Referral">Referral</SelectItem>
                <SelectItem value="Walk-in">Walk-in</SelectItem>
                <SelectItem value="Call">Call</SelectItem>
                <SelectItem value="Others">Others</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        )}
      />
    </label>

    <label className="block text-sm font-medium text-gray-700">
      <span>Tags (comma separated)</span>
      <Input
        {...register("tags", {
          setValueAs: (v: string) => {
            if (typeof v === "string") {
              return v
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean); // filter out empty strings
            }
            return []; // Return empty array for any other case
          },
        })}
        className="w-full p-2 border rounded mt-1"
        placeholder="tag1, tag2"
      />
    </label>
  </div>

  {/* Notes */}
  <div>
    <label className="block text-sm font-medium text-gray-700">
      <span>Notes</span>
      <Textarea
        {...register("notes")}
        className="w-full p-2 border rounded mt-1"
        rows={4}
      />
    </label>
  </div>

  {/* Submit */}
  <div>
    <button
      type="submit"
      disabled={isSubmitting}
      className="px-4 py-2 rounded bg-[#0f4c75] text-white hover:bg-[#1b262c] disabled:bg-gray-400"
    >
      {submitLabel}
    </button>
  </div>
</form>
  );
}
