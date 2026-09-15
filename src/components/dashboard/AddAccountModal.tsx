"use client";

import React from "react";
import { Building2, X } from "lucide-react";

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  newAccName: string;
  setNewAccName: (val: string) => void;
  newAccType: string;
  setNewAccType: (val: string) => void;
  isSubmitting: boolean;
}

export default function AddAccountModal({
  isOpen,
  onClose,
  onSubmit,
  newAccName,
  setNewAccName,
  newAccType,
  setNewAccType,
  isSubmitting,
}: AddAccountModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-md rounded-2xl p-6 border border-neutral-200 shadow-lg space-y-4">
        <div className="flex justify-between items-center border-b pb-3 border-neutral-100">
          <h3 className="text-base font-semibold text-neutral-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-neutral-600" />
            Tambah Sumber Dana / Rekening
          </h3>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-700">
              Nama Rekening / E-Wallet
            </label>
            <input
              type="text"
              required
              placeholder='Contoh: "Gopay", "Bank Jago", "OVO Citra"'
              value={newAccName}
              onChange={(e) => setNewAccName(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-700">Tipe</label>
            <select
              value={newAccType}
              onChange={(e) => setNewAccType(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
            >
              <option value="Bank">Bank</option>
              <option value="E-Wallet">E-Wallet</option>
              <option value="Cash">Cash</option>
              <option value="Usaha">Usaha</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg transition disabled:opacity-50"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Rekening"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
