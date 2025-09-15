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
      onSubmit={handleSubmit((data: any) => {
        console.log("handleSubmit called", data);
        onSubmit(data);
      })}
      className="bg-white p-4 rounded shadow space-y-3"
      aria-label="Buyer form"
    >
      {/* Full Name */}
      <div>
        <label className="block">
          <span>Full Name</span>
          <Input {...register("fullName")} className="w-full " />
          {errors.fullName && (
            <p role="alert" className="text-red-600">
              {errors.fullName.message}
            </p>
          )}
        </label>
      </div>

      {/* Email + Phone */}
      <div className="grid grid-cols-2 gap-3">
        <label>
          <span>Email</span>
          <Input {...register("email")} className="w-full " />
          {errors.email && (
            <p className="text-red-600">{errors.email.message}</p>
          )}
        </label>
        <label>
          <span>Phone</span>
          <Input {...register("phone")} className="w-full " />
          {errors.phone && (
            <p className="text-red-600">{errors.phone.message}</p>
          )}
        </label>
      </div>

      {/* City, PropertyType, BHK */}
      <div className="grid grid-cols-3 gap-3">
        {/* City */}
        <label>
          <span>City</span>
          <Controller
            name="city"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="w-[180px]">
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
        <label>
          <span>Property Type</span>
          <Controller
            name="propertyType"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="w-full">
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

        {/* BHK (only for Apartment/Villa) */}
        {["Apartment", "Villa"].includes(propertyType || "") && (
          <label>
            <span>BHK</span>
            <Controller
              name="bhk"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-full">
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
            {errors.bhk && <p className="text-red-600">{errors.bhk.message}</p>}
          </label>
        )}
      </div>

      {/* Purpose + Budget */}
      <div className="grid grid-cols-3 gap-3">
        <label>
          <span>Purpose</span>
          <Controller
            name="purpose"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="w-full">
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

        <label>
          <span>Budget Min (INR)</span>
          <Input
            {...register("budgetMin", {
              valueAsNumber: true,
              setValueAs: (v) => (v === "" ? undefined : Number(v)),
            })}
            className="w-full "
          />
        </label>

        <label>
          <span>Budget Max (INR)</span>
          <Input
            {...register("budgetMax", {
              valueAsNumber: true,
              setValueAs: (v) => (v === "" ? undefined : Number(v)),
            })}
            className="w-full"
          />
          {errors.budgetMax && (
            <p className="text-red-600">{errors.budgetMax.message}</p>
          )}
        </label>
      </div>

      {/* Timeline, Source, Tags */}
      <div className="grid grid-cols-3 gap-3">
        <label>
          <span>Timeline</span>
          <Controller
            name="timeline"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="w-full">
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

        <label>
          <span>Source</span>
          <Controller
            name="source"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="w-full">
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

        <label>
          <span>Tags (comma separated)</span>
          <Input
            {...register("tags", {
              setValueAs: (v: any) => {
                if (v?.target?.value !== undefined) v = v.target.value;

                if (Array.isArray(v)) {
                  return v.map((s) => String(s).trim()).filter(Boolean);
                }

                if (typeof v === "string") {
                  return v
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean);
                }

                return [];
              },
            })}
            className="w-full p-2 border rounded"
            placeholder="tag1, tag2"
          />
        </label>
      </div>

      {/* Notes */}
      <div>
        <label>
          <span>Notes</span>
          <Textarea
            {...register("notes")}
            className="w-full p-2 border rounded"
            rows={4}
          />
        </label>
      </div>

      {/* Submit */}
      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 rounded bg-[#0f4c75] text-white"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
