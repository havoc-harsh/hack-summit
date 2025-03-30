// components/map-view.tsx
"use client";

import "@/lib/fixLeafletIcons";
import "leaflet/dist/leaflet.css";
import React, { useState, useRef, useEffect, useMemo } from "react";
import { MapPin, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Hospital } from "@/types/hospital";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useRouter } from "next/navigation";
import L from "leaflet";

interface MapViewProps {
  hospitals: Hospital[];
}

function FlyTo({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 13, {
      animate: true,
      duration: 1.5 // adjust duration to control animation speed
    })
  }, [center, map]);
  return null;
}

export default function MapView1({ hospitals }: MapViewProps) {
  const router = useRouter();
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredHospitals, setFilteredHospitals] = useState<Hospital[]>(hospitals);

  const mapKey = useMemo(() => Date.now().toString(), []);

  useEffect(() => {
    const container = L.DomUtil.get(`map-${mapKey}`);
    if (container && (container as any)._leaflet_id) {
      (container as any)._leaflet_id = null;
    }
  }, [mapKey]);

  useEffect(() => {
    const container = L.DomUtil.get("map-container");
    if (container) {
      container.innerHTML = "";
    }
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = hospitals.filter(hospital =>
        hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hospital.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredHospitals(filtered);
    } else {
      setFilteredHospitals(hospitals);
    }
  }, [searchQuery, hospitals]);

  useEffect(() => {
    if (selectedHospital) {
      // Fly to the selected hospital's location
      mapRef.current?.flyTo([selectedHospital.latitude, selectedHospital.longitude], 13);
    }
  }, [selectedHospital]);

  return (
    <div className="relative h-[calc(100vh-120px)] bg-white rounded-xl shadow-lg border border-sky-100">
      <MapContainer
        key={mapKey}
        id={`map-${mapKey}`}
        center={[30.7333, 76.7794]}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        ref={(map) => {
          if (map && !mapRef.current) {
            mapRef.current = map;
          }
        }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {selectedHospital && <FlyTo center={[selectedHospital.latitude, selectedHospital.longitude]} />}
        {filteredHospitals.map((hospital) => (
          <Marker
            key={hospital.id}
            position={[hospital.latitude, hospital.longitude]}
            eventHandlers={{
              click: () => setSelectedHospital(hospital),
            }}
          >
            <Popup>
              <Card className="w-48">
                <CardContent className="p-2">
                  <p className="font-semibold">{hospital.name}</p>
                  <p className="text-sm text-gray-500">{hospital.location}</p>
                </CardContent>
              </Card>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* --- Search overlay --- */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Search locations..."
              className="pl-10 border-sky-100 focus:border-sky-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* --- Selected hospital details overlay --- */}
      {selectedHospital && (
        <div className="absolute bottom-20 left-4 right-4 z-[1000]">
          <div className="max-w-2xl mx-auto">
            <Card className="bg-white/95 backdrop-blur shadow-lg">
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">
                    {selectedHospital.name}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    {selectedHospital.location}
                  </p>
                  <div className="mt-2 flex gap-2">
                    {selectedHospital.specialities.map((speciality) => (
                      <span
                        key={speciality}
                        className="bg-sky-100 text-sky-700 text-xs px-2 py-1 rounded-full"
                      >
                        {speciality}
                      </span>
                    ))}
                  </div>
                </div>
                
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
