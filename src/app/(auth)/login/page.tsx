"use client";

import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, Loader2 } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export default function AuthPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    if (isRegister) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setErrorMsg(error.message);
      } else {
        alert("Registrasi berhasil! Silakan login.");
        setIsRegister(false);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setErrorMsg(error.message);
      } else {
        router.push("/");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-neutral-200 shadow-sm space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            {isRegister ? "Buat Akun Fintrack" : "Masuk ke Fintrack"}
          </h1>
          <p className="text-sm text-neutral-500">
            {isRegister
              ? "Daftarkan email kamu untuk mulai mencatat"
              : "Kelola transaksi dan keuangan secara fleksibel"}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-600 rounded-lg">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-700">
              Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full bg-neutral-50 border border-neutral-200 rounded-lg pl-9 pr-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-700">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-neutral-50 border border-neutral-200 rounded-lg pl-9 pr-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-medium py-2.5 rounded-lg text-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                {isRegister ? "Daftar" : "Masuk"}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-neutral-100">
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-xs font-medium text-neutral-600 hover:text-neutral-900"
          >
            {isRegister
              ? "Sudah punya akun? Login di sini"
              : "Belum punya akun? Daftar gratis"}
          </button>
        </div>
      </div>
    </div>
  );
}
