"use client";
import { useState } from "react";
import Image from "next/image";

const packages = [
  { id: "basic", tier: "Basic", name: "舒壓放鬆套餐", price: 2280, items: ["精油按摩 60 min", "臉部保養 基礎護理"] },
  { id: "popular", tier: "Popular", name: "能量煥膚套餐", price: 3480, items: ["精油按摩 90 min", "臉部保養 深層護理", "身體加項 任選 1 項"], popular: true },
  { id: "luxury", tier: "Luxury", name: "極致寵愛套餐", price: 4880, items: ["精油按摩 120 min", "臉部保養 深層護理", "身體加項 任選 2 項", "臉部加項 任選 1 項"] },
];

const bodyAddons = [
  { id: "hotstone", name: "熱石深層舒緩", dur: "30min", price: 200 },
  { id: "guasha", name: "刮痧/筋膜放鬆", dur: "30min", price: 300 },
  { id: "head", name: "頭療（含耳燭）", dur: "30min", price: 400 },
  { id: "boost", name: "加乘體驗放鬆 UP", dur: "15min", price: 300 },
];

const faceAddons = [
  { id: "lulu", name: "Lulu SPA 煥顏護理", dur: "40min", price: 600 },
  { id: "slim", name: "臉部瘦小臉", dur: "20min", price: 500 },
  { id: "firm", name: "細緻護理 緊緻拉提", dur: "", price: 500 },
  { id: "glow", name: "導入亮光 由內而外透亮", dur: "", price: 500 },
];

const timeSlots = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];

function getNextDays(count: number) {
  const days = [];
  const now = new Date();
  for (let i = 1; i <= count; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    days.push(d);
  }
  return days;
}

const bookedSlots: Record<string, string[]> = {};

