"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

// 冠 #4334 2026-05-29: 拿掉所有 hard-coded 套餐，全部由肉包在後台 /admin/services 建立
// → packages 完全來自 /api/packages，DB 是空的就顯示「尚未上架」提示

function parseDurMin(s: string | undefined): number {
  if (!s) return 0;
  const m = s.match(/(\d+)/);
  return m ? parseInt(m[1]) : 0;
}

// 冠 #4342: DbPackage 介面已棄用（hardcoded packages + DB packages 流程拿掉）
interface _DbPackageDeprecated {
  id: number;
  name: string;
  description: string;
  original_price: number;
  package_price: number;
  duration_min: number;
  service_ids: string;
  is_active: boolean;
  serviceDetails?: { id: number; name: string; duration_min: number; price: number }[];
}

// 冠 #4342 2026-05-29: 拿掉所有 hardcoded addons；所有可選項目都從 /api/services 拉
interface DbService {
  id: number;
  name: string;
  description?: string;
  duration_min: number;
  price: number;
  category?: string;
  is_active: boolean;
  sort_order?: number;
}

// 10 分鐘為單位的時段 (10:00 ~ 20:00)
const timeSlots = (() => {
  const out: string[] = [];
  for (let h = 10; h <= 20; h++) {
    for (let m = 0; m < 60; m += 10) {
      if (h === 20 && m > 0) break;
      out.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return out;
})();

function getNextDays(count: number) {
  const days = [];
  const now = new Date();
  let added = 0;
  let offset = 1;
  while (added < count) {
    const d = new Date(now);
    d.setDate(now.getDate() + offset);
    offset++;
    if (d.getDay() === 0) continue; // skip Sunday
    days.push(d);
    added++;
  }
  return days;
}


export default function BookingPage() {
  const [step, setStep] = useState(0);
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceMode, setServiceMode] = useState<"home"|"studio">("home");
  const [address, setAddress] = useState("");
  const [referralPhone, setReferralPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [busySlots, setBusySlots] = useState<string[]>([]);
  const [dbServices, setDbServices] = useState<DbService[]>([]);

  // Fetch active services from DB
  useEffect(() => {
    fetch("/api/services")
      .then(r => r.json())
      .then(d => setDbServices((d.services || []).filter((s: DbService) => s.is_active)))
      .catch(() => {});
  }, []);

  const selectedServices = dbServices.filter(s => selectedServiceIds.includes(s.id));
  const total = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const totalDur = selectedServices.reduce((sum, s) => sum + (s.duration_min || 0), 0);

  // Group services by category for display
  const servicesByCategory: Record<string, DbService[]> = {};
  for (const s of dbServices) {
    const cat = s.category || "其他";
    if (!servicesByCategory[cat]) servicesByCategory[cat] = [];
    servicesByCategory[cat].push(s);
  }
  const categoryOrder = ["身體", "臉部", "未分類", "其他"];
  const sortedCategories = Object.keys(servicesByCategory).sort((a, b) => {
    const ai = categoryOrder.indexOf(a);
    const bi = categoryOrder.indexOf(b);
    return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi);
  });

  useEffect(() => {
    if (!selectedDate) { setBusySlots([]); return; }
    fetch(`/api/calendar?date=${selectedDate}&dur=${totalDur || 60}`)
      .then(r => r.json())
      .then(d => setBusySlots(d.busySlots || []))
      .catch(() => setBusySlots([]));
  }, [selectedDate, totalDur]);

  const days = getNextDays(14);
  const weekdays = ["日", "一", "二", "三", "四", "五", "六"];

  const toggleService = (id: number) => {
    setSelectedServiceIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const booked = busySlots;

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
            <div className="flex justify-between"><span className="text-text-light">服務項目</span><span className="text-dark font-medium text-right">{selectedServices.map(s => s.name).join("、")}</span></div>
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
          {["套餐", "時間", "資料", "確認"].map((label, i) => (
            <div key={label} className="flex items-center gap-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all ${step >= i ? "bg-gold text-white" : "bg-gold-light/30 text-text-light"}`}>{i + 1}</div>
              <span className={`text-xs ${step >= i ? "text-dark" : "text-text-light"}`}>{label}</span>
              {i < 3 && <div className={`w-5 h-px ${step > i ? "bg-gold" : "bg-gold-light/30"}`} />}
            </div>
          ))}
        </div>

        {/* 冠 #4342 2026-05-29: 單一服務多選 — 取消套餐流程 */}
        {step === 0 && (
          <div className="fade-in">
            <div className="text-center mb-4">
              <h2 className="font-serif-tc text-xl font-bold text-dark">選擇你的療程（可複選）</h2>
              <p className="text-text-light text-sm mt-1">勾選你想要的單項服務</p>
            </div>

            {dbServices.length === 0 ? (
              <div className="bg-white border-2 border-gold-light/20 rounded-2xl p-10 text-center">
                <p className="text-3xl mb-3">📋</p>
                <p className="text-dark font-bold text-lg mb-2">服務項目尚未上架</p>
                <p className="text-text-light text-sm">店家正在後台建立中，請稍後再回來看看～</p>
              </div>
            ) : (
              <div className="space-y-5 pb-32">
                {sortedCategories.map((cat) => (
                  <div key={cat}>
                    <p className="text-gold text-sm font-semibold tracking-wider mb-3 px-1">{cat}</p>
                    <div className="space-y-3">
                      {servicesByCategory[cat].map((s) => {
                        const sel = selectedServiceIds.includes(s.id);
                        return (
                          <label key={s.id}
                            className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${sel ? "border-gold bg-gold/5 shadow-md" : "border-gold-light/20 bg-white"}`}>
                            <input type="checkbox" checked={sel} onChange={() => toggleService(s.id)} className="w-6 h-6 accent-gold flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-dark text-lg font-bold">{s.name}</p>
                              {s.description && <p className="text-text-light text-sm mt-1">{s.description}</p>}
                              <p className="text-text-light text-sm mt-1">約 {s.duration_min} 分鐘</p>
                            </div>
                            <p className="text-gold font-serif-tc text-2xl font-bold flex-shrink-0">${s.price.toLocaleString()}</p>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedServiceIds.length > 0 && (
              <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gold-light/30 shadow-lg pt-4 pb-6 px-5 z-50">
                <div className="max-w-md mx-auto">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-dark text-base font-medium">已選 {selectedServiceIds.length} 項 · 約 {totalDur} 分鐘</span>
                    <span className="font-serif-tc text-3xl text-gold font-bold">${total.toLocaleString()}</span>
                  </div>
                  <button onClick={() => setStep(1)} className="w-full bg-gold text-white py-5 rounded-2xl text-lg font-bold tracking-wide active:bg-dark-light transition-colors">
                    下一步：選擇時間
                  </button>
                </div>
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
                      className={`flex-shrink-0 w-20 py-4 rounded-2xl text-center transition-all snap-center ${isSelected ? "bg-gold text-white shadow-lg scale-105" : "bg-white border-2 border-gold-light/20 hover:border-gold/50 active:scale-95"}`}>
                      <p className={`text-sm font-medium ${isSelected ? "text-white/80" : "text-text-light"}`}>{weekdays[d.getDay()]}</p>
                      <p className={`text-2xl font-bold ${isSelected ? "text-white" : "text-dark"}`}>{d.getDate()}</p>
                      <p className={`text-xs ${isSelected ? "text-white/80" : "text-text-light"}`}>{d.getMonth() + 1}月</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedDate && (
              <div className="fade-in mb-8">
                <p className="text-dark font-medium mb-4 text-sm">選擇時段</p>
                <div className="grid grid-cols-3 gap-3">
                  {timeSlots.map((t) => {
                    const isBooked = booked.includes(t);
                    const isSelected = selectedTime === t;
                    return (
                      <button key={t} onClick={() => !isBooked && setSelectedTime(t)} disabled={isBooked}
                        className={`py-5 rounded-2xl text-base font-semibold tracking-wide transition-all ${isBooked ? "bg-gray-100 text-gray-300 cursor-not-allowed opacity-40" : isSelected ? "bg-gold text-white shadow-lg scale-105" : "bg-white border-2 border-gold-light/30 text-dark hover:border-gold/60 active:scale-95"}`}>
                        {isBooked ? <span className="flex flex-col items-center"><span className="line-through">{t}</span><span className="text-xs font-normal mt-1">已約</span></span> : t}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex gap-4 mt-6">
              <button onClick={() => setStep(0)} className="flex-1 py-5 rounded-2xl border-2 border-gold text-gold text-base font-medium tracking-wide active:bg-gold active:text-white transition-colors">上一步</button>
              <button onClick={() => selectedDate && selectedTime && setStep(2)} disabled={!selectedDate || !selectedTime}
                className={`flex-1 py-5 rounded-2xl text-base font-medium tracking-wide transition-colors ${selectedDate && selectedTime ? "bg-gold text-white active:bg-dark-light" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}>下一步：填寫資料</button>
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
                <div className="flex justify-between"><span className="text-text-light">服務項目</span><span className="text-dark font-medium text-right">{selectedServices.map(s => s.name).join("、")}</span></div>
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
              <button onClick={() => setStep(1)} className="flex-1 py-5 rounded-2xl border-2 border-gold text-gold text-base font-medium tracking-wide active:bg-gold active:text-white transition-colors">上一步</button>
              <button onClick={() => { if (name && phone) setStep(3); }} disabled={!name || !phone}
                className={`flex-1 py-5 rounded-2xl text-base font-medium tracking-wide transition-colors ${name && phone ? "bg-gold text-white active:bg-dark-light" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}>下一步：確認預約</button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="fade-in">
            <h2 className="font-serif-tc text-2xl font-bold text-dark text-center mb-2">確認預約資訊</h2>
            <p className="text-text-light text-center text-sm mb-8">請確認以下資訊無誤後送出</p>

            <div className="bg-white rounded-2xl p-6 mb-6 border-2 border-gold/30 shadow-lg">
              <div className="space-y-4 text-sm">
                <div className="flex justify-between py-2 border-b border-gold-light/10"><span className="text-text-light">服務項目</span><span className="text-dark font-semibold text-right max-w-[60%]">{selectedServices.map(s => s.name).join("、")}</span></div>
                <div className="flex justify-between py-2 border-b border-gold-light/10"><span className="text-text-light">日期</span><span className="text-dark font-semibold">{selectedDate}</span></div>
                <div className="flex justify-between py-2 border-b border-gold-light/10"><span className="text-text-light">時段</span><span className="text-dark font-semibold">{selectedTime}</span></div>
                <div className="flex justify-between py-2 border-b border-gold-light/10"><span className="text-text-light">服務方式</span><span className="text-dark font-medium">{serviceMode === "home" ? "到府服務" : "工作室服務"}</span></div>
                <div className="flex justify-between py-2 border-b border-gold-light/10"><span className="text-text-light">姓名</span><span className="text-dark font-semibold">{name}</span></div>
                <div className="flex justify-between py-2 border-b border-gold-light/10"><span className="text-text-light">電話</span><span className="text-dark font-medium">{phone}</span></div>
                {serviceMode === "home" && address && (
                  <div className="flex justify-between py-2 border-b border-gold-light/10"><span className="text-text-light">地址</span><span className="text-dark font-medium text-right max-w-[60%]">{address}</span></div>
                )}
                {referralPhone && (
                  <div className="flex justify-between py-2 border-b border-gold-light/10"><span className="text-text-light">推薦人</span><span className="text-dark font-medium">{referralPhone}</span></div>
                )}
                <div className="flex justify-between pt-4 mt-2 border-t-2 border-gold/20">
                  <span className="text-dark font-bold text-lg">預估金額</span>
                  <span className="text-gold font-bold font-serif-tc text-2xl">${total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <p className="text-text-light text-xs text-center mb-6">送出後我們會透過 LINE 與您確認詳細時間</p>

            <div className="flex gap-4">
              <button onClick={() => setStep(2)} className="flex-1 py-5 rounded-2xl border-2 border-gold text-gold text-base font-medium tracking-wide active:bg-gold active:text-white transition-colors">修改資料</button>
              <button onClick={async () => {
                if (submitting) return;
                setSubmitting(true);
                const serviceNames = selectedServices.map(s => s.name).join(" + ");
                await fetch("/api/bookings", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ package: serviceNames, packageTier: "", addons: selectedServiceIds, date: selectedDate, time: selectedTime, name, phone, total, address, serviceMode, referralPhone, durationMin: totalDur }),
                });
                if (referralPhone) {
                  await fetch("/api/referrals", { method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ referrer_phone: referralPhone, referred_phone: phone, referred_name: name }) });
                }
                await fetch("/api/customers", { method: "POST", headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ name, phone, address }) });
                setSubmitted(true);
              }} disabled={submitting}
                className="flex-1 py-5 rounded-2xl bg-gold text-white text-base font-bold tracking-wide active:bg-dark-light transition-colors">{submitting ? "送出中..." : "確認送出預約"}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
