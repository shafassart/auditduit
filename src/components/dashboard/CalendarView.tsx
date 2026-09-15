"use client";

import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";

interface CalendarViewProps {
  transactions: any[];
  onSelectDate: (date: Date | null) => void;
  selectedDate: Date | null;
}

export default function CalendarView({
  transactions,
  onSelectDate,
  selectedDate,
}: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  // Kelompokkan total transaksi per tanggal
  const getDaySummary = (day: number) => {
    const dayTx = transactions.filter((t) => {
      const d = new Date(t.created_at);
      return (
        d.getDate() === day &&
        d.getMonth() === month &&
        d.getFullYear() === year
      );
    });

    const expense = dayTx
      .filter((t) => t.type === "Pengeluaran")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const income = dayTx
      .filter((t) => t.type === "Pemasukan")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return { expense, income, count: dayTx.length };
  };

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const monthNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  return (
    <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm space-y-4">
      {/* Header Navigasi Bulan */}
      <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-neutral-600" />
          <h3 className="text-sm font-semibold text-neutral-800">
            {monthNames[month]} {year}
          </h3>
        </div>
        <div className="flex items-center gap-1">
          {selectedDate && (
            <button
              onClick={() => onSelectDate(null)}
              className="text-xs text-amber-600 hover:underline mr-2 font-medium"
            >
              Reset Filter Tanggal
            </button>
          )}
          <button
            onClick={handlePrevMonth}
            className="p-1 hover:bg-neutral-100 rounded-lg text-neutral-600"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1 hover:bg-neutral-100 rounded-lg text-neutral-600"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid Nama Hari */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-neutral-400">
        <span>Min</span>
        <span>Sen</span>
        <span>Sel</span>
        <span>Rab</span>
        <span>Kam</span>
        <span>Jum</span>
        <span>Sab</span>
      </div>

      {/* Grid Tanggal */}
      <div className="grid grid-cols-7 gap-1 text-xs">
        {/* Spacer hari kosong awal bulan */}
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="h-12 rounded-lg bg-neutral-50/50"
          />
        ))}

        {daysArray.map((day) => {
          const { expense, income, count } = getDaySummary(day);
          const isSelected =
            selectedDate &&
            selectedDate.getDate() === day &&
            selectedDate.getMonth() === month &&
            selectedDate.getFullYear() === year;

          return (
            <button
              key={day}
              onClick={() => {
                const clickedDate = new Date(year, month, day);
                onSelectDate(isSelected ? null : clickedDate);
              }}
              className={`h-12 rounded-lg p-1 flex flex-col justify-between items-start transition border ${
                isSelected
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-100 hover:border-neutral-300 bg-white text-neutral-800"
              }`}
            >
              <span className="font-semibold">{day}</span>

              {/* Indicator Transaksi */}
              <div className="w-full flex flex-col items-end text-[9px] font-medium leading-none">
                {expense > 0 && (
                  <span
                    className={isSelected ? "text-red-300" : "text-red-600"}
                  >
                    -
                    {expense >= 1000000
                      ? `${(expense / 1000000).toFixed(1)}M`
                      : `${Math.round(expense / 1000)}k`}
                  </span>
                )}
                {income > 0 && (
                  <span
                    className={
                      isSelected ? "text-emerald-300" : "text-emerald-600"
                    }
                  >
                    +
                    {income >= 1000000
                      ? `${(income / 1000000).toFixed(1)}M`
                      : `${Math.round(income / 1000)}k`}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
