"use client";

import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  title: string;
  description?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onClose: (id: string) => void;
}

export default function Toast({ toasts, onClose }: ToastProps) {
  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onClose={onClose} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onClose,
}: {
  toast: ToastMessage;
  onClose: (id: string) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  const icons = {
    success: (
      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
    ),
    error: <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />,
    info: <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />,
  };

  const borderColors = {
    success: "border-emerald-200 bg-emerald-50/95 text-emerald-950",
    error: "border-red-200 bg-red-50/95 text-red-950",
    info: "border-blue-200 bg-blue-50/95 text-blue-950",
  };

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-lg backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-5 ${
        borderColors[toast.type]
      }`}
    >
      <div className="mt-0.5">{icons[toast.type]}</div>
      <div className="flex-1 space-y-0.5">
        <p className="text-xs font-semibold leading-tight">{toast.title}</p>
        {toast.description && (
          <p className="text-[11px] opacity-80 leading-snug">
            {toast.description}
          </p>
        )}
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className="opacity-60 hover:opacity-100 p-0.5 rounded transition"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
