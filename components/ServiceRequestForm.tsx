// components/ServiceRequestForm.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Hospital } from "@/types/hospital";
import Link from "next/link";
import { useState } from "react";

export default function ServiceRequestForm({
  service,
  provider
}: {
  service: "ambulances" | "blood" | "oxygen" | "icu" | null;
  provider: Hospital;
}) {
  const [quantity, setQuantity] = useState(1);

  if (!service) return null;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <h2 className="text-xl font-bold mb-4">Request Service</h2>
      <div className="flex items-center gap-4">
        <label htmlFor="quantity" className="sr-only">Quantity</label>
        <input
          id="quantity"
          type="number"
          min="1"
          max={provider[service]}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="border rounded-lg p-2 w-20"
          placeholder="Quantity"
        />
        <Link href={`/confirm-request?service=${service}&quantity=${quantity}&providerName=${provider.name}`}>
        <Button className="bg-sky-600 hover:bg-sky-700">
          Confirm Request
        </Button>
        </Link>
      </div>
    </div>
  );
}
