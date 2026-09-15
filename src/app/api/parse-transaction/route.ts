import { NextResponse } from "next/server";
import { processAndSaveTransaction } from "@/services/parserService";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text } = body;
    const authHeader = request.headers.get("Authorization") || undefined;

    if (!text) {
      return NextResponse.json(
        { error: "Teks transaksi tidak boleh kosong" },
        { status: 400 },
      );
    }

    // Menggunakan fungsi baru yang terhubung ke Supabase
    const result = await processAndSaveTransaction(text, authHeader);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}