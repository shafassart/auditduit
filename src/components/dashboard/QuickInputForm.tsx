"use client";

import React, { useState } from "react";
import { Sparkles, Plus, Loader2, Calendar } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

interface QuickInputFormProps {
  onSuccess?: () => void;
}

export default function QuickInputForm({ onSuccess }: QuickInputFormProps) {
  const [inputText, setInputText] = useState("");
  // Tanggal default: Hari ini (YYYY-MM-DD)
  const [customDate, setCustomDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setLoading(true);
    setFeedback(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const res = await fetch("/api/parse-transaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token || ""}`,
        },
        body: JSON.stringify({
          text: inputText,
          date: customDate || undefined, // Kirim custom date jika diisi
        }),
      });

      const data = await res.json();

      if (data.success) {
        setFeedback(
          `Tercatat: Rp${data.data.amount.toLocaleString()} [${data.data.category}] via ${data.data.accountName}`,
        );
        setInputText("");
        setCustomDate(""); // Reset picker setelah sukses
        if (onSuccess) onSuccess();
      } else {
        setFeedback(`Gagal: ${data.error || "Terjadi kesalahan"}`);
      }
    } catch (err: any) {
      setFeedback(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-amber-500" />
          Smart Quick Input
        </div>
        <span className="text-[11px] text-neutral-400">
          *Bisa pakai teks (kemarin/tgl 15) ATAU pilih tanggal manual
        </span>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-2">
        {/* Input Teks NLP */}
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder='Ketik transaksi... (Contoh: "Beli kopi 25rb gopay" atau "Gaji 5jt rekening utama")'
          className="flex-1 bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400 text-neutral-900"
        />

        {/* Date Picker Manual */}
        <div className="flex items-center gap-1 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm">
          <Calendar className="w-4 h-4 text-neutral-400" />
          <input
            type="date"
            value={customDate}
            onChange={(e) => setCustomDate(e.target.value)}
            className="bg-transparent text-xs text-neutral-700 font-medium focus:outline-none"
          />
        </div>

        {/* Tombol Submit */}
        <button
          type="submit"
          disabled={loading}
          className="bg-neutral-900 hover:bg-neutral-800 text-white font-medium px-5 py-2.5 rounded-lg text-sm flex items-center justify-center gap-1.5 transition disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Catat
            </>
          )}
        </button>
      </form>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-medium text-emerald-800">
          {feedback}
        </div>
      )}
    </div>
  );
}
