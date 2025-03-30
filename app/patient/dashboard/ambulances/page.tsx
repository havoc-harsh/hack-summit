"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, PieChart, Pie, Cell, Tooltip, XAxis, YAxis, Legend, LabelList } from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import Sidebar from "@/components/Sidebar";

const AMBULANCE_COLORS = {
  available: "#2563eb",
  inUse: "#000000",
  maintenance: "#60a5fa",
};

const ambulanceData = [
  { hospital: "City General Hospital", available: 8, inUse: 4, maintenance: 2, totalCalls: 45, avgResponseTime: "12 min" },
  { hospital: "Memorial Hospital", available: 6, inUse: 5, maintenance: 1, totalCalls: 38, avgResponseTime: "15 min" },
  { hospital: "St. Mary's Medical Center", available: 10, inUse: 3, maintenance: 3, totalCalls: 52, avgResponseTime: "10 min" },
];

const statusDistribution = [
  { name: "Available", value: 24 },
  { name: "In Use", value: 12 },
  { name: "Maintenance", value: 6 },
];

const columns: ColumnDef<(typeof ambulanceData)[0]>[] = [
  { accessorKey: "hospital", header: "Hospital" },
  { accessorKey: "available", header: "Available" },
  { accessorKey: "inUse", header: "In Use" },
  { accessorKey: "maintenance", header: "Maintenance" },
  { accessorKey: "totalCalls", header: "Total Calls" },
  { accessorKey: "avgResponseTime", header: "Avg. Response Time" },
];

export default function AmbulancesPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar (Fixed) */}
      <Sidebar isCollapsed={isCollapsed} toggleSidebar={() => setIsCollapsed(!isCollapsed)} />

      {/* Main Content with Scrollable Area */}
      <div className={`flex flex-col flex-1 transition-all duration-300 ${isCollapsed ? "ml-16" : "ml-64"}`}>
        <div className="h-full overflow-auto p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Ambulance Tracking</h1>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Ambulance Status Distribution</CardTitle>
                <CardDescription>Current status of all ambulances</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={statusDistribution} cx="50%" cy="50%" innerRadius={120} outerRadius={150} paddingAngle={5} dataKey="value">
                        {statusDistribution.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={AMBULANCE_COLORS[entry.name.toLowerCase().replace(" ", "") as keyof typeof AMBULANCE_COLORS]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Ambulance Status by Hospital</CardTitle>
                <CardDescription>Distribution of ambulances across hospitals</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ambulanceData} barGap={5}>
                      <XAxis dataKey="hospital" tick={{ fill: "#4B5563" }} />
                      <YAxis tick={{ fill: "#4B5563" }} />
                      <Legend />
                      <Tooltip wrapperClassName="text-sm bg-white p-2 rounded shadow" cursor={{ fill: "rgba(0, 0, 0, 0.1)" }} />
                      <Bar dataKey="available" fill={AMBULANCE_COLORS.available}>
                        <LabelList dataKey="available" position="top" fill="#2563eb" />
                      </Bar>
                      <Bar dataKey="inUse" fill={AMBULANCE_COLORS.inUse}>
                        <LabelList dataKey="inUse" position="top" fill="#3b82f6" />
                      </Bar>
                      <Bar dataKey="maintenance" fill={AMBULANCE_COLORS.maintenance}>
                        <LabelList dataKey="maintenance" position="top" fill="#60a5fa" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Data Table */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Detailed Ambulance Statistics</CardTitle>
              <CardDescription>Complete ambulance data across all hospitals</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable columns={columns} data={ambulanceData} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
