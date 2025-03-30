// app/confirm-request/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";

export default function ConfirmRequestPage() {
  const searchParams = useSearchParams();
  const service = searchParams.get("service");
  const quantity = searchParams.get("quantity");
  const providerName = searchParams.get("providerName");

  if (!service || !quantity || !providerName) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
        <div className="bg-white rounded-3xl p-8 shadow-2xl text-center max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-red-600 mb-4">Invalid Request</h1>
          <p className="text-red-500 text-lg">Missing required parameters.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-indigo-100">
      <div className="bg-white rounded-3xl p-8 shadow-2xl text-center max-w-md mx-auto transform transition-all hover:scale-105 duration-300">
        <h1 className="text-4xl font-bold text-sky-800 mb-6">Request Confirmed</h1>
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Thank you for your request!
          </h2>
          <p className="text-lg text-gray-600">
            You have successfully requested{" "}
            <strong className="text-sky-600">{quantity}</strong>{" "}
            <strong className="text-sky-600">{service}</strong> from{" "}
            <strong className="text-sky-600">{providerName}</strong>.
          </p>
          <Button
            className="bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 ease-in-out transform hover:scale-110 shadow-lg"
            onClick={() => (window.location.href = "/services")}
          >
            Make Another Request
          </Button>
        </div>
      </div>
    </div>
  );
}