"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, PieChart, Pie, Cell, Tooltip, XAxis, YAxis } from "recharts";
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import Sidebar from "@/components/Sidebar";
import { Menu } from "lucide-react";

// Oxygen Cylinder Type Colors
const OXYGEN_COLORS = {
  small: "#000000",
  medium: "#3b82f6",
  large: "#60a5fa",
};

// Oxygen Availability Data by Hospital
const oxygenData = [
  {
    hospital: "City General Hospital",
    small: 30,
    medium: 50,
    large: 20,
    totalCylinders: 100,
    availableCylinders: 70,
  },
  {
    hospital: "Memorial Hospital",
    small: 20,
    medium: 40,
    large: 30,
    totalCylinders: 90,
    availableCylinders: 60,
  },
  {
    hospital: "St. Mary's Medical Center",
    small: 25,
    medium: 55,
    large: 25,
    totalCylinders: 105,
    availableCylinders: 75,
  },
];

// Oxygen Cylinder Distribution (Pie Chart)
const oxygenDistribution = [
  { name: "Small", value: 75 },
  { name: "Medium", value: 145 },
  { name: "Large", value: 75 },
];

// Table Columns
const columns: ColumnDef<(typeof oxygenData)[0]>[] = [
  { accessorKey: "hospital", header: "Hospital" },
  { accessorKey: "small", header: "Small Cylinders" },
  { accessorKey: "medium", header: "Medium Cylinders" },
  { accessorKey: "large", header: "Large Cylinders" },
  { accessorKey: "totalCylinders", header: "Total Cylinders" },
  { accessorKey: "availableCylinders", header: "Available Cylinders" },
];

export default function OxygenAvailabilityPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar for Large Screens */}
      <div className="hidden md:block">
        <Sidebar isCollapsed={isCollapsed} toggleSidebar={() => setIsCollapsed(!isCollapsed)} />
      </div>

      {/* Navbar with Mobile Sidebar Toggle */}
      <div className="flex-1 flex flex-col">
        <div className="md:hidden flex justify-between items-center bg-gray-100 p-4 border-b">
          <h1 className="text-xl font-bold">Oxygen Availability Dashboard</h1>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 bg-gray-200 rounded-md" title="Toggle Mobile Menu">
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        {/* Dropdown Sidebar for Mobile */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white shadow-md border-b p-4 z-50">
            <Sidebar isCollapsed={false} toggleSidebar={() => setIsMobileMenuOpen(false)} />
          </div>
        )}

        {/* Main Content */}
        <div className={`flex-1 overflow-auto p-6 transition-all duration-300 ${isCollapsed ? "ml-16" : "ml-64"}`}>
          <h1 className="hidden md:block text-3xl font-bold text-gray-900 mb-6">Oxygen Availability Dashboard</h1>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Oxygen Cylinder Distribution</CardTitle>
                <CardDescription>Types of oxygen cylinders available</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={oxygenDistribution} cx="50%" cy="50%" innerRadius={120} outerRadius={150} paddingAngle={5} dataKey="value">
                        {oxygenDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={OXYGEN_COLORS[entry.name.toLowerCase() as keyof typeof OXYGEN_COLORS]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Legends for Pie Chart */}
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {oxygenDistribution.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: OXYGEN_COLORS[entry.name.toLowerCase() as keyof typeof OXYGEN_COLORS] }} />
                      <span className="text-sm text-gray-600">{entry.name}: {entry.value} cylinders</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Oxygen Availability by Hospital</CardTitle>
                <CardDescription>Current oxygen cylinder stock across hospitals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={oxygenData}>
                      <XAxis dataKey="hospital" angle={0} textAnchor="middle" tick={{ fill: "black" }} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="small" name="Small Cylinders" fill={OXYGEN_COLORS.small} />
                      <Bar dataKey="medium" name="Medium Cylinders" fill={OXYGEN_COLORS.medium} />
                      <Bar dataKey="large" name="Large Cylinders" fill={OXYGEN_COLORS.large} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Data Table */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Detailed Oxygen Stock</CardTitle>
              <CardDescription>Complete availability of oxygen cylinders across hospitals</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable columns={columns} data={oxygenData} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
