"use client";
import { useState, useEffect, type ReactNode } from "react";

// 冠 #5621 2026-06-09: 自訂線條圖示（非 emoji），B-1 暖金米版採用
function Ic({ name, className = "w-[25px] h-[25px]" }: { name: string; className?: string }) {
  const paths: Record<string, ReactNode> = {
    book: <><rect x="3.5" y="5" width="17" height="15" rx="2.5" /><path d="M3.5 9.5h17M8 3v4M16 3v4" /><path d="M15.8 13.5l.8 1.6 1.6.8-1.6.8-.8 1.6-.8-1.6-1.6-.8 1.6-.8z" /></>,
    list: <><rect x="5" y="4" width="14" height="17" rx="2.2" /><path d="M9 3.4h6v2.7H9z" /><path d="M8.6 11h6.8M8.6 14.4h6.8M8.6 17.8h4.4" /></>,
    ticket: <><path d="M4 8.5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1a2 2 0 0 0 0 4v1a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-1a2 2 0 0 0 0-4z" /><path d="M14.4 6.6v10.8" /></>,
    card: <><rect x="3" y="5.5" width="18" height="13" rx="2.4" /><path d="M3 9.8h18M6.5 14.6h4" /></>,
    refer: <><circle cx="9" cy="8.4" r="2.7" /><path d="M3.8 19c0-2.9 2.3-4.6 5.2-4.6s5.2 1.7 5.2 4.6" /><circle cx="17" cy="7" r="2" /><path d="M16 12.3c2.6-.3 5 1.2 5 4" /></>,
    bag: <><path d="M6.2 8h11.6l-.9 11.4a1.3 1.3 0 0 1-1.3 1.2H8.4a1.3 1.3 0 0 1-1.3-1.2z" /><path d="M9 8a3 3 0 0 1 6 0" /></>,
    gear: <><circle cx="12" cy="12" r="3.1" /><path d="M12 3.6v2.2M12 18.2v2.2M3.6 12h2.2M18.2 12h2.2M6.1 6.1l1.5 1.5M16.4 16.4l1.5 1.5M17.9 6.1l-1.5 1.5M7.6 16.4l-1.5 1.5" /></>,
  };
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>
  );
}

interface MemberData {
  name: string; phone: string; address: string; points: number; created_at: string;
}
interface BookingData {
  id: number; package: string; date: string; time: string; total: number; status: string;
}
// 肉包 #5092 2026-06-01: 會員等級
interface TierInfo {
  tier: "black" | "gold" | "silver" | null;
  tier_config: { label: string; emoji: string; threshold: number; discount: number; perks: string[] } | null;
  quarter: { start: string; end: string; label: string };
  quarter_spent: number;
  next_tier: "black" | "gold" | "silver" | null;
  next_tier_remaining: number;
  next_tier_config: { label: string; emoji: string; threshold: number; discount: number } | null;
}

