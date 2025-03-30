"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, PieChart, Pie, Cell, Tooltip, XAxis, YAxis } from "recharts";
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import Sidebar from "@/components/Sidebar";

// Bed Type Colors
const BED_COLORS = {
  icu: "#2563eb",
  general: "#000000",
  emergency: "#60a5fa",
  pediatric: "#93c5fd",
};

// Bed Data by Hospital
const bedsData = [
  {
    hospital: "City General Hospital",
    icu: 10,
    general: 50,
    emergency: 15,
    pediatric: 20,
    occupancyRate: "75%",
    availableBeds: 24,
    totalBeds: 95,
  },
  {
    hospital: "Memorial Hospital",
    icu: 8,
    general: 40,
    emergency: 12,
    pediatric: 15,
    occupancyRate: "82%",
    availableBeds: 18,
    totalBeds: 75,
  },
  {
    hospital: "St. Mary's Medical Center",
    icu: 12,
    general: 60,
    emergency: 18,
    pediatric: 25,
    occupancyRate: "68%",
    availableBeds: 37,
    totalBeds: 115,
  },
];

// Bed Type Distribution Data (Pie Chart)
const bedTypeDistribution = [
  { name: "ICU", value: 30 },
  { name: "General", value: 150 },
  { name: "Emergency", value: 45 },
  { name: "Pediatric", value: 60 },
];

// Table Columns
const columns: ColumnDef<(typeof bedsData)[0]>[] = [
  { accessorKey: "hospital", header: "Hospital" },
  { accessorKey: "icu", header: "ICU Beds" },
  { accessorKey: "general", header: "General Beds" },
  { accessorKey: "emergency", header: "Emergency Beds" },
  { accessorKey: "pediatric", header: "Pediatric Beds" },
  { accessorKey: "occupancyRate", header: "Occupancy Rate" },
  { accessorKey: "availableBeds", header: "Available Beds" },
  { accessorKey: "totalBeds", header: "Total Beds" },
];

export default function BedsPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar isCollapsed={isCollapsed} toggleSidebar={() => setIsCollapsed(!isCollapsed)} />

      {/* Main Content Area */}
      <div className={`flex flex-col flex-1 transition-all duration-300 ${isCollapsed ? "ml-16" : "ml-64"}`}>
        <div className="h-full overflow-auto p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Hospital Beds Dashboard</h1>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Bed Type Distribution</CardTitle>
                <CardDescription>Distribution of beds by type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={bedTypeDistribution} cx="50%" cy="50%" innerRadius={120} outerRadius={150} paddingAngle={5} dataKey="value">
                        {bedTypeDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={BED_COLORS[entry.name.toLowerCase() as keyof typeof BED_COLORS]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Legends for Pie Chart */}
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {bedTypeDistribution.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: BED_COLORS[entry.name.toLowerCase() as keyof typeof BED_COLORS] }} />
                      <span className="text-sm text-gray-600">{entry.name}: {entry.value} beds</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Beds by Hospital</CardTitle>
                <CardDescription>Distribution of bed types across hospitals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={bedsData} margin={{ top: 10, right: 20, left: 20, bottom: 50 }}>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="p-2 bg-white shadow-md border rounded-md">
                                <p className="font-semibold text-gray-800">{data.hospital}</p>
                                <p className="text-sm text-gray-600">Total Beds: {data.totalBeds}</p>
                                <p className="text-sm text-gray-600">Available Beds: {data.availableBeds}</p>
                                <p className="text-sm text-gray-600">Occupancy Rate: {data.occupancyRate}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                        cursor={{ fill: "transparent" }}
                      />

                      {/* Bars */}
                      <Bar dataKey="icu" name="ICU Beds" fill={BED_COLORS.icu} barSize={40} />
                      <Bar dataKey="general" name="General Beds" fill={BED_COLORS.general} barSize={40} />
                      <Bar dataKey="emergency" name="Emergency Beds" fill={BED_COLORS.emergency} barSize={40} />
                      <Bar dataKey="pediatric" name="Pediatric Beds" fill={BED_COLORS.pediatric} barSize={40} />

                      {/* X & Y Axis */}
                      <XAxis dataKey="hospital" angle={0} textAnchor="middle" tick={{ fill: "black" }} />
                      <YAxis />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Legends for Bar Chart */}
                <div className="mt-4 flex justify-center gap-4">
                  {Object.entries(BED_COLORS).map(([key, color]) => (
                    <div key={key} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
                      <span className="text-sm text-gray-600 capitalize">{key} Beds</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Data Table */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Detailed Bed Availability</CardTitle>
              <CardDescription>Complete bed availability information across all hospitals</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable columns={columns} data={bedsData} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
