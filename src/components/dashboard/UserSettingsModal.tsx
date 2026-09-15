"use client";

import React, { useState } from "react";
import {
  User,
  KeyRound,
  Trash2,
  X,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

interface UserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  onDataReset: () => void;
}

export default function UserSettingsModal({
  isOpen,
  onClose,
  userEmail,
  onDataReset,
}: UserSettingsModalProps) {
  const [newPassword, setNewPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isResettingData, setIsResettingData] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // State Modal Reset Data Custom (Tanpa prompt browser)
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);
  const [confirmInputText, setConfirmInputText] = useState("");

  if (!isOpen) return null;

  // Update Password User
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setMessage({ type: "error", text: "Password minimal 6 karakter." });
      return;
    }

    setIsUpdatingPassword(true);
    setMessage(null);

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setMessage({
        type: "error",
        text: "Gagal memperbarui password: " + error.message,
      });
    } else {
      setMessage({ type: "success", text: "Password berhasil diperbarui!" });
      setNewPassword("");
    }
    setIsUpdatingPassword(false);
  };

  // Eksekusi Reset Seluruh Data Transaksi
  const handleExecuteResetData = async (e: React.FormEvent) => {
    e.preventDefault();

    if (confirmInputText.trim().toUpperCase() !== "HAPUS") {
      setMessage({
        type: "error",
        text: "Kata konfirmasi tidak cocok. Ketik HAPUS.",
      });
      return;
    }

    setIsResettingData(true);
    setMessage(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("user_id", user.id);

      if (!error) {
        setMessage({
          type: "success",
          text: "Seluruh data transaksi berhasil dibersihkan!",
        });
        setShowResetConfirmModal(false);
        setConfirmInputText("");
        onDataReset();
      } else {
        setMessage({
          type: "error",
          text: "Gagal menghapus data: " + error.message,
        });
      }
    }
    setIsResettingData(false);
  };

  const initial = userEmail ? userEmail.charAt(0).toUpperCase() : "U";

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white w-full max-w-md rounded-2xl p-6 border border-neutral-200 shadow-xl space-y-5">
          {/* Modal Header */}
          <div className="flex justify-between items-center border-b pb-3 border-neutral-100">
            <h3 className="text-base font-semibold text-neutral-900 flex items-center gap-2">
              <User className="w-4 h-4 text-neutral-600" />
              Pengaturan Akun & Profil
            </h3>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Profile Card Summary */}
          <div className="flex items-center gap-3 bg-neutral-50 p-3.5 rounded-xl border border-neutral-200">
            <div className="w-10 h-10 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-sm">
              {initial}
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-neutral-900">
                {userEmail}
              </p>
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-medium">
                <ShieldCheck className="w-3 h-3" />
                <span>Akun Terverifikasi (Authenticated)</span>
              </div>
            </div>
          </div>

          {message && (
            <div
              className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${
                message.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <AlertTriangle className="w-4 h-4" />
              )}
              {message.text}
            </div>
          )}

          {/* Form Ganti Password */}
          <form onSubmit={handleUpdatePassword} className="space-y-3 pt-1">
            <label className="text-xs font-medium text-neutral-700 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-neutral-500" />
              Ubah Password Akun
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="Masukkan password baru..."
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="flex-1 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-neutral-400"
              />
              <button
                type="submit"
                disabled={isUpdatingPassword}
                className="bg-neutral-900 hover:bg-neutral-800 text-white font-medium px-3.5 py-2 rounded-lg text-xs transition disabled:opacity-50"
              >
                {isUpdatingPassword ? "Menyimpan..." : "Update"}
              </button>
            </div>
          </form>

          {/* Zona Bahaya / Reset Data */}
          <div className="border-t border-neutral-100 pt-4 space-y-2">
            <label className="text-xs font-semibold text-red-600 flex items-center gap-1.5">
              <Trash2 className="w-3.5 h-3.5" />
              Zona Bahaya
            </label>
            <p className="text-[11px] text-neutral-400">
              Hapus seluruh catatan transaksi uji coba kamu jika ingin memulai
              pencatatan dari awal.
            </p>
            <button
              type="button"
              onClick={() => {
                setConfirmInputText("");
                setShowResetConfirmModal(true);
              }}
              className="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-medium py-2 rounded-lg text-xs transition"
            >
              Reset Seluruh Data Transaksi
            </button>
          </div>
        </div>
      </div>

      {/* SUB-MODAL KONFIRMASI RESET DATA CUSTOM (GANTIKAN PROMPT BROWSER) */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60] animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 border border-neutral-200 shadow-2xl space-y-4">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <button
                onClick={() => setShowResetConfirmModal(false)}
                className="text-neutral-400 hover:text-neutral-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-bold text-neutral-900">
                Konfirmasi Reset Data
              </h4>
              <p className="text-xs text-neutral-500 leading-relaxed">
                PERINGATAN: Seluruh riwayat transaksi kamu akan dihapus secara
                permanen. Ketik{" "}
                <span className="font-bold text-neutral-900">"HAPUS"</span> di
                bawah untuk mengonfirmasi:
              </p>
            </div>

            <form onSubmit={handleExecuteResetData} className="space-y-3">
              <input
                type="text"
                required
                placeholder='Ketik "HAPUS"'
                value={confirmInputText}
                onChange={(e) => setConfirmInputText(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-2 text-xs font-semibold tracking-wider text-center focus:outline-none focus:ring-2 focus:ring-red-500 uppercase"
              />

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowResetConfirmModal(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={
                    isResettingData ||
                    confirmInputText.trim().toUpperCase() !== "HAPUS"
                  }
                  className="px-4 py-2 text-xs font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                >
                  {isResettingData ? "Memproses..." : "Konfirmasi Reset"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
