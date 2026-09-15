"use client";

import React from "react";
import { Search, Download, Edit3, Trash2, X } from "lucide-react";

interface TransactionListProps {
  loading: boolean;
  filteredTransactions: any[];
  selectedDateFilter: Date | null;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onExportCSV: () => void;
  onOpenEditModal: (tx: any) => void;
  onDeleteTransaction: (id: string, text: string) => void;
}

export default function TransactionList({
  loading,
  filteredTransactions,
  selectedDateFilter,
  searchQuery,
  onSearchChange,
  onExportCSV,
  onOpenEditModal,
  onDeleteTransaction,
}: TransactionListProps) {
  return (
    <section className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-neutral-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-neutral-800">
            Riwayat Transaksi
          </h2>
          {selectedDateFilter && (
            <p className="text-xs text-amber-600 font-medium">
              Filter Tanggal:{" "}
              {selectedDateFilter.toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* SEARCH BAR */}
          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Cari transaksi..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-neutral-400 text-neutral-800"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 text-[10px]"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* EXPORT CSV */}
          <button
            onClick={onExportCSV}
            className="flex items-center gap-1.5 text-xs font-medium text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 px-3 py-1.5 rounded-lg transition"
            title="Unduh Data Transaksi ke CSV"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="divide-y divide-neutral-100">
        {loading ? (
          <p className="p-4 text-xs text-neutral-400">Memuat data...</p>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <p className="text-sm font-semibold text-neutral-700">
              {searchQuery
                ? `Tidak ada transaksi yang cocok dengan "${searchQuery}"`
                : "Belum Ada Transaksi Tercatat"}
            </p>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              Coba ketik transaksi pertamamu di kolom Smart Quick Input di atas.
              Contoh: <br />
              <span className="italic text-neutral-600">
                "Beli kopi 25rb gopay"
              </span>{" "}
              atau{" "}
              <span className="italic text-neutral-600">
                "Isi bensin 50rb kemarin"
              </span>
            </p>
          </div>
        ) : (
          filteredTransactions.map((tx) => (
            <div
              key={tx.id}
              className="p-4 flex items-center justify-between hover:bg-neutral-50 transition text-sm group"
            >
              <div className="space-y-0.5">
                <p className="font-medium text-neutral-900">{tx.raw_text}</p>
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <span className="bg-neutral-100 px-2 py-0.5 rounded text-neutral-600 font-medium">
                    {tx.category}
                  </span>
                  <span>•</span>
                  <span>{tx.account_name}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right space-y-0.5">
                  <p
                    className={`font-semibold ${tx.type === "Pemasukan" ? "text-emerald-700" : "text-neutral-800"}`}
                  >
                    {tx.type === "Pemasukan" ? "+" : "-"}Rp
                    {Number(tx.amount).toLocaleString()}
                  </p>
                  <p className="text-xs text-neutral-400">
                    {new Date(tx.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={() => onOpenEditModal(tx)}
                    className="text-neutral-400 hover:text-neutral-700 p-1.5 rounded-lg hover:bg-neutral-100"
                    title="Edit Transaksi"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteTransaction(tx.id, tx.raw_text)}
                    className="text-neutral-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50"
                    title="Hapus Transaksi"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
