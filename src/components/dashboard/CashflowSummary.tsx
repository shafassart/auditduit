"use client";

import React from "react";
import { Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface CashflowSummaryProps {
  totalSaldo: number;
  totalPemasukan: number;
  totalPengeluaran: number;
  transactionCount: number;
}

export default function CashflowSummary({
  totalSaldo,
  totalPemasukan,
  totalPengeluaran,
  transactionCount,
}: CashflowSummaryProps) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm space-y-2">
        <div className="flex justify-between items-center text-neutral-500">
          <span className="text-xs font-medium uppercase tracking-wider">
            Total Sisa Saldo
          </span>
          <Wallet className="w-4 h-4" />
        </div>
        <p className="text-2xl font-bold tracking-tight text-neutral-900">
          Rp{totalSaldo.toLocaleString()}
        </p>
        <p className="text-xs text-neutral-400">Net Cashflow Akumulasi</p>
      </div>

      <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm space-y-2">
        <div className="flex justify-between items-center text-neutral-500">
          <span className="text-xs font-medium uppercase tracking-wider">
            Total Pemasukan
          </span>
          <span className="p-1 bg-emerald-50 rounded text-emerald-700">
            <ArrowUpRight className="w-4 h-4" />
          </span>
        </div>
        <p className="text-2xl font-bold tracking-tight text-neutral-900">
          Rp{totalPemasukan.toLocaleString()}
        </p>
        <p className="text-xs text-emerald-600 font-medium">Uang Masuk</p>
      </div>

      <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm space-y-2">
        <div className="flex justify-between items-center text-neutral-500">
          <span className="text-xs font-medium uppercase tracking-wider">
            Total Pengeluaran
          </span>
          <span className="p-1 bg-stone-100 rounded text-stone-700">
            <ArrowDownRight className="w-4 h-4" />
          </span>
        </div>
        <p className="text-2xl font-bold tracking-tight text-neutral-900">
          Rp{totalPengeluaran.toLocaleString()}
        </p>
        <p className="text-xs text-neutral-400 font-medium">
          {transactionCount} transaksi
        </p>
      </div>
    </section>
  );
}
