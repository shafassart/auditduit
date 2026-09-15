import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export interface ParsedTransaction {
  amount: number;
  category: string;
  accountName: string;
  type: "Pengeluaran" | "Pemasukan";
  rawText: string;
  createdAt?: string;
}

const DATA_TRAINING = [
  { teks: "beli bakso dan es teh", kategori: "Makanan & Minuman" },
  { teks: "makan siang nasi padang", kategori: "Makanan & Minuman" },
  { teks: "kopi susu americano starbucks", kategori: "Makanan & Minuman" },
  { teks: "jajanan pasar cilok gorengan", kategori: "Makanan & Minuman" },
  { teks: "isi bensin pertamax motor", kategori: "Transportasi" },
  { teks: "bayar parkir indomaret motor", kategori: "Transportasi" },
  { teks: "naik gojek grab ke kantor", kategori: "Transportasi" },
  { teks: "bayar listrik air wifi bulanan", kategori: "Tagihan" },
  { teks: "beli pulsa kuota internet", kategori: "Tagihan" },
  { teks: "dapat transferan gaji bulanan", kategori: "Pemasukan" },
  { teks: "gajian bulanan masuk", kategori: "Pemasukan" },
  { teks: "bonus projek cashback refund omset dimsum", kategori: "Pemasukan" },
];

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((word) => word.length > 1);
}

export function extractNominal(teks: string): number {
  const match = teks.toLowerCase().match(/(\d+[\d\.,]*)\s*(rb|k|jt|juta)?/);
  if (!match) return 0;

  let angkaStr = match[1].replace(/[\.,]/g, "");
  let nominal = parseInt(angkaStr, 10);
  const unit = match[2];

  if (unit === "rb" || unit === "k") nominal *= 1000;
  if (unit === "jt" || unit === "juta") nominal *= 1000000;

  return nominal;
}

export function extractDate(teks: string): Date {
  const now = new Date();
  const textLower = teks.toLowerCase();

  if (textLower.includes("kemarin lusa")) {
    now.setDate(now.getDate() - 2);
    return now;
  }

  if (textLower.includes("kemarin")) {
    now.setDate(now.getDate() - 1);
    return now;
  }

  const matchTgl = textLower.match(/(?:tgl|tanggal)\s+(\d{1,2})/);
  if (matchTgl) {
    const day = parseInt(matchTgl[1], 10);
    if (day >= 1 && day <= 31) {
      now.setDate(day);
      return now;
    }
  }

  return now;
}

export function predictKategori(teksInput: string): string {
  const words = tokenize(teksInput);
  const categories = Array.from(
    new Set(DATA_TRAINING.map((item) => item.kategori)),
  );

  let bestCategory = "Lain-lain";
  let maxScore = -Infinity;

  categories.forEach((category) => {
    const categoryDocs = DATA_TRAINING.filter(
      (item) => item.kategori === category,
    );
    let score = Math.log(categoryDocs.length / DATA_TRAINING.length);

    const categoryWords = categoryDocs.flatMap((item) => tokenize(item.teks));
    const vocabSize = Array.from(
      new Set(DATA_TRAINING.flatMap((item) => tokenize(item.teks))),
    ).length;

    words.forEach((word) => {
      const wordCount = categoryWords.filter((w) => w === word).length;
      const wordProbability =
        (wordCount + 1) / (categoryWords.length + vocabSize);
      score += Math.log(wordProbability);
    });

    if (score > maxScore) {
      maxScore = score;
      bestCategory = category;
    }
  });

  return bestCategory;
}