export default function MemberPage() {
  const [mode, setMode] = useState<"login"|"register">("login");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [birthday, setBirthday] = useState(""); // 肉包 #5092: 生日
  const [referralPhone, setReferralPhone] = useState("");
  const [error, setError] = useState("");
  const [member, setMember] = useState<MemberData | null>(null);
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [referralCount, setReferralCount] = useState(0);
  const [referrals, setReferrals] = useState<Array<{id: number; referred_phone: string; referred_name: string; created_at: string}>>([]);
  const [coupons, setCoupons] = useState<Array<{id: number; code: string; discount_value: number; description: string; expires_at: string; used: boolean}>>([]);
  const [tierInfo, setTierInfo] = useState<TierInfo | null>(null);
  // 肉包 #5100/#5105 2026-06-01: 卡片餘額 + 兌換碼
  const [cardBalance, setCardBalance] = useState<number>(0);
  const [redeemCode, setRedeemCode] = useState("");
  const [redeemMsg, setRedeemMsg] = useState("");
  // 冠 #4456: 修改密碼 state
  const [pwOld, setPwOld] = useState(""); const [pwNew, setPwNew] = useState(""); const [pwConfirm, setPwConfirm] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  // 冠 2026-06-09: App 化 — 底部分頁，不再一長串流水
  const [tab, setTab] = useState<"home" | "booking" | "cards" | "me">("home");
  // 冠 #5644 2026-06-09: 記住登入 — 一進頁面若本機有登入紀錄就免密碼自動還原
  const [restoring, setRestoring] = useState(true);

  useEffect(() => {
    let saved: { phone?: string } | null = null;
    try { saved = JSON.parse(localStorage.getItem("jy_member") || "null"); } catch {}
    if (!saved?.phone) { setRestoring(false); return; }
    const ph = saved.phone;
    (async () => {
      try {
        const r = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "restore", phone: ph }) });
        const d = await r.json();
        if (d.success) {
          setMember(d.member);
          setBookings(d.bookings || []);
          setCoupons(d.coupons || []);
          setReferralCount(d.referralCount || 0);
          setReferrals(d.referrals || []);
          setTierInfo(d.tierInfo || null);
          setPhone(ph);
          fetch(`/api/cards/balance?phone=${encodeURIComponent(ph)}`)
            .then(r => r.json()).then(b => { if (b.ok) setCardBalance(b.balance || 0); }).catch(() => {});
        }
      } catch {}
      setRestoring(false);
    })();
  }, []);

  const handleLogout = () => {
    try { localStorage.removeItem("jy_member"); } catch {}
    setMember(null); setBookings([]); setCoupons([]); setReferralCount(0);
    setReferrals([]); setTierInfo(null); setCardBalance(0);
    setPhone(""); setPassword(""); setTab("home");
  };

  const handleLogin = async () => {
    setError("");
    const r = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "login", phone, password }) });
    const d = await r.json();
    if (d.success) {
      setMember(d.member);
      setBookings(d.bookings || []);
      setCoupons(d.coupons || []);
      setReferralCount(d.referralCount || 0);
      setReferrals(d.referrals || []);
      setTierInfo(d.tierInfo || null);
      // 冠 #5292 2026-06-02: 持久化 member 到 localStorage，booking 頁進入時自動帶入資料
      try {
        localStorage.setItem("jy_member", JSON.stringify({
          name: d.member.name,
          phone: d.member.phone,
          address: d.member.address || "",
        }));
      } catch {}
      // 取卡片餘額
      fetch(`/api/cards/balance?phone=${encodeURIComponent(phone)}`)
        .then(r => r.json())
        .then(b => { if (b.ok) setCardBalance(b.balance || 0); })
        .catch(() => {});
    } else {
      setError(d.error || "登入失敗");
    }
  };

  // 冠 #4456: 改密碼
  const handleChangePw = async () => {
    setPwMsg("");
    if (!pwOld || !pwNew || !pwConfirm) { setPwMsg("請填完三欄"); return; }
    if (pwNew !== pwConfirm) { setPwMsg("兩次新密碼不一致"); return; }
    if (pwNew.length < 4) { setPwMsg("新密碼至少 4 字"); return; }
    const r = await fetch("/api/auth", { method: "POST", headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ action: "change_password", phone: member?.phone, oldPassword: pwOld, newPassword: pwNew }) });
    const d = await r.json();
    if (d.success) { setPwMsg("✅ 密碼已更新"); setPwOld(""); setPwNew(""); setPwConfirm(""); }
    else setPwMsg(d.error || "更新失敗");
  };

  // 冠 #4456: 移除推薦人
  const handleDeleteReferral = async (referredPhone: string) => {
    if (!confirm(`確定要移除推薦人「${referredPhone}」？`)) return;
    const r = await fetch("/api/auth", { method: "POST", headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ action: "delete_referral", phone: member?.phone, referredPhone }) });
    const d = await r.json();
    if (d.success) {
      setReferrals(prev => prev.filter(x => x.referred_phone !== referredPhone));
      setReferralCount(prev => Math.max(0, prev - 1));
    } else alert(d.error || "移除失敗");
  };

  const handleRegister = async () => {
    setError("");
    if (!name || !phone || !password) { setError("請填寫必要欄位"); return; }
    const r = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "register", name, phone, password, address, birthday, referral_phone: referralPhone }) });
    const d = await r.json();
    if (d.success) {
      setMode("login");
      setError("");
      alert("註冊成功！請登入");
    } else {
      setError(d.error || "註冊失敗");
    }
  };

  if (member) {
    // 冠 2026-06-09: 會員頁重新設計 — 加入會員卡 Hero + 統計條，減少「流水/密密麻麻」感
    const totalSpent = bookings.reduce((s, b) => s + (b.total || 0), 0);
    const heroBg =
      tierInfo?.tier === "black" ? "from-gray-900 via-gray-800 to-gray-700 text-white" :
      tierInfo?.tier === "gold" ? "from-amber-300 to-yellow-500 text-amber-950" :
      tierInfo?.tier === "silver" ? "from-slate-300 to-slate-500 text-slate-900" :
      "from-[#c2a560] via-[#b3934f] to-[#9c7d40] text-white"; // 尚未升級也給優雅金漸層
    const progressPct = tierInfo?.next_tier_config
      ? Math.min(100, Math.max(4, Math.round((tierInfo.quarter_spent / tierInfo.next_tier_config.threshold) * 100)))
      : 100;
    const sectionCard = "bg-white rounded-3xl p-6 border border-gold-light/20 shadow-sm";
    const sectionTitle = "text-dark font-serif-tc text-lg font-bold mb-4 flex items-center gap-2";
    return (
      <div className="min-h-screen bg-warm-bg">
        {/* App 化：固定頂部 bar */}
        <div className="bg-white/90 backdrop-blur border-b border-gold-light/30 px-6 py-4 text-center sticky top-0 z-20">
          <p className="font-serif-tc text-lg font-bold text-dark"><span className="text-gold">JY</span> Beauty</p>
        </div>

        {/* 內容區（底部留空給 tab bar，每頁聚焦不長滾）*/}
        <div className="max-w-md mx-auto px-5 pt-5 pb-12 space-y-5">

          {/* ===== 會員 ===== */}
          {tab === "home" && (
            <>
              {/* 冠 #5668: 統一 4:3 方塊版（套設計準則）*/}
              <div className="flex flex-col gap-3.5">
              <div className={`relative rounded-[28px] p-7 bg-gradient-to-br ${heroBg} shadow-xl overflow-hidden`}>
                <div className="absolute -right-10 -top-10 w-36 h-36 rounded-full bg-white/10" />
                <div className="absolute right-6 top-16 w-20 h-20 rounded-full bg-white/10" />
                <div className="relative">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-[11px] tracking-[0.35em] opacity-70 mb-1">MEMBER</p>
                      <p className="text-3xl font-bold leading-tight truncate">{member.name}</p>
                      <p className="text-sm opacity-85 mt-1.5">{member.phone}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="inline-block text-xs px-3 py-1.5 rounded-full bg-white/20 backdrop-blur font-medium whitespace-nowrap">
                        {tierInfo?.tier_config ? `${tierInfo.tier_config.emoji} ${tierInfo.tier_config.label}` : "🥉 尚未升級"}
                      </span>
                      {tierInfo?.quarter?.label && <p className="text-[10px] opacity-60 mt-2">{tierInfo.quarter.label}</p>}
                    </div>
                  </div>
                  {tierInfo && (
                    <div className="mt-7">
                      <div className="flex items-baseline justify-between mb-2">
                        <span className="text-xs opacity-75">本季消費</span>
                        <span className="text-xl font-bold">NT$ {tierInfo.quarter_spent.toLocaleString()}</span>
                      </div>
                      {tierInfo.next_tier_config && tierInfo.next_tier_remaining > 0 ? (
                        <>
                          <div className="h-2 rounded-full bg-white/25 overflow-hidden">
                            <div className="h-full bg-white/95 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
                          </div>
                          <p className="text-[11px] opacity-85 mt-2">
                            再 NT$ {tierInfo.next_tier_remaining.toLocaleString()} 升 {tierInfo.next_tier_config.emoji} {tierInfo.next_tier_config.label}
                          </p>
                        </>
                      ) : (
                        tierInfo.tier_config && (
                          <p className="text-[11px] opacity-85">
                            本季享 {tierInfo.tier_config.discount === 1 ? "無折扣" : `${(tierInfo.tier_config.discount * 10).toFixed(1)} 折`}
                          </p>
                        )
                      )}
                      {tierInfo.tier_config && tierInfo.tier_config.perks?.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {tierInfo.tier_config.perks.map((p, i) => (
                            <span key={i} className="text-[11px] px-2.5 py-1 rounded-full bg-white/15">✓ {p}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* B-1 暖金米：CTA 橫幅領頭 */}
              <a href="/booking" className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-b from-gold-light to-gold text-white shadow-[0_4px_0_rgba(140,100,40,0.5),0_11px_22px_-5px_rgba(160,120,50,0.45)] active:translate-y-0.5 transition-transform">
                <span className="w-11 h-11 shrink-0 rounded-xl bg-white/25 text-white flex items-center justify-center"><Ic name="book" /></span>
                <span>
                  <span className="block font-bold text-base">立即預約療程</span>
                  <span className="block text-white/85 text-xs mt-0.5">挑時段・到府或工作室</span>
                </span>
              </a>

              {/* 統一 4:3 方塊 × 6（套設計準則：一致比例、內容填滿、8px 間距） */}
              <div className="grid grid-cols-2 gap-2.5">
                <button onClick={() => setTab("booking")}
                  className="flex flex-col gap-2.5 p-4 rounded-[18px] bg-gradient-to-b from-white to-[#f6f0e4] border border-gold-light/40 shadow-[0_3px_0_rgba(201,168,106,0.26),0_9px_18px_-6px_rgba(150,110,40,0.18)] active:scale-[0.97] transition-transform text-left">
                  <span className="w-12 h-12 rounded-xl bg-gold/15 text-gold flex items-center justify-center"><Ic name="list" /></span>
                  <span>
                    <span className="block text-dark font-bold text-sm">我的預約</span>
                    <span className="block text-text-light text-[11px] mt-0.5">{bookings.length} 次紀錄</span>
                  </span>
                </button>
                <button onClick={() => setTab("cards")}
                  className="flex flex-col gap-2.5 p-4 rounded-[18px] bg-gradient-to-b from-white to-[#f6f0e4] border border-gold-light/40 shadow-[0_3px_0_rgba(201,168,106,0.26),0_9px_18px_-6px_rgba(150,110,40,0.18)] active:scale-[0.97] transition-transform text-left">
                  <span className="w-12 h-12 rounded-xl bg-gold/15 text-gold flex items-center justify-center"><Ic name="ticket" /></span>
                  <span>
                    <span className="block text-dark font-bold text-sm">我的卡券</span>
                    <span className="block text-text-light text-[11px] mt-0.5">{coupons.filter(c => !c.used).length} 張可用</span>
                  </span>
                </button>
                <button onClick={() => setTab("cards")}
                  className="flex flex-col gap-2.5 p-4 rounded-[18px] bg-gradient-to-b from-white to-[#f6f0e4] border border-gold-light/40 shadow-[0_3px_0_rgba(201,168,106,0.26),0_9px_18px_-6px_rgba(150,110,40,0.18)] active:scale-[0.97] transition-transform text-left">
                  <span className="w-12 h-12 rounded-xl bg-gold/15 text-gold flex items-center justify-center"><Ic name="card" /></span>
                  <span>
                    <span className="block text-dark font-bold text-sm">卡片餘額</span>
                    <span className="block text-gold font-bold text-sm mt-0.5">NT$ {cardBalance.toLocaleString()}</span>
                  </span>
                </button>
                <button onClick={() => setTab("me")}
                  className="flex flex-col gap-2.5 p-4 rounded-[18px] bg-gradient-to-b from-white to-[#f6f0e4] border border-gold-light/40 shadow-[0_3px_0_rgba(201,168,106,0.26),0_9px_18px_-6px_rgba(150,110,40,0.18)] active:scale-[0.97] transition-transform text-left">
                  <span className="w-12 h-12 rounded-xl bg-gold/15 text-gold flex items-center justify-center"><Ic name="refer" /></span>
                  <span>
                    <span className="block text-dark font-bold text-sm">推薦好友</span>
                    <span className="block text-text-light text-[11px] mt-0.5">已推薦 {referralCount} 人</span>
                  </span>
                </button>
                <a href="/booking"
                  className="flex flex-col gap-2.5 p-4 rounded-[18px] bg-gradient-to-b from-white to-[#f6f0e4] border border-gold-light/40 shadow-[0_3px_0_rgba(201,168,106,0.26),0_9px_18px_-6px_rgba(150,110,40,0.18)] active:scale-[0.97] transition-transform text-left">
                  <span className="w-12 h-12 rounded-xl bg-gold/15 text-gold flex items-center justify-center"><Ic name="bag" /></span>
                  <span>
                    <span className="block text-dark font-bold text-sm">服務項目</span>
                    <span className="block text-text-light text-[11px] mt-0.5">看療程與價格</span>
                  </span>
                </a>
                <button onClick={() => setTab("me")}
                  className="flex flex-col gap-2.5 p-4 rounded-[18px] bg-gradient-to-b from-white to-[#f6f0e4] border border-gold-light/40 shadow-[0_3px_0_rgba(201,168,106,0.26),0_9px_18px_-6px_rgba(150,110,40,0.18)] active:scale-[0.97] transition-transform text-left">
                  <span className="w-12 h-12 rounded-xl bg-gold/15 text-gold flex items-center justify-center"><Ic name="gear" /></span>
                  <span>
                    <span className="block text-dark font-bold text-sm">帳號設定</span>
                    <span className="block text-text-light text-[11px] mt-0.5">資料・密碼</span>
                  </span>
                </button>
              </div>
              </div>
            </>
          )}

          {/* ===== 預約 ===== */}
          {tab === "booking" && (
            <>
              <button onClick={() => setTab("home")} className="flex items-center gap-1 text-text-light text-sm active:text-gold">
                <span className="text-xl leading-none">‹</span> 返回會員
              </button>
              <div className={sectionCard}>
                <div className="flex items-baseline justify-between mb-4">
                  <h3 className={sectionTitle.replace("mb-4", "mb-0")}>📋 預約紀錄</h3>
                  {bookings.length > 0 && (
                    <div className="text-right">
                      <p className="text-text-light text-xs">累計消費</p>
                      <p className="text-gold font-bold text-xl">${totalSpent.toLocaleString()}</p>
                    </div>
                  )}
                </div>
                {bookings.length === 0 ? <p className="text-text-light text-sm py-2">尚無預約紀錄</p> :
                  <div className="space-y-3">
                    {bookings.map((b) => (
                      <div key={b.id} className="bg-cream/30 rounded-2xl p-5 border border-gold-light/10 text-left">
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-dark font-medium text-base pr-2">{b.package}</p>
                          <span className={`text-xs px-3 py-1.5 rounded-full shrink-0 ${b.status === "confirmed" ? "bg-green-100 text-green-700" : "bg-gold/10 text-gold"}`}>
                            {b.status === "confirmed" ? "已確認" : "待確認"}
                          </span>
                        </div>
                        <div className="flex justify-between items-baseline">
                          <p className="text-text-light text-sm">{b.date} {b.time}</p>
                          <p className="text-gold font-serif-tc font-bold text-lg">${b.total?.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>}
              </div>
              <a href="/booking" className="block w-full bg-gold text-white py-5 rounded-2xl text-xl font-medium text-center active:bg-dark-light shadow-md">＋ 新預約</a>
            </>
          )}

          {/* ===== 卡券 ===== */}
          {tab === "cards" && (
            <>
              <button onClick={() => setTab("home")} className="flex items-center gap-1 text-text-light text-sm active:text-gold">
                <span className="text-xl leading-none">‹</span> 返回會員
              </button>
              <div className={sectionCard}>
                <div className="flex justify-between items-center mb-4">
                  <p className={sectionTitle.replace("mb-4", "mb-0")}>💳 儲值卡餘額</p>
                  <a href="/cards" className="text-pink-600 text-sm font-medium">＋ 購買卡</a>
                </div>
                <p className="text-dark text-3xl font-bold mb-4">NT$ {cardBalance.toLocaleString()}</p>
                <div className="flex gap-2">
                  <input value={redeemCode} onChange={e => setRedeemCode(e.target.value.toUpperCase())}
                    placeholder="輸入 8 碼禮品卡兌換碼" maxLength={8}
                    className="flex-1 px-4 py-3 rounded-xl border border-gold-light/40 font-mono tracking-widest text-center" />
                  <button onClick={async () => {
                    setRedeemMsg("");
                    if (redeemCode.length !== 8) { setRedeemMsg("兌換碼是 8 碼"); return; }
                    const r = await fetch("/api/cards/redeem", { method: "POST", headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ code: redeemCode, phone: member?.phone }) });
                    const d = await r.json();
                    if (d.ok) {
                      setRedeemMsg(`✅ 入帳 NT$ ${d.added.toLocaleString()}`);
                      setCardBalance(d.new_balance);
                      setRedeemCode("");
                    } else {
                      setRedeemMsg(`❌ ${d.error}`);
                    }
                  }} className="bg-pink-500 text-white px-5 py-3 rounded-xl font-medium shrink-0">兌換</button>
                </div>
                {redeemMsg && <p className={`text-sm mt-2 ${redeemMsg.startsWith("✅") ? "text-green-600" : "text-red-600"}`}>{redeemMsg}</p>}
              </div>

              <div className={sectionCard}>
                <p className={sectionTitle}>🎟 我的優惠券</p>
                {coupons.length === 0 ? (
                  <p className="text-text-light text-sm py-2">目前沒有優惠券</p>
                ) : (
                  <div className="space-y-3">
                    {coupons.map((c) => (
                      <div key={c.id} className={`relative rounded-2xl p-5 border-2 ${c.used ? "border-gray-200 bg-gray-50 opacity-60" : "border-gold/30 bg-gradient-to-r from-gold/5 to-transparent"}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className={`font-bold text-2xl ${c.used ? "text-gray-400 line-through" : "text-gold"}`}>{c.discount_value}% OFF</p>
                            <p className={`text-sm mt-1 ${c.used ? "text-gray-400" : "text-dark"}`}>{c.description || "折扣優惠券"}</p>
                          </div>
                          <span className={`text-xs px-3 py-1.5 rounded-full ${c.used ? "bg-gray-200 text-gray-500" : "bg-gold/10 text-gold"}`}>
                            {c.used ? "已使用" : "可使用"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-4">
                          <p className="text-xs text-text-light">代碼：{c.code}</p>
                          <p className="text-xs text-text-light">{c.expires_at ? `有效期限 ${c.expires_at.slice(0, 10)}` : "無期限"}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ===== 我的 ===== */}
          {tab === "me" && (
            <>
              <button onClick={() => setTab("home")} className="flex items-center gap-1 text-text-light text-sm active:text-gold">
                <span className="text-xl leading-none">‹</span> 返回會員
              </button>
              <div className={sectionCard}>
                <p className="text-gold text-xs tracking-widest mb-1">MEMBER</p>
                <p className="text-dark text-2xl font-bold">{member.name}</p>
                <p className="text-text-light text-sm mt-1">{member.phone}</p>
                {member.address && <p className="text-text-light text-sm mt-1">{member.address}</p>}
              </div>

              {referrals.length > 0 && (
                <div className={sectionCard}>
                  <p className={sectionTitle}>🫂 我邀請的好友 ({referrals.length})</p>
                  <div className="space-y-3">
                    {referrals.map((r) => (
                      <div key={r.id} className="flex justify-between items-center bg-cream/40 rounded-xl p-4 border border-gold-light/10">
                        <div className="text-left">
                          <p className="text-dark font-medium text-base">{r.referred_name || "未填姓名"}</p>
                          <p className="text-text-light text-xs mt-1">{r.referred_phone} · {r.created_at?.slice(0, 10)}</p>
                        </div>
                        <button onClick={() => handleDeleteReferral(r.referred_phone)}
                          className="text-xs text-red-500 px-3 py-2 rounded-lg border border-red-200 active:bg-red-50">
                          移除
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <details className="bg-white rounded-3xl border border-gold-light/20 shadow-sm overflow-hidden">
                <summary className="px-6 py-5 cursor-pointer text-dark font-medium flex items-center gap-2" style={{ listStyle: "none" }}>
                  🔒 修改密碼 <span className="text-text-light text-xs ml-auto">點此展開 ▾</span>
                </summary>
                <div className="px-6 pb-6 space-y-4">
                  <input type="password" placeholder="原密碼" value={pwOld} onChange={e => setPwOld(e.target.value)}
                    className="w-full px-5 py-4 rounded-xl border-2 border-gold-light/30 text-base focus:outline-none focus:border-gold" />
                  <input type="password" placeholder="新密碼 (至少 4 字)" value={pwNew} onChange={e => setPwNew(e.target.value)}
                    className="w-full px-5 py-4 rounded-xl border-2 border-gold-light/30 text-base focus:outline-none focus:border-gold" />
                  <input type="password" placeholder="再次輸入新密碼" value={pwConfirm} onChange={e => setPwConfirm(e.target.value)}
                    className="w-full px-5 py-4 rounded-xl border-2 border-gold-light/30 text-base focus:outline-none focus:border-gold" />
                  {pwMsg && <p className={`text-sm py-1 ${pwMsg.startsWith("✅") ? "text-green-600" : "text-red-500"}`}>{pwMsg}</p>}
                  <button onClick={handleChangePw}
                    className="w-full bg-gold text-white py-4 rounded-xl text-base font-medium active:bg-dark-light">
                    更新密碼
                  </button>
                </div>
              </details>

              <button onClick={handleLogout} className="block w-full py-4 rounded-2xl text-base text-red-500 text-center border border-red-200 bg-white active:bg-red-50">登出</button>
              <a href="/" className="block w-full py-4 rounded-2xl text-base text-text-light text-center border border-gold-light/30 bg-white">回首頁</a>
            </>
          )}
        </div>
      </div>
    );
  }

  // 冠 #5644: 還原登入中先顯示品牌啟動畫面，避免閃一下登入表單
  if (restoring) {
    return (
      <div className="min-h-screen bg-warm-bg flex items-center justify-center">
        <p className="font-serif-tc text-3xl font-bold text-dark"><span className="text-gold">JY</span> Beauty</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-bg flex items-center justify-center px-6">
      {/* 冠 #4410 2026-05-30: 欄位加大、拉開間距，不擁擠 */}
      <div className="max-w-md w-full text-center">
        <p className="font-serif-tc text-4xl font-bold text-dark mb-3"><span className="text-gold">JY</span> Beauty</p>
        <p className="text-text-light text-xl mb-14">會員{mode === "login" ? "登入" : "註冊"}</p>

        {error && <p className="text-red-500 text-base mb-6 bg-red-50 rounded-2xl py-4">{error}</p>}

        <div className="space-y-8 mb-12">
          {mode === "register" && (
            <input value={name} onChange={e => setName(e.target.value)} placeholder="姓名"
              className="w-full px-6 py-7 rounded-2xl border-2 border-gold-light/30 text-xl text-center focus:outline-none focus:border-gold" />
          )}
          <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="手機號碼" type="tel"
            className="w-full px-6 py-7 rounded-2xl border-2 border-gold-light/30 text-xl text-center focus:outline-none focus:border-gold" />
          <input value={password} onChange={e => setPassword(e.target.value)} placeholder="密碼" type="password"
            className="w-full px-6 py-7 rounded-2xl border-2 border-gold-light/30 text-xl text-center focus:outline-none focus:border-gold" />
          {mode === "register" && (
            <>
              <input value={address} onChange={e => setAddress(e.target.value)} placeholder="地址（選填）"
                className="w-full px-6 py-7 rounded-2xl border-2 border-gold-light/30 text-xl text-center focus:outline-none focus:border-gold" />
              <div>
                <label className="block text-text-light text-base mb-2 px-2">🎂 生日（當月可享免費加項）</label>
                <input type="date" value={birthday} onChange={e => setBirthday(e.target.value)}
                  className="w-full px-6 py-7 rounded-2xl border-2 border-gold-light/30 text-xl text-center focus:outline-none focus:border-gold" />
              </div>
              <input value={referralPhone} onChange={e => setReferralPhone(e.target.value)} placeholder="推薦人電話（選填）"
                className="w-full px-6 py-7 rounded-2xl border-2 border-gold-light/30 text-xl text-center focus:outline-none focus:border-gold" />
            </>
          )}
        </div>

        <button onClick={mode === "login" ? handleLogin : handleRegister}
          className="w-full bg-gold text-white py-7 rounded-2xl text-2xl font-medium active:bg-dark-light mb-8 shadow-md">
          {mode === "login" ? "登入" : "註冊"}
        </button>

        <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
          className="text-gold text-lg py-3">
          {mode === "login" ? "還沒有帳號？立即註冊" : "已有帳號？登入"}
        </button>

        <a href="/" className="block text-text-light text-base mt-10">回首頁</a>
      </div>
    </div>
  );
}
