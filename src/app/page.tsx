"use client";

import React, { useEffect, useState, useMemo } from "react";
import QuickInputForm from "@/components/dashboard/QuickInputForm";
import CalendarView from "@/components/dashboard/CalendarView";
import CashflowSummary from "@/components/dashboard/CashflowSummary";
import AccountList from "@/components/dashboard/AccountList";
import TransactionList from "@/components/dashboard/TransactionList";
import CashflowAnalytics from "@/components/dashboard/CashflowAnalytics";
import AddAccountModal from "@/components/dashboard/AddAccountModal";
import UserSettingsModal from "@/components/dashboard/UserSettingsModal";
import MobileBottomBar from "@/components/dashboard/MobileBottomBar";
import Toast, { ToastMessage } from "@/components/ui/Toast";
import ConfirmModal from "@/components/ui/ConfirmModal";
import {
  LogOut,
  ReceiptText,
  LayoutDashboard,
  Filter,
  FileText,
  Edit3,
  X,
  Settings,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export default function Home() {
  const [activeTab, setActiveTab] = useState<"transactions" | "dashboard">(
    "transactions",
  );

  const [transactions, setTransactions] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [userEmail, setUserEmail] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Toast System State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (
    type: "success" | "error" | "info",
    title: string,
    description?: string,
  ) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, title, description }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // State untuk Konfirmasi Hapus
  const [deleteConfirmState, setDeleteConfirmState] = useState<{
    isOpen: boolean;
    type: "account" | "transaction" | null;
    id: string;
    name: string;
  }>({
    isOpen: false,
    type: null,
    id: "",
    name: "",
  });

  // Filter States
  const [selectedAccountFilter, setSelectedAccountFilter] =
    useState<string>("all");
  const [selectedCategoryFilter, setSelectedCategoryFilter] =
    useState<string>("all");
  const [selectedDateFilter, setSelectedDateFilter] = useState<Date | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [newAccName, setNewAccName] = useState("");
  const [newAccType, setNewAccType] = useState("Bank");
  const [isSubmittingAcc, setIsSubmittingAcc] = useState(false);

  const [editingTx, setEditingTx] = useState<any | null>(null);
  const [editAmount, setEditAmount] = useState<number>(0);
  const [editCategory, setEditCategory] = useState<string>("");
  const [editAccountName, setEditAccountName] = useState<string>("");
  const [editType, setEditType] = useState<string>("Pengeluaran");
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  const router = useRouter();

  const checkUserAndFetchData = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    setUserEmail(user.email || "");

    const { data: txData } = await supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false });
    if (txData) setTransactions(txData);

    const { data: accData } = await supabase
      .from("accounts")
      .select("*")
      .order("created_at", { ascending: true });
    if (accData) setAccounts(accData);

    setLoading(false);
  };

  useEffect(() => {
    checkUserAndFetchData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // Filter Logic
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchAccount =
        selectedAccountFilter === "all" ||
        t.account_name?.toLowerCase() === selectedAccountFilter.toLowerCase();
      const matchCategory =
        selectedCategoryFilter === "all" ||
        t.category === selectedCategoryFilter;

      let matchDate = true;
      if (selectedDateFilter) {
        const txDate = new Date(t.created_at);
        matchDate =
          txDate.getDate() === selectedDateFilter.getDate() &&
          txDate.getMonth() === selectedDateFilter.getMonth() &&
          txDate.getFullYear() === selectedDateFilter.getFullYear();
      }

      const queryLower = searchQuery.toLowerCase().trim();
      const matchSearch =
        !queryLower ||
        t.raw_text?.toLowerCase().includes(queryLower) ||
        t.category?.toLowerCase().includes(queryLower) ||
        t.account_name?.toLowerCase().includes(queryLower);

      return matchAccount && matchCategory && matchDate && matchSearch;
    });
  }, [
    transactions,
    selectedAccountFilter,
    selectedCategoryFilter,
    selectedDateFilter,
    searchQuery,
  ]);

  // Analytics Chart Data
  const categoryChartData = useMemo(() => {
    const expenses = filteredTransactions.filter(
      (t) => t.type === "Pengeluaran",
    );
    const grouped = expenses.reduce((acc: any, t) => {
      const cat = t.category || "Lain-lain";
      acc[cat] = (acc[cat] || 0) + Number(t.amount);
      return acc;
    }, {});

    return Object.keys(grouped).map((key) => ({
      name: key,
      value: grouped[key],
    }));
  }, [filteredTransactions]);

  const categoriesList = useMemo(() => {
    return Array.from(
      new Set(transactions.map((t) => t.category).filter(Boolean)),
    );
  }, [transactions]);

  // Totals Calculation
  const totalPengeluaran = filteredTransactions
    .filter((t) => t.type === "Pengeluaran")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalPemasukan = filteredTransactions
    .filter((t) => t.type === "Pemasukan")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalSaldo = totalPemasukan - totalPengeluaran;

  // Export CSV
  const exportToCSV = () => {
    if (filteredTransactions.length === 0) {
      addToast(
        "error",
        "Gagal Export",
        "Tidak ada data transaksi untuk diexport.",
      );
      return;
    }

    const headers = [
      "ID",
      "Tanggal",
      "Keterangan",
      "Kategori",
      "Tipe",
      "Nominal",
      "Sumber Dana",
    ];
    const rows = filteredTransactions.map((t) => [
      t.id,
      `"${new Date(t.created_at).toLocaleString("id-ID")}"`,
      `"${(t.raw_text || "").replace(/"/g, '""')}"`,
      `"${t.category || ""}"`,
      `"${t.type || ""}"`,
      t.amount,
      `"${t.account_name || ""}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `fintrack-export-${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast(
      "success",
      "Export CSV Berhasil",
      `Berhasil mendownload ${filteredTransactions.length} transaksi.`,
    );
  };

  // Export PDF
  const exportCashflowPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("FINTRACK - LAPORAN CASHFLOW", 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`User Email : ${userEmail}`, 14, 27);
    doc.text(
      `Tanggal Cetak : ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`,
      14,
      33,
    );
    doc.text(
      `Filter Rekening : ${selectedAccountFilter === "all" ? "Semua Rekening" : selectedAccountFilter}`,
      14,
      39,
    );
    doc.text(
      `Filter Kategori : ${selectedCategoryFilter === "all" ? "Semua Kategori" : selectedCategoryFilter}`,
      14,
      45,
    );

    doc.setLineWidth(0.5);
    doc.line(14, 49, 196, 49);

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text("Ringkasan Cashflow", 14, 57);

    const summaryData = [
      ["Total Pemasukan", `Rp ${totalPemasukan.toLocaleString("id-ID")}`],
      ["Total Pengeluaran", `Rp ${totalPengeluaran.toLocaleString("id-ID")}`],
      ["Net Sisa Saldo", `Rp ${totalSaldo.toLocaleString("id-ID")}`],
    ];

    autoTable(doc, {
      startY: 61,
      head: [["Kategori Cashflow", "Jumlah (IDR)"]],
      body: summaryData,
      theme: "striped",
      headStyles: { fillColor: [24, 24, 27] },
    });

    let currentY = (doc as any).lastAutoTable.finalY + 12;
    doc.text("Rincian Pengeluaran per Kategori", 14, currentY);

    const categoryRows = categoryChartData.map((item) => [
      item.name,
      `Rp ${item.value.toLocaleString("id-ID")}`,
      `${totalPengeluaran > 0 ? ((item.value / totalPengeluaran) * 100).toFixed(1) : 0}%`,
    ]);

    autoTable(doc, {
      startY: currentY + 4,
      head: [["Kategori", "Total Nominal", "Persentase"]],
      body:
        categoryRows.length > 0
          ? categoryRows
          : [["Belum ada pengeluaran", "-", "-"]],
      theme: "grid",
      headStyles: { fillColor: [59, 130, 246] },
    });

    currentY = (doc as any).lastAutoTable.finalY + 12;
    doc.text("Status Saldo per Rekening", 14, currentY);

    const accountRows = accounts.map((acc) => {
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

      return [acc.name, acc.type, `Rp ${balance.toLocaleString("id-ID")}`];
    });

    autoTable(doc, {
      startY: currentY + 4,
      head: [["Nama Rekening", "Tipe", "Sisa Saldo"]],
      body: accountRows,
      theme: "plain",
      headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255] },
    });

    doc.save(
      `fintrack-cashflow-report-${new Date().toISOString().slice(0, 10)}.pdf`,
    );
    addToast(
      "success",
      "Laporan PDF Berhasil Ditulis",
      "File laporan cashflow berhasil terunduh.",
    );
  };

  // Handlers for Accounts & Transactions
  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccName.trim()) return;
    setIsSubmittingAcc(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { error } = await supabase.from("accounts").insert([
        {
          user_id: user.id,
          name: newAccName.trim(),
          type: newAccType,
        },
      ]);
      if (!error) {
        setNewAccName("");
        setIsModalOpen(false);
        addToast(
          "success",
          "Rekening Ditambahkan",
          `Sumber dana "${newAccName}" berhasil dibuat.`,
        );
        checkUserAndFetchData();
      } else {
        addToast("error", "Gagal Menambah Rekening", error.message);
      }
    }
    setIsSubmittingAcc(false);
  };

  // const handleDeleteAccount = async (id: string, name: string) => {
  //   if (confirm(`Yakin ingin menghapus rekening "${name}"?`)) {
  //     const { error } = await supabase.from("accounts").delete().eq("id", id);
  //     if (!error) {
  //       addToast(
  //         "info",
  //         "Rekening Dihapus",
  //         `Rekening "${name}" telah dihapus.`,
  //       );
  //       checkUserAndFetchData();
  //     } else {
  //       addToast("error", "Gagal Menghapus", error.message);
  //     }
  //   }
  // };

  // const handleDeleteTransaction = async (id: string, text: string) => {
  //   if (confirm(`Hapus catatan transaksi: "${text}"?`)) {
  //     const { error } = await supabase
  //       .from("transactions")
  //       .delete()
  //       .eq("id", id);
  //     if (!error) {
  //       addToast(
  //         "info",
  //         "Transaksi Dihapus",
  //         `Catatan "${text}" telah dihapus.`,
  //       );
  //       checkUserAndFetchData();
  //     } else {
  //       addToast("error", "Gagal Menghapus Transaksi", error.message);
  //     }
  //   }
  // };

  // Pemicu Modal Konfirmasi Hapus Rekening
  const triggerDeleteAccount = (id: string, name: string) => {
    setDeleteConfirmState({
      isOpen: true,
      type: "account",
      id,
      name,
    });
  };

  // Pemicu Modal Konfirmasi Hapus Transaksi
  const triggerDeleteTransaction = (id: string, text: string) => {
    setDeleteConfirmState({
      isOpen: true,
      type: "transaction",
      id,
      name: text,
    });
  };

  // Eksekutor Hapus yang Dipanggil Modal
  const executeDelete = async () => {
    const { type, id, name } = deleteConfirmState;

    if (type === "account") {
      const { error } = await supabase.from("accounts").delete().eq("id", id);
      if (!error) {
        addToast(
          "info",
          "Rekening Dihapus",
          `Rekening "${name}" telah dihapus.`,
        );
        checkUserAndFetchData();
      } else {
        addToast("error", "Gagal Menghapus", error.message);
      }
    } else if (type === "transaction") {
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id);
      if (!error) {
        addToast(
          "info",
          "Transaksi Dihapus",
          `Catatan "${name}" telah dihapus.`,
        );
        checkUserAndFetchData();
      } else {
        addToast("error", "Gagal Menghapus Transaksi", error.message);
      }
    }
  };

  const openEditModal = (tx: any) => {
    setEditingTx(tx);
    setEditAmount(tx.amount);
    setEditCategory(tx.category);
    setEditAccountName(tx.account_name);
    setEditType(tx.type);
  };

  const handleUpdateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx) return;
    setIsSubmittingEdit(true);

    const selectedAcc = accounts.find(
      (a) => a.name.toLowerCase() === editAccountName.toLowerCase(),
    );

    const { error } = await supabase
      .from("transactions")
      .update({
        amount: editAmount,
        category: editCategory,
        account_name: editAccountName,
        account_id: selectedAcc?.id || editingTx.account_id,
        type: editType,
      })
      .eq("id", editingTx.id);

    if (!error) {
      setEditingTx(null);
      addToast(
        "success",
        "Transaksi Diperbarui",
        "Perubahan transaksi berhasil disimpan.",
      );
      checkUserAndFetchData();
    } else {
      addToast("error", "Gagal Memperbarui", error.message);
    }
    setIsSubmittingEdit(false);
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 p-4 md:p-8 font-sans pb-24 sm:pb-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* HEADER & USER PROFILE WIDGET */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-neutral-200">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="w-10 h-10 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white flex items-center justify-center font-bold text-sm shadow-sm transition relative group"
              title="Buka Pengaturan Profil"
            >
              {userEmail ? userEmail.charAt(0).toUpperCase() : "U"}
              <span className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 border border-neutral-200 text-neutral-600">
                <Settings className="w-3 h-3" />
              </span>
            </button>

            <div>
              <h1 className="text-xl font-bold tracking-tight text-neutral-900">
                Fintrack Workspace
              </h1>
              <p className="text-xs text-neutral-500">
                {userEmail
                  ? `User: ${userEmail}`
                  : "Kelola catatan transaksi & kelancaran cashflow"}
              </p>
            </div>
          </div>

          {/* TAB NAVIGATION (Desktop View) */}
          <div className="hidden sm:flex items-center gap-2 bg-neutral-200/60 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("transactions")}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === "transactions"
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              <ReceiptText className="w-4 h-4" />
              Catatan Transaksi
            </button>
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === "dashboard"
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Cashflow Dashboard
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-1.5 text-xs font-medium text-neutral-700 hover:text-neutral-900 transition bg-neutral-100 hover:bg-neutral-200 px-3 py-2 rounded-lg border border-neutral-200"
            >
              <Settings className="w-3.5 h-3.5" />
              Pengaturan
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-medium text-neutral-600 hover:text-red-600 transition bg-neutral-100 hover:bg-red-50 px-3 py-2 rounded-lg border border-neutral-200"
            >
              <LogOut className="w-3.5 h-3.5" />
              Keluar
            </button>
          </div>
        </header>

        {/* TAB 1: TRANSACTIONS */}
        {activeTab === "transactions" && (
          <div className="space-y-6">
            <QuickInputForm
              onSuccess={() => {
                checkUserAndFetchData();
                addToast(
                  "success",
                  "Transaksi Disimpan",
                  "Catatan transaksi NLP kamu berhasil dibuat.",
                );
              }}
            />

            <AccountList
              accounts={accounts}
              transactions={transactions}
              selectedAccountFilter={selectedAccountFilter}
              onSelectAccount={setSelectedAccountFilter}
              onOpenAddModal={() => setIsModalOpen(true)}
              onDeleteAccount={triggerDeleteAccount}
            />

            <CalendarView
              transactions={transactions}
              selectedDate={selectedDateFilter}
              onSelectDate={(date) => setSelectedDateFilter(date)}
            />

            <TransactionList
              loading={loading}
              filteredTransactions={filteredTransactions}
              selectedDateFilter={selectedDateFilter}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onExportCSV={exportToCSV}
              onOpenEditModal={openEditModal}
              onDeleteTransaction={triggerDeleteTransaction}
            />
          </div>
        )}

        {/* TAB 2: CASHFLOW DASHBOARD */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <div className="bg-white p-3.5 rounded-xl border border-neutral-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-neutral-700">
                <Filter className="w-4 h-4 text-neutral-500" />
                Filter Cashflow:
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={selectedAccountFilter}
                  onChange={(e) => setSelectedAccountFilter(e.target.value)}
                  className="bg-neutral-50 border border-neutral-200 rounded-lg px-2.5 py-1.5 text-neutral-700 font-medium focus:outline-none"
                >
                  <option value="all">Semua Rekening</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.name}>
                      {acc.name}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="bg-neutral-50 border border-neutral-200 rounded-lg px-2.5 py-1.5 text-neutral-700 font-medium focus:outline-none"
                >
                  <option value="all">Semua Kategori</option>
                  {categoriesList.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                <button
                  onClick={exportCashflowPDF}
                  className="flex items-center gap-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 px-3 py-1.5 rounded-lg transition"
                  title="Unduh Laporan Ringkasan Cashflow ke PDF"
                >
                  <FileText className="w-3.5 h-3.5 text-red-400" />
                  Cetak Laporan PDF
                </button>
              </div>
            </div>

            <CashflowSummary
              totalSaldo={totalSaldo}
              totalPemasukan={totalPemasukan}
              totalPengeluaran={totalPengeluaran}
              transactionCount={filteredTransactions.length}
            />

            <CashflowAnalytics categoryChartData={categoryChartData} />
          </div>
        )}
      </div>

      {/* EDIT TRANSACTION MODAL */}
      {editingTx && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 border border-neutral-200 shadow-lg space-y-4">
            <div className="flex justify-between items-center border-b pb-3 border-neutral-100">
              <h3 className="text-base font-semibold text-neutral-900 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-neutral-600" />
                Edit Transaksi
              </h3>
              <button
                onClick={() => setEditingTx(null)}
                className="text-neutral-400 hover:text-neutral-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateTransaction} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-700">
                  Teks Asli
                </label>
                <p className="text-xs text-neutral-500 italic bg-neutral-50 p-2 rounded-lg border border-neutral-200">
                  "{editingTx.raw_text}"
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-700">
                    Nominal (Rp)
                  </label>
                  <input
                    type="number"
                    required
                    value={editAmount}
                    onChange={(e) => setEditAmount(Number(e.target.value))}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-700">
                    Tipe
                  </label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
                  >
                    <option value="Pengeluaran">Pengeluaran</option>
                    <option value="Pemasukan">Pemasukan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-700">
                    Kategori
                  </label>
                  <input
                    type="text"
                    required
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-700">
                    Sumber Dana
                  </label>
                  <select
                    value={editAccountName}
                    onChange={(e) => setEditAccountName(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.name}>
                        {acc.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setEditingTx(null)}
                  className="px-4 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEdit}
                  className="px-4 py-2 text-xs font-medium bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg transition disabled:opacity-50"
                >
                  {isSubmittingEdit ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD ACCOUNT MODAL */}
      <AddAccountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddAccount}
        newAccName={newAccName}
        setNewAccName={setNewAccName}
        newAccType={newAccType}
        setNewAccType={setNewAccType}
        isSubmitting={isSubmittingAcc}
      />

      {/* USER SETTINGS MODAL */}
      <UserSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        userEmail={userEmail}
        onDataReset={checkUserAndFetchData}
      />

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <MobileBottomBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* TOAST CONTAINER */}
      <Toast toasts={toasts} onClose={removeToast} />

      {/* MODAL KONFIRMASI HAPUS KUSTOM */}
      <ConfirmModal
        isOpen={deleteConfirmState.isOpen}
        onClose={() =>
          setDeleteConfirmState((prev) => ({ ...prev, isOpen: false }))
        }
        onConfirm={executeDelete}
        title={
          deleteConfirmState.type === "account"
            ? "Hapus Sumber Dana?"
            : "Hapus Catatan Transaksi?"
        }
        description={
          deleteConfirmState.type === "account"
            ? `Apakah Anda yakin ingin menghapus rekening "${deleteConfirmState.name}"? Tindakan ini tidak dapat dibatalkan.`
            : `Apakah Anda yakin ingin menghapus transaksi "${deleteConfirmState.name}"?`
        }
        confirmText="Hapus Permanen"
        isDangerous={true}
      />
    </div>
  );
}
