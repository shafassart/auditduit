"use client";

import React from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  isDangerous?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Hapus",
  isDangerous = true,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-2xl p-6 border border-neutral-200 shadow-xl space-y-4">
        <div className="flex justify-between items-start">
          <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 p-1 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-1">
          <h3 className="text-base font-semibold text-neutral-900">{title}</h3>
          <p className="text-xs text-neutral-500 leading-relaxed">
            {description}
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg transition"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-xs font-medium text-white rounded-lg transition shadow-sm ${
              isDangerous
                ? "bg-red-600 hover:bg-red-700"
                : "bg-neutral-900 hover:bg-neutral-800"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
