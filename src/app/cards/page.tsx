"use client";
import { useState } from "react";

// 肉包 #5100/#5105 2026-06-01: 禮品卡 / 儲值卡 購買頁

type CardOption = { price: number; value: number; label: string; desc: string; bonus?: string };
const GIFT_OPTIONS: CardOption[] = [
  { price: 1500, value: 1500, label: "體驗禮品卡", desc: "送朋友嘗試 JY Beauty" },
  { price: 3000, value: 3000, label: "暖心禮品卡", desc: "生日 / 紀念日送禮主力款" },
  { price: 5000, value: 5000, label: "療癒禮品卡", desc: "母親節 / 感恩禮高端款" },
];
const STORED_OPTIONS: CardOption[] = [
  { price: 10000, value: 11000, label: "儲值卡 萬送千", bonus: "+10%", desc: "買 10,000 卡內 11,000，加值就用" },
];

type Mode = "gift" | "stored";

export default function CardsPage() {
  const [mode, setMode] = useState<Mode>("gift");
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ code: string; face_value: number; price: number; type: string } | null>(null);

  const options = mode === "gift" ? GIFT_OPTIONS : STORED_OPTIONS;
  const selected = options.find(o => o.price === selectedPrice);

  const submit = async () => {
    if (!selectedPrice || !buyerName || !buyerPhone) {
      alert("請選金額並填購買者資訊");
      return;
    }
    setSubmitting(true);
    try {
      const r = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: mode,
          price: selectedPrice,
          buyer_name: buyerName,
          buyer_phone: buyerPhone,
          receiver_name: mode === "gift" ? receiverName : undefined,
          receiver_phone: mode === "gift" ? receiverPhone : undefined,
          message: message || undefined,
        }),
      });
      const d = await r.json();
      if (d.ok) {
        setResult({ code: d.card.code, face_value: d.card.face_value, price: d.card.price, type: d.card.type });
      } else {
        alert("訂單建立失敗: " + (d.error || "未知"));
      }
    } catch (e) {
      alert("錯誤: " + e);
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <div className="min-h-screen bg-warm-bg flex items-center justify-center px-6">
        <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-lg">
          <div className="text-5xl mb-4">{result.type === "gift" ? "🎁" : "💳"}</div>
          <h2 className="font-serif-tc text-2xl font-bold text-warm-text mb-3">訂單已建立</h2>
          <p className="text-warm-text/70 mb-6">請使用 LINE Pay 付款 NT$ {result.price.toLocaleString()}，付款後我們會 LINE 通知妳啟用</p>

          {result.type === "gift" && (
            <div className="bg-pink-50 border-2 border-dashed border-pink-300 rounded-2xl p-5 mb-6">
              <p className="text-pink-700 text-xs tracking-widest mb-2">兌換碼（妳的朋友拿這個換）</p>
              <p className="font-mono font-bold text-3xl text-pink-800 tracking-widest">{result.code}</p>
              <p className="text-pink-600 text-xs mt-2">卡內額度 NT$ {result.face_value.toLocaleString()}</p>
            </div>
          )}

          {result.type === "stored" && (
            <div className="bg-gold-light/30 border-2 border-gold rounded-2xl p-5 mb-6">
              <p className="text-gold-dark text-xs tracking-widest mb-2">付款後額度直接入妳會員</p>
              <p className="font-bold text-3xl text-gold-dark">NT$ {result.face_value.toLocaleString()}</p>
            </div>
          )}

          <a href="/member" className="block bg-gold text-white py-4 rounded-2xl font-medium">回會員中心</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-bg pb-20">
      <div className="bg-white border-b border-gold-light/30 px-6 py-6 text-center">
        <p className="font-serif-tc text-2xl font-bold text-warm-text"><span className="text-gold">JY</span> Beauty</p>
        <p className="text-warm-text/60 text-sm mt-1">禮品卡 / 儲值卡</p>
      </div>

      <div className="max-w-md mx-auto px-6 py-8">
        {/* mode 切換 */}
        <div className="flex bg-white rounded-2xl p-1.5 mb-6 shadow-sm">
          <button onClick={() => { setMode("gift"); setSelectedPrice(null); }}
            className={`flex-1 py-3 rounded-xl font-medium transition-colors ${mode === "gift" ? "bg-pink-500 text-white" : "text-warm-text/60"}`}>
            🎁 禮品卡（送禮）
          </button>
          <button onClick={() => { setMode("stored"); setSelectedPrice(null); }}
            className={`flex-1 py-3 rounded-xl font-medium transition-colors ${mode === "stored" ? "bg-gold text-white" : "text-warm-text/60"}`}>
            💳 儲值卡（自用）
          </button>
        </div>

        {/* 套餐選 */}
        <div className="space-y-3 mb-6">
          {options.map(o => (
            <button key={o.price} onClick={() => setSelectedPrice(o.price)}
              className={`w-full text-left rounded-2xl p-5 border-2 transition-colors ${selectedPrice === o.price ? "border-gold bg-gold-light/30" : "border-gold-light/30 bg-white"}`}>
              <div className="flex items-baseline justify-between">
                <p className="font-serif-tc text-lg font-bold text-warm-text">{o.label}</p>
                {o.bonus && (
                  <span className="text-pink-600 text-xs font-bold bg-pink-50 px-2 py-0.5 rounded-full">{o.bonus}</span>
                )}
              </div>
              <p className="text-warm-text/60 text-sm mt-1">{o.desc}</p>
              <div className="flex items-baseline gap-2 mt-3">
                <span className="text-warm-text font-bold text-2xl">NT$ {o.price.toLocaleString()}</span>
                {o.value !== o.price && (
                  <>
                    <span className="text-warm-text/40">→ 卡內</span>
                    <span className="text-gold-dark font-bold text-xl">${o.value.toLocaleString()}</span>
                  </>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* 表單 */}
        {selectedPrice && (
          <div className="bg-white rounded-2xl p-5 space-y-4 shadow-sm">
            <p className="font-serif-tc text-lg text-warm-text">購買者資訊</p>
            <input value={buyerName} onChange={e => setBuyerName(e.target.value)} placeholder="妳的姓名 *"
              className="w-full px-4 py-3 rounded-xl border border-gold-light/40" />
            <input value={buyerPhone} onChange={e => setBuyerPhone(e.target.value)} placeholder="妳的電話 *"
              className="w-full px-4 py-3 rounded-xl border border-gold-light/40" />

            {mode === "gift" && (
              <>
                <p className="font-serif-tc text-lg text-warm-text pt-3">收禮者（可不填，妳收到 code 自己轉送也行）</p>
                <input value={receiverName} onChange={e => setReceiverName(e.target.value)} placeholder="收禮者姓名"
                  className="w-full px-4 py-3 rounded-xl border border-gold-light/40" />
                <input value={receiverPhone} onChange={e => setReceiverPhone(e.target.value)} placeholder="收禮者電話"
                  className="w-full px-4 py-3 rounded-xl border border-gold-light/40" />
                <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="想對對方說的話 (印在卡上)"
                  rows={3} className="w-full px-4 py-3 rounded-xl border border-gold-light/40 resize-none" />
              </>
            )}

            <button onClick={submit} disabled={submitting}
              className={`w-full py-4 rounded-2xl font-bold text-white transition-colors ${submitting ? "bg-gray-400" : mode === "gift" ? "bg-pink-500 active:bg-pink-600" : "bg-gold active:bg-gold-dark"}`}>
              {submitting ? "建立中..." : `確認購買 NT$ ${selectedPrice.toLocaleString()}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
