"use client";

import React from "react";
import { Plus, Trash2 } from "lucide-react";

interface AccountListProps {
  accounts: any[];
  transactions: any[];
  selectedAccountFilter: string;
  onSelectAccount: (accName: string) => void;
  onOpenAddModal?: () => void;
  onDeleteAccount: (id: string, name: string) => void;
  showAddButton?: boolean;
}

export default function AccountList({
  accounts,
  transactions,
  selectedAccountFilter,
  onSelectAccount,
  onOpenAddModal,
  onDeleteAccount,
  showAddButton = true,
}: AccountListProps) {
  return (
    <section className="space-y-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-neutral-800">
            Saldo per Sumber Dana
          </h2>
          {selectedAccountFilter !== "all" && (
            <button
              onClick={() => onSelectAccount("all")}
              className="text-xs text-amber-600 hover:underline font-medium"
            >
              Reset Filter ({selectedAccountFilter})
            </button>
          )}
        </div>

        {showAddButton && onOpenAddModal && (
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1 text-xs font-medium bg-neutral-900 hover:bg-neutral-800 text-white px-3 py-1.5 rounded-lg transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah Rekening
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {accounts.map((acc) => {
          const accIncome = transactions
            .filter(
              (t) =>
                t.account_name?.toLowerCase() === acc.name?.toLowerCase() &&
                t.type === "Pemasukan",
            )
            .reduce((s, t) => s + Number(t.amount), 0);
          const accExpense = transactions
            .filter(
              (t) =>
                t.account_name?.toLowerCase() === acc.name?.toLowerCase() &&
                t.type === "Pengeluaran",
            )
            .reduce((s, t) => s + Number(t.amount), 0);
          const balance = accIncome - accExpense;

          const isSelected =
            selectedAccountFilter.toLowerCase() === acc.name.toLowerCase();

          return (
            <div
              key={acc.id}
              onClick={() => onSelectAccount(isSelected ? "all" : acc.name)}
              className={`p-4 rounded-xl border shadow-sm space-y-2 relative group cursor-pointer transition-all ${
                isSelected
                  ? "border-neutral-900 bg-neutral-900 text-white ring-2 ring-neutral-900 ring-offset-2"
                  : "border-neutral-200 bg-white hover:border-neutral-400 text-neutral-900"
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <span
                    className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                      isSelected
                        ? "bg-neutral-800 text-neutral-300"
                        : "bg-neutral-100 text-neutral-500"
                    }`}
                  >
                    {acc.type}
                  </span>
                  <p
                    className={`text-xs font-medium mt-1 ${isSelected ? "text-white" : "text-neutral-700"}`}
                  >
                    {acc.name}
                  </p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteAccount(acc.id, acc.name);
                  }}
                  className={`opacity-0 group-hover:opacity-100 transition p-1 ${
                    isSelected
                      ? "text-neutral-400 hover:text-red-400"
                      : "text-neutral-400 hover:text-red-500"
                  }`}
                  title="Hapus Rekening"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-base font-bold">
                Rp{balance.toLocaleString()}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
