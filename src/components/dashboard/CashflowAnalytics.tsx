"use client";

import React from "react";
import { PieChart as PieIcon } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = [
  "#10B981",
  "#3B82F6",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#6B7280",
];

interface CashflowAnalyticsProps {
  categoryChartData: any[];
}

export default function CashflowAnalytics({
  categoryChartData,
}: CashflowAnalyticsProps) {
  if (categoryChartData.length === 0) return null;

  return (
    <section className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm space-y-4">
      <h2 className="text-sm font-semibold text-neutral-800 flex items-center gap-2">
        <PieIcon className="w-4 h-4 text-neutral-500" />
        Analisis Kategori Pengeluaran
      </h2>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categoryChartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={4}
              dataKey="value"
            >
              {categoryChartData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: any) =>
                `Rp${Number(value || 0).toLocaleString()}`
              }
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