export async function processAndSaveTransaction(
  inputTeks: string,
  authHeader?: string,
): Promise<ParsedTransaction> {
  const amount = extractNominal(inputTeks);
  const transactionDate = extractDate(inputTeks).toISOString();
  const textLower = inputTeks.toLowerCase();

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: authHeader ? { Authorization: authHeader } : {},
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: accounts } = await supabase.from("accounts").select("id, name");

  const findAccountInString = (str: string, excludeId?: string) => {
    if (!accounts) return undefined;
    return accounts
      .filter((acc) => acc.id !== excludeId)
      .find((acc) => {
        const nameLower = acc.name.toLowerCase().trim().replace(/\s+/g, " ");
        const strLower = str.toLowerCase().trim().replace(/\s+/g, " ");
        const regex = new RegExp(`(?:^|\\s|\\b)${nameLower}(?:$|\\s|\\b)`, "i");
        return regex.test(strLower);
      });
  };

  const isTransferKeyword = ["transfer", "pindah", "pindahin", "kirim"].some(
    (kw) => textLower.includes(kw),
  );

  if (isTransferKeyword && accounts && accounts.length >= 2) {
    let sourceAcc: (typeof accounts)[0] | undefined;
    let targetAcc: (typeof accounts)[0] | undefined;

    const matchDari = textLower.match(/dari\s+([a-z0-9\s]+)/i);
    const matchKe = textLower.match(/ke\s+([a-z0-9\s]+)/i);

    if (matchDari) sourceAcc = findAccountInString(matchDari[1]);
    if (matchKe) targetAcc = findAccountInString(matchKe[1], sourceAcc?.id);

    if (!sourceAcc || !targetAcc) {
      const foundAccounts = accounts.filter((acc) => {
        const regex = new RegExp(`\\b${acc.name.toLowerCase().trim()}\\b`, "i");
        return regex.test(textLower);
      });

      if (foundAccounts.length >= 2) {
        sourceAcc = sourceAcc || foundAccounts[0];
        targetAcc = targetAcc || foundAccounts[1];
      }
    }

    if (sourceAcc && targetAcc && sourceAcc.id !== targetAcc.id) {
      await supabase.from("transactions").insert([
        {
          user_id: user?.id,
          amount,
          category: "Transfer Keluar",
          type: "Pengeluaran",
          account_id: sourceAcc.id,
          account_name: sourceAcc.name,
          raw_text: `Transfer ke ${targetAcc.name}: "${inputTeks}"`,
          created_at: transactionDate,
        },
      ]);

      await supabase.from("transactions").insert([
        {
          user_id: user?.id,
          amount,
          category: "Transfer Masuk",
          type: "Pemasukan",
          account_id: targetAcc.id,
          account_name: targetAcc.name,
          raw_text: `Transfer dari ${sourceAcc.name}: "${inputTeks}"`,
          created_at: transactionDate,
        },
      ]);

      return {
        amount,
        category: "Transfer",
        accountName: `${sourceAcc.name} ➔ ${targetAcc.name}`,
        type: "Pengeluaran",
        rawText: inputTeks,
        createdAt: transactionDate,
      };
    }
  }

  let category = predictKategori(inputTeks);
  const isPemasukanKeyword = [
    "gaji",
    "gajian",
    "omset",
    "cair",
    "dapat uang",
    "masuk",
  ].some((kw) => textLower.includes(kw));
  if (isPemasukanKeyword) category = "Pemasukan";

  const type = category === "Pemasukan" ? "Pemasukan" : "Pengeluaran";

  let matchedAccount = findAccountInString(textLower);
  let accountName = matchedAccount
    ? matchedAccount.name
    : accounts?.[0]?.name || "Cash";
  let accountId = matchedAccount ? matchedAccount.id : accounts?.[0]?.id;

  const { error } = await supabase.from("transactions").insert([
    {
      user_id: user?.id,
      amount,
      category,
      type,
      account_id: accountId,
      account_name: accountName,
      raw_text: inputTeks,
      created_at: transactionDate,
    },
  ]);

  if (error) console.error("Supabase Insert Error:", error);

  return {
    amount,
    category,
    accountName,
    type,
    rawText: inputTeks,
    createdAt: transactionDate,
  };
}