export default function BookingPage() {
  const [step, setStep] = useState(0);
  const [selectedPkg, setSelectedPkg] = useState("");
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceMode, setServiceMode] = useState<"home"|"studio">("home");
  const [address, setAddress] = useState("");
  const [referralPhone, setReferralPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const days = getNextDays(14);
  const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
  const pkg = packages.find((p) => p.id === selectedPkg);
  const allAddons = [...bodyAddons, ...faceAddons];
  const addonTotal = selectedAddons.reduce((sum, id) => {
    const a = allAddons.find((x) => x.id === id);
    return sum + (a?.price || 0);
  }, 0);
  const total = (pkg?.price || 0) + addonTotal;

  const toggleAddon = (id: string) => {
    setSelectedAddons((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const booked = bookedSlots[selectedDate] || [];

  if (submitted) {
    return (
      <div className="min-h-screen bg-warm-bg flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gold"><path d="M20 6L9 17l-5-5"/></svg>
          </div>
          <h2 className="font-serif-tc text-2xl font-bold text-dark mb-3">預約成功</h2>
          <p className="text-text-light mb-6">感謝你的預約！我們會盡快透過 LINE 與你確認詳細時間。</p>
          <div className="bg-cream/50 rounded-xl p-5 text-left text-sm space-y-2 mb-6">
            <div className="flex justify-between"><span className="text-text-light">套餐</span><span className="text-dark font-medium">{pkg?.name}</span></div>
            <div className="flex justify-between"><span className="text-text-light">日期</span><span className="text-dark font-medium">{selectedDate}</span></div>
            <div className="flex justify-between"><span className="text-text-light">時段</span><span className="text-dark font-medium">{selectedTime}</span></div>
            <div className="flex justify-between"><span className="text-text-light">姓名</span><span className="text-dark font-medium">{name}</span></div>
            <div className="flex justify-between border-t border-gold-light/20 pt-2 mt-2"><span className="text-dark font-semibold">預估金額</span><span className="text-gold font-bold font-serif-tc text-lg">${total.toLocaleString()}</span></div>
          </div>
          <a href="/" className="inline-block bg-gold text-white px-8 py-3 rounded-full text-sm tracking-wide hover:bg-dark-light transition-colors">回到首頁</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-bg">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gold-light/30 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <a href="/" className="font-serif-tc text-lg font-bold text-dark"><span className="text-gold">JY</span> Beauty</a>
          <div className="w-10" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {["選擇套餐", "選擇時間", "填寫資料"].map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${step >= i ? "bg-gold text-white" : "bg-gold-light/30 text-text-light"}`}>{i + 1}</div>
              <span className={`text-xs hidden sm:inline ${step >= i ? "text-dark" : "text-text-light"}`}>{label}</span>
              {i < 2 && <div className={`w-8 h-px ${step > i ? "bg-gold" : "bg-gold-light/30"}`} />}
            </div>
          ))}
        </div>

        {/* Step 0: Package Selection */}
        {step === 0 && (
          <div className="fade-in">
            <h2 className="font-serif-tc text-2xl font-bold text-dark text-center mb-2">選擇你的療程</h2>
            <p className="text-text-light text-center text-sm mb-8">挑一個最適合你的放鬆方案</p>
            <div className="space-y-4 mb-8">
              {packages.map((p) => (
                <button key={p.id} onClick={() => setSelectedPkg(p.id)}
                  className={`w-full text-left p-6 rounded-2xl border transition-all ${selectedPkg === p.id ? "border-gold bg-gold/5 shadow-md" : "border-gold-light/20 bg-white hover:border-gold/50"}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-gold text-xs italic">{p.tier}</span>
                        {p.popular && <span className="bg-gold text-white text-xs px-2 py-0.5 rounded-full">推薦</span>}
                      </div>
                      <h3 className="font-serif-tc text-lg font-bold text-dark mt-1">{p.name}</h3>
                      <div className="mt-2 space-y-1">
                        {p.items.map((item) => (
                          <p key={item} className="text-text-light text-xs flex items-center gap-2">
                            <span className="w-1 h-1 bg-gold rounded-full inline-block" />{item}
                          </p>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-serif-tc text-2xl text-gold font-bold">${p.price.toLocaleString()}</p>
                      <div className={`w-5 h-5 rounded-full border-2 mt-2 ml-auto flex items-center justify-center ${selectedPkg === p.id ? "border-gold bg-gold" : "border-gold-light/40"}`}>
                        {selectedPkg === p.id && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {selectedPkg && (
              <div className="fade-in">
                <h3 className="font-serif-tc text-lg font-bold text-dark text-center mb-4">加值項目（可選）</h3>
                <p className="text-text-light text-center text-xs mb-4">身體加項</p>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {bodyAddons.map((a) => (
                    <button key={a.id} onClick={() => toggleAddon(a.id)}
                      className={`p-4 rounded-xl border text-center transition-all text-sm ${selectedAddons.includes(a.id) ? "border-gold bg-gold/5" : "border-gold-light/20 bg-white"}`}>
                      <p className="text-dark font-medium">{a.name}</p>
                      {a.dur && <p className="text-text-light text-xs">{a.dur}</p>}
                      <p className="text-gold font-semibold mt-1">+${a.price}</p>
                    </button>
                  ))}
                </div>
                <p className="text-text-light text-center text-xs mb-4">臉部加項</p>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {faceAddons.map((a) => (
                    <button key={a.id} onClick={() => toggleAddon(a.id)}
                      className={`p-4 rounded-xl border text-center transition-all text-sm ${selectedAddons.includes(a.id) ? "border-gold bg-gold/5" : "border-gold-light/20 bg-white"}`}>
                      <p className="text-dark font-medium">{a.name}</p>
                      {a.dur && <p className="text-text-light text-xs">{a.dur}</p>}
                      <p className="text-gold font-semibold mt-1">+${a.price}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedPkg && (
              <div className="sticky bottom-0 bg-warm-bg pt-4 pb-6 border-t border-gold-light/20">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-dark font-medium">預估金額</span>
                  <span className="font-serif-tc text-2xl text-gold font-bold">${total.toLocaleString()}</span>
                </div>
                <button onClick={() => setStep(1)} className="w-full bg-gold text-white py-4 rounded-full text-sm tracking-wide hover:bg-dark-light transition-colors">下一步：選擇時間</button>
              </div>
            )}
          </div>
        )}

        {/* Step 1: Date & Time */}
        {step === 1 && (
          <div className="fade-in">
            <h2 className="font-serif-tc text-2xl font-bold text-dark text-center mb-2">選擇日期與時段</h2>
            <p className="text-text-light text-center text-sm mb-8">挑一個你最放鬆的時間</p>

            <div className="mb-8">
              <p className="text-dark font-medium mb-4 text-sm">選擇日期</p>
              <div className="flex gap-2 overflow-x-auto pb-2 snap-x">
                {days.map((d) => {
                  const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                  const isSelected = selectedDate === key;
                  return (
                    <button key={key} onClick={() => { setSelectedDate(key); setSelectedTime(""); }}
                      className={`flex-shrink-0 w-16 py-3 rounded-xl text-center transition-all snap-center ${isSelected ? "bg-gold text-white" : "bg-white border border-gold-light/20 hover:border-gold/50"}`}>
                      <p className={`text-xs ${isSelected ? "text-white/80" : "text-text-light"}`}>{weekdays[d.getDay()]}</p>
                      <p className={`text-lg font-bold ${isSelected ? "text-white" : "text-dark"}`}>{d.getDate()}</p>
                      <p className={`text-xs ${isSelected ? "text-white/80" : "text-text-light"}`}>{d.getMonth() + 1}月</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedDate && (
              <div className="fade-in mb-8">
                <p className="text-dark font-medium mb-4 text-sm">選擇時段</p>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {timeSlots.map((t) => {
                    const isBooked = booked.includes(t);
                    const isSelected = selectedTime === t;
                    return (
                      <button key={t} onClick={() => !isBooked && setSelectedTime(t)} disabled={isBooked}
                        className={`py-3 rounded-xl text-sm font-medium transition-all ${isBooked ? "bg-gray-100 text-gray-300 cursor-not-allowed line-through" : isSelected ? "bg-gold text-white" : "bg-white border border-gold-light/20 text-dark hover:border-gold/50"}`}>
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex gap-4 mt-6">
              <button onClick={() => setStep(0)} className="flex-1 py-4 rounded-full border border-gold text-gold text-sm tracking-wide hover:bg-gold hover:text-white transition-colors">上一步</button>
              <button onClick={() => selectedDate && selectedTime && setStep(2)} disabled={!selectedDate || !selectedTime}
                className={`flex-1 py-4 rounded-full text-sm tracking-wide transition-colors ${selectedDate && selectedTime ? "bg-gold text-white hover:bg-dark-light" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}>下一步：填寫資料</button>
            </div>
          </div>
        )}

        {/* Step 2: Contact Info */}
        {step === 2 && (
          <div className="fade-in">
            <h2 className="font-serif-tc text-2xl font-bold text-dark text-center mb-2">填寫預約資料</h2>
            <p className="text-text-light text-center text-sm mb-8">最後一步，讓我們認識你</p>

            <div className="bg-white rounded-2xl p-6 mb-6 border border-gold-light/20">
              <p className="text-gold text-xs tracking-wide mb-4">預約摘要</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-text-light">套餐</span><span className="text-dark font-medium">{pkg?.name}</span></div>
                {selectedAddons.length > 0 && (
                  <div className="flex justify-between"><span className="text-text-light">加項</span><span className="text-dark font-medium">{selectedAddons.map((id) => allAddons.find((a) => a.id === id)?.name).join("、")}</span></div>
                )}
                <div className="flex justify-between"><span className="text-text-light">日期</span><span className="text-dark font-medium">{selectedDate}</span></div>
                <div className="flex justify-between"><span className="text-text-light">時段</span><span className="text-dark font-medium">{selectedTime}</span></div>
                <div className="flex justify-between border-t border-gold-light/20 pt-2 mt-2">
                  <span className="text-dark font-semibold">預估金額</span>
                  <span className="text-gold font-bold font-serif-tc text-xl">${total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div>
                <label className="text-dark text-sm font-medium mb-2 block">服務方式</label>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setServiceMode("home")} className={`py-3 rounded-xl border text-sm transition-all ${serviceMode === "home" ? "border-gold bg-gold/5 text-dark font-medium" : "border-gold-light/30 text-text-light"}`}>到府服務</button>
                  <button onClick={() => setServiceMode("studio")} className={`py-3 rounded-xl border text-sm transition-all ${serviceMode === "studio" ? "border-gold bg-gold/5 text-dark font-medium" : "border-gold-light/30 text-text-light"}`}>工作室服務</button>
                </div>
              </div>
              <div>
                <label className="text-dark text-sm font-medium mb-2 block">姓名</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="請輸入您的姓名"
                  className="w-full px-4 py-3 rounded-xl border border-gold-light/30 bg-white text-dark placeholder-text-light/50 focus:outline-none focus:border-gold transition-colors" />
              </div>
              <div>
                <label className="text-dark text-sm font-medium mb-2 block">聯繫電話</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="請輸入您的電話號碼"
                  className="w-full px-4 py-3 rounded-xl border border-gold-light/30 bg-white text-dark placeholder-text-light/50 focus:outline-none focus:border-gold transition-colors" />
              </div>
              {serviceMode === "home" && (
                <div>
                  <label className="text-dark text-sm font-medium mb-2 block">服務地址</label>
                  <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="請輸入到府服務地址"
                    className="w-full px-4 py-3 rounded-xl border border-gold-light/30 bg-white text-dark placeholder-text-light/50 focus:outline-none focus:border-gold transition-colors" />
                </div>
              )}
              <div>
                <label className="text-dark text-sm font-medium mb-2 block">推薦人電話（選填）</label>
                <input type="tel" value={referralPhone} onChange={(e) => setReferralPhone(e.target.value)} placeholder="填寫推薦人電話，雙方享加值升級"
                  className="w-full px-4 py-3 rounded-xl border border-gold-light/30 bg-white text-dark placeholder-text-light/50 focus:outline-none focus:border-gold transition-colors" />
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setStep(1)} className="flex-1 py-4 rounded-full border border-gold text-gold text-sm tracking-wide hover:bg-gold hover:text-white transition-colors">上一步</button>
              <button onClick={async () => {
                if (!name || !phone || submitting) return;
                setSubmitting(true);
                await fetch("/api/bookings", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ package: pkg?.name, packageTier: pkg?.tier, addons: selectedAddons, date: selectedDate, time: selectedTime, name, phone, total, address, serviceMode, referralPhone }),
                });
                setSubmitted(true);
              }} disabled={!name || !phone || submitting}
                className={`flex-1 py-4 rounded-full text-sm tracking-wide transition-colors ${name && phone ? "bg-gold text-white hover:bg-dark-light" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}>確認預約</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
