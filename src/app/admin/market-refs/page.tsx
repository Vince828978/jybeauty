"use client";
import { useState, useEffect } from "react";
import Tesseract from "tesseract.js";

interface MarketRef {
  id: number;
  sku_keyword: string;
  duration_min: number | null;
  source_name: string;
  price_low: number | null;
  price_high: number | null;
  notes: string;
  photo_filename: string;
  created_at: string;
}

interface ParsedRow {
  sku_keyword: string;
  duration_min: number | null;
  price_low: number | null;
  price_high: number | null;
}

// 從 OCR 文字解析出 SKU/時長/價格 (簡單 regex)
function parseOcrText(text: string): ParsedRow[] {
  const rows: ParsedRow[] = [];
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  for (const line of lines) {
    // 找價格 NT$ 1,200 / $1200 / 1,200 元 / NTD 1200
    const priceMatches = [...line.matchAll(/(?:NT\$|NTD|\$|＄)?\s*([0-9,]{3,6})\s*(?:元)?/g)];
    if (priceMatches.length === 0) continue;
    const prices = priceMatches.map(m => parseInt(m[1].replace(/,/g, ""))).filter(p => p >= 100 && p <= 100000);
    if (prices.length === 0) continue;
    // 找時長 (60 分 / 60min / 60 分鐘)
    const durMatch = line.match(/(\d{2,3})\s*(?:分鐘|分|min)/i);
    const duration_min = durMatch ? parseInt(durMatch[1]) : null;
    // 把時長 + 價格從行裡拿掉，剩下的就是 SKU 名稱
    let sku = line;
    if (durMatch) sku = sku.replace(durMatch[0], "");
    for (const pm of priceMatches) sku = sku.replace(pm[0], "");
    sku = sku.replace(/[$￥＄元]/g, "").replace(/\s+/g, " ").trim();
    if (sku.length < 2 || sku.length > 30) continue;
    rows.push({
      sku_keyword: sku,
      duration_min,
      price_low: Math.min(...prices),
      price_high: prices.length > 1 ? Math.max(...prices) : null,
    });
  }
  return rows;
}

const ADMIN_PASS_KEY = "jyb-admin";

