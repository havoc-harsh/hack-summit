"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

import AuthNavbar from "@/components/AuthNavbar";
import ServiceRequestForm from "@/components/ServiceRequestForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Phone, MapPin, AlertCircle } from "lucide-react";
import MapView1 from "@/components/map-view-service";
import { hospitals } from "@/data/hospital";

const validServices = ["ambulances", "blood", "oxygen", "icu"] as const;
type ServiceKey = typeof validServices[number];

const serviceIcons = {
  ambulances: '🚑',
  blood: '🩸',
  oxygen: '💨',
  icu: '🏥'
} satisfies Record<ServiceKey, string>;

// Note the updated type for params: it is now a Promise that resolves to the expected object.
export default function ServiceDetails({
  params,
}: {
  params: Promise<{ service: string; id: string }>;
}) {
  // Unwrap the params promise.
  const paramsResolved = React.use(params);

  const router = useRouter();
  const provider = hospitals.find(
    (h) => String(h.id) === paramsResolved.id
  );
  const serviceKey = validServices.find(
    (s) => s === paramsResolved.service
  ) as ServiceKey | undefined;

  useEffect(() => {
    if (!serviceKey) {
      router.replace('/services');
    }
  }, [serviceKey, router]);

  if (!serviceKey) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      <AuthNavbar />

      <div className="max-w-6xl mx-auto p-4 pt-24 space-y-8">
        <Button
          onClick={() => router.back()}
          variant="ghost"
          className="text-sky-600 hover:bg-sky-50 gap-2"
        >
          <ArrowLeft size={20} />
          Back to Services
        </Button>

        {provider ? (
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-start gap-4 mb-6">
                  <span className="text-4xl">{serviceIcons[serviceKey]}</span>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      {provider.name}
                    </h1>
                    <p className="text-lg text-gray-500 flex items-center gap-2">
                      <MapPin size={18} className="text-sky-600" />
                      {provider.location}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="p-4 bg-sky-50 rounded-xl">
                    <p className="text-sm text-gray-500">Available</p>
                    <p className="text-2xl font-bold text-sky-600">
                      {provider[serviceKey]}
                    </p>
                  </div>
                  <div className="p-4 bg-sky-50 rounded-xl">
                    <p className="text-sm text-gray-500">Rating</p>
                    <p className="text-2xl font-bold text-sky-600">
                      {provider.rating}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-gray-600">
                    <Phone size={20} className="text-sky-600" />
                    <div>
                      <p className="font-medium">Contact</p>
                      <p className="text-lg">{provider.contact}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <AlertCircle size={20} className="text-sky-600" />
                    <div>
                      <p className="font-medium">Wait Time</p>
                      <p className="text-lg">{provider.waitTime}</p>
                    </div>
                  </div>
                </div>
              </div>

              <ServiceRequestForm service={serviceKey} provider={provider} />
            </div>

            <div className="sticky top-24 h-fit">
              <div className="bg-white rounded-2xl p-6 shadow-lg space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Location Map
                </h2>
                <div className="rounded-xl overflow-hidden">
                  <MapView1 hospitals={[provider]} />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-24">
            <p className="text-2xl text-gray-500">Provider not found</p>
            <Button
              onClick={() => router.push('/services')}
              className="mt-4 bg-sky-600 hover:bg-sky-700"
            >
              Browse Available Services
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}