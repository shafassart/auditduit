"use client";

import React from "react";
import { ReceiptText, LayoutDashboard, Settings } from "lucide-react";

interface MobileBottomBarProps {
  activeTab: "transactions" | "dashboard";
  setActiveTab: (tab: "transactions" | "dashboard") => void;
  onOpenSettings: () => void;
}

export default function MobileBottomBar({
  activeTab,
  setActiveTab,
  onOpenSettings,
}: MobileBottomBarProps) {
  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-neutral-200 z-40 px-6 py-2 flex justify-around items-center">
      <button
        onClick={() => setActiveTab("transactions")}
        className={`flex flex-col items-center gap-1 text-[10px] font-medium transition ${
          activeTab === "transactions"
            ? "text-neutral-900 font-bold"
            : "text-neutral-400"
        }`}
      >
        <div
          className={`p-1.5 rounded-xl transition ${activeTab === "transactions" ? "bg-neutral-900 text-white" : ""}`}
        >
          <ReceiptText className="w-4 h-4" />
        </div>
        Catatan
      </button>

      <button
        onClick={() => setActiveTab("dashboard")}
        className={`flex flex-col items-center gap-1 text-[10px] font-medium transition ${
          activeTab === "dashboard"
            ? "text-neutral-900 font-bold"
            : "text-neutral-400"
        }`}
      >
        <div
          className={`p-1.5 rounded-xl transition ${activeTab === "dashboard" ? "bg-neutral-900 text-white" : ""}`}
        >
          <LayoutDashboard className="w-4 h-4" />
        </div>
        Cashflow
      </button>

      <button
        onClick={onOpenSettings}
        className="flex flex-col items-center gap-1 text-[10px] font-medium text-neutral-400 hover:text-neutral-900 transition"
      >
        <div className="p-1.5 rounded-xl">
          <Settings className="w-4 h-4" />
        </div>
        Akun
      </button>
    </div>
  );
}