export default function MarketRefsPage() {
  const [authed, setAuthed] = useState(false);
  const [pass, setPass] = useState("");
  const [refs, setRefs] = useState<MarketRef[]>([]);
  const [loading, setLoading] = useState(false);
  // OCR state
  const [ocrFile, setOcrFile] = useState<File | null>(null);
  const [ocrProgress, setOcrProgress] = useState<string>("");
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [sourceName, setSourceName] = useState("");
  // Manual add state
  const [manual, setManual] = useState<ParsedRow & { source_name: string; notes: string }>({
    sku_keyword: "", duration_min: null, price_low: null, price_high: null, source_name: "", notes: "",
  });

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem(ADMIN_PASS_KEY) === "1") setAuthed(true);
  }, []);
  useEffect(() => { if (authed) fetchRefs(); }, [authed]);

  const fetchRefs = async () => {
    const r = await fetch("/api/market-refs");
    const d = await r.json();
    setRefs(d.refs || []);
  };

  const handleLogin = async () => {
    const adminPass = process.env.NEXT_PUBLIC_ADMIN_PASS || "1234";
    if (pass === adminPass) {
      sessionStorage.setItem(ADMIN_PASS_KEY, "1");
      setAuthed(true);
    } else alert("密碼錯誤");
  };

  const handleOcr = async () => {
    if (!ocrFile) return;
    setLoading(true);
    setOcrProgress("初始化 OCR...");
    setParsedRows([]);
    try {
      const { data: { text } } = await Tesseract.recognize(ocrFile, "chi_tra", {
        logger: (m) => setOcrProgress(`${m.status} ${Math.round((m.progress || 0) * 100)}%`),
      });
      const rows = parseOcrText(text);
      setParsedRows(rows);
      setOcrProgress(`✓ OCR 完成，抓到 ${rows.length} 個價格項。請檢查並編輯後存進資料庫。`);
    } catch (e) {
      setOcrProgress("OCR 失敗: " + String(e));
    } finally {
      setLoading(false);
    }
  };

  const updateParsedRow = (idx: number, patch: Partial<ParsedRow>) => {
    setParsedRows(prev => prev.map((r, i) => i === idx ? { ...r, ...patch } : r));
  };
  const removeParsedRow = (idx: number) => setParsedRows(prev => prev.filter((_, i) => i !== idx));

  const saveParsedRows = async () => {
    if (parsedRows.length === 0) { alert("沒有東西要存"); return; }
    setLoading(true);
    let n = 0;
    for (const row of parsedRows) {
      if (!row.sku_keyword) continue;
      const r = await fetch("/api/market-refs", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...row, source_name: sourceName, photo_filename: ocrFile?.name || "" }),
      });
      if (r.ok) n++;
    }
    setLoading(false);
    alert(`存進 ${n} 筆`);
    setParsedRows([]);
    setOcrFile(null);
    setSourceName("");
    setOcrProgress("");
    fetchRefs();
  };

  const saveManual = async () => {
    if (!manual.sku_keyword) { alert("請填服務關鍵字"); return; }
    const r = await fetch("/api/market-refs", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(manual),
    });
    if (r.ok) {
      setManual({ sku_keyword: "", duration_min: null, price_low: null, price_high: null, source_name: "", notes: "" });
      fetchRefs();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("確定刪除這筆參考價？")) return;
    await fetch("/api/market-refs", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    fetchRefs();
  };

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-b from-rose-50 to-white">
        <div className="bg-white rounded-3xl p-10 max-w-sm w-full shadow-lg border border-rose-100">
          <p className="text-rose-500 text-center text-2xl font-bold mb-6">市場行情對照</p>
          <input type="password" value={pass} onChange={e => setPass(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            placeholder="密碼"
            className="w-full px-5 py-5 rounded-xl border-2 border-rose-100 text-lg text-center focus:outline-none focus:border-rose-400" />
          <button onClick={handleLogin}
            className="w-full mt-4 bg-rose-500 text-white py-5 rounded-xl text-lg font-medium active:bg-rose-600">
            進入
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/30 to-white">
      <div className="bg-white border-b border-rose-100 px-6 py-5">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-dark">📊 市場行情對照</h1>
          <a href="/admin" className="text-text-light text-sm">← 回後台</a>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-8">

        {/* 上傳菜單照片 OCR */}
        <div className="bg-white rounded-2xl p-7 border border-rose-100 shadow-sm">
          <h2 className="text-lg font-bold text-dark mb-4">📸 上傳競品菜單照片</h2>
          <p className="text-text-light text-sm mb-5">拍照或從相簿選競品的服務菜單，系統用 OCR 抓出 SKU / 時長 / 價格 → 你檢查 → 存進資料庫</p>

          <div className="space-y-4">
            <input type="text" value={sourceName} onChange={e => setSourceName(e.target.value)}
              placeholder="平台/店家名稱（例：美業自由通行 老師A）"
              className="w-full px-5 py-4 rounded-xl border border-rose-100 focus:outline-none focus:border-rose-300" />

            <input type="file" accept="image/*" onChange={e => setOcrFile(e.target.files?.[0] || null)}
              className="w-full px-5 py-4 rounded-xl border border-rose-100" />

            {ocrFile && (
              <button onClick={handleOcr} disabled={loading}
                className="w-full bg-rose-500 text-white py-4 rounded-xl text-base font-medium active:bg-rose-600 disabled:bg-rose-200">
                {loading ? "處理中..." : "🔍 開始 OCR 解析"}
              </button>
            )}

            {ocrProgress && <p className="text-sm text-text-light bg-rose-50 rounded-xl px-4 py-3">{ocrProgress}</p>}
          </div>
        </div>

        {/* OCR 解析結果 — 可編輯 */}
        {parsedRows.length > 0 && (
          <div className="bg-white rounded-2xl p-7 border border-amber-200 shadow-sm">
            <h2 className="text-lg font-bold text-dark mb-2">📋 OCR 解析結果（檢查後存）</h2>
            <p className="text-text-light text-sm mb-4">每一列可以編輯/刪除。確認後按下方「全部存進資料庫」</p>
            <div className="space-y-3">
              {parsedRows.map((row, idx) => (
                <div key={idx} className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="text-xs text-text-light mb-1 block">服務名稱</label>
                      <input value={row.sku_keyword} onChange={e => updateParsedRow(idx, { sku_keyword: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-amber-200 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs text-text-light mb-1 block">時長(分)</label>
                      <input type="number" value={row.duration_min || ""} onChange={e => updateParsedRow(idx, { duration_min: parseInt(e.target.value) || null })}
                        className="w-full px-3 py-2 rounded-lg border border-amber-200 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs text-text-light mb-1 block">價格低</label>
                      <input type="number" value={row.price_low || ""} onChange={e => updateParsedRow(idx, { price_low: parseInt(e.target.value) || null })}
                        className="w-full px-3 py-2 rounded-lg border border-amber-200 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs text-text-light mb-1 block">價格高(範圍上限，可空)</label>
                      <input type="number" value={row.price_high || ""} onChange={e => updateParsedRow(idx, { price_high: parseInt(e.target.value) || null })}
                        className="w-full px-3 py-2 rounded-lg border border-amber-200 text-sm" />
                    </div>
                  </div>
                  <button onClick={() => removeParsedRow(idx)}
                    className="text-xs text-red-500 px-3 py-1 border border-red-200 rounded-md">移除這列</button>
                </div>
              ))}
            </div>
            <button onClick={saveParsedRows} disabled={loading}
              className="w-full mt-5 bg-green-500 text-white py-4 rounded-xl font-medium active:bg-green-600 disabled:bg-green-200">
              💾 全部存進資料庫
            </button>
          </div>
        )}

        {/* 手動新增（OCR 不準時用） */}
        <details className="bg-white rounded-2xl border border-rose-100 shadow-sm">
          <summary className="px-7 py-5 cursor-pointer text-dark font-medium" style={{listStyle:"none"}}>
            ✍️ 手動新增 一筆對照（OCR 抓不準時用）
          </summary>
          <div className="px-7 pb-7 space-y-3">
            <input value={manual.sku_keyword} onChange={e => setManual({ ...manual, sku_keyword: e.target.value })}
              placeholder="服務名稱關鍵字（精油按摩、臉部基礎等）"
              className="w-full px-5 py-4 rounded-xl border border-rose-100 focus:outline-none focus:border-rose-300" />
            <div className="grid grid-cols-2 gap-3">
              <input type="number" value={manual.duration_min || ""} onChange={e => setManual({ ...manual, duration_min: parseInt(e.target.value) || null })}
                placeholder="時長 (分鐘)" className="px-5 py-4 rounded-xl border border-rose-100" />
              <input value={manual.source_name} onChange={e => setManual({ ...manual, source_name: e.target.value })}
                placeholder="來源（美業 APP / Clio...）" className="px-5 py-4 rounded-xl border border-rose-100" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input type="number" value={manual.price_low || ""} onChange={e => setManual({ ...manual, price_low: parseInt(e.target.value) || null })}
                placeholder="價格 低 / 單一" className="px-5 py-4 rounded-xl border border-rose-100" />
              <input type="number" value={manual.price_high || ""} onChange={e => setManual({ ...manual, price_high: parseInt(e.target.value) || null })}
                placeholder="價格 高 (區間上限，可空)" className="px-5 py-4 rounded-xl border border-rose-100" />
            </div>
            <input value={manual.notes} onChange={e => setManual({ ...manual, notes: e.target.value })}
              placeholder="備註（例：限女性、含車資、僅北北）" className="w-full px-5 py-4 rounded-xl border border-rose-100" />
            <button onClick={saveManual}
              className="w-full bg-rose-500 text-white py-4 rounded-xl font-medium active:bg-rose-600">＋ 新增對照</button>
          </div>
        </details>

        {/* 現有對照清單 */}
        <div className="bg-white rounded-2xl p-7 border border-rose-100 shadow-sm">
          <h2 className="text-lg font-bold text-dark mb-4">📚 已有對照 ({refs.length} 筆)</h2>
          {refs.length === 0 ? (
            <p className="text-text-light text-sm py-6 text-center">尚無資料，上傳照片或手動新增</p>
          ) : (
            <div className="space-y-3">
              {refs.map(r => (
                <div key={r.id} className="bg-rose-50/30 rounded-xl p-4 border border-rose-100">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="font-medium text-dark">{r.sku_keyword} {r.duration_min ? `${r.duration_min}min` : ""}</p>
                      <p className="text-text-light text-xs mt-1">{r.source_name || "—"}</p>
                    </div>
                    <p className="text-rose-500 font-bold text-base">
                      ${r.price_low?.toLocaleString() || "?"}
                      {r.price_high ? ` - $${r.price_high.toLocaleString()}` : ""}
                    </p>
                  </div>
                  {r.notes && <p className="text-xs text-text-light mt-1">📝 {r.notes}</p>}
                  <button onClick={() => handleDelete(r.id)}
                    className="text-xs text-red-500 mt-2 px-2 py-1 border border-red-200 rounded">刪除</button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
