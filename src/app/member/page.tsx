"use client";
import { useState } from "react";

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
    return (
      // 冠 #4411 2026-05-30: 欄位拉開加大 + 整體左右置中
      <div className="min-h-screen bg-warm-bg">
        <div className="bg-white border-b border-gold-light/30 px-6 py-6 text-center">
          <p className="font-serif-tc text-2xl font-bold text-dark"><span className="text-gold">JY</span> Beauty</p>
          <p className="text-text-light text-base mt-1">會員中心</p>
        </div>
        <div className="max-w-md mx-auto px-6 py-10 text-center">
          <div className="bg-white rounded-3xl p-10 border border-gold-light/20 mb-8 shadow-sm">
            <p className="text-gold text-sm tracking-widest mb-3">MEMBER</p>
            <p className="font-bold text-dark text-3xl mb-2">{member.name}</p>
            <p className="text-text-light text-lg">{member.phone}</p>
            {member.address && <p className="text-text-light text-base mt-2">{member.address}</p>}
            <div className="grid grid-cols-2 gap-5 mt-8">
              <div className="bg-cream/50 rounded-2xl p-6">
                <p className="text-text-light text-sm mb-2">預約次數</p>
                <p className="text-dark font-bold text-3xl">{bookings.length}</p>
              </div>
              <div className="bg-cream/50 rounded-2xl p-6">
                <p className="text-text-light text-sm mb-2">推薦好友</p>
                <p className="text-gold font-bold text-3xl">{referralCount}</p>
              </div>
            </div>
          </div>

          {/* 肉包 #5092 2026-06-01: 會員等級卡 */}
          {tierInfo && (
            <div className={`rounded-3xl p-8 mb-8 shadow-lg ${
              tierInfo.tier === "black" ? "bg-gradient-to-br from-gray-900 to-gray-700 text-white" :
              tierInfo.tier === "gold" ? "bg-gradient-to-br from-amber-300 to-yellow-500 text-amber-950" :
              tierInfo.tier === "silver" ? "bg-gradient-to-br from-slate-200 to-slate-400 text-slate-800" :
              "bg-white border border-gold-light/20 text-dark"
            }`}>
              <p className={`text-sm tracking-widest mb-3 ${tierInfo.tier === "black" ? "text-amber-300" : "text-current opacity-70"}`}>
                MEMBER TIER · {tierInfo.quarter.label}
              </p>
              {tierInfo.tier_config ? (
                <>
                  <p className="text-4xl font-bold mb-2">
                    {tierInfo.tier_config.emoji} {tierInfo.tier_config.label}
                  </p>
                  <p className="text-sm opacity-80 mb-4">
                    本季享 {tierInfo.tier_config.discount === 1 ? "無折扣" : `${(tierInfo.tier_config.discount * 10).toFixed(1)} 折`}
                  </p>
                  <div className="space-y-1 text-xs opacity-90">
                    {tierInfo.tier_config.perks.map((p, i) => (
                      <p key={i}>✓ {p}</p>
                    ))}
                  </div>
                  <div className="mt-5 pt-5 border-t border-current opacity-60">
                    <p className="text-xs">本季消費</p>
                    <p className="text-xl font-bold">NT$ {tierInfo.quarter_spent.toLocaleString()}</p>
                    {tierInfo.next_tier_config && tierInfo.next_tier_remaining > 0 && (
                      <p className="text-xs mt-2 opacity-80">
                        再消費 NT$ {tierInfo.next_tier_remaining.toLocaleString()} 升 {tierInfo.next_tier_config.emoji} {tierInfo.next_tier_config.label}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <p className="text-2xl font-bold mb-2">尚未升級</p>
                  <p className="text-sm opacity-70 mb-4">本季消費 NT$ {tierInfo.quarter_spent.toLocaleString()}</p>
                  {tierInfo.next_tier_config && (
                    <p className="text-sm text-gold">
                      再消費 NT$ {tierInfo.next_tier_remaining.toLocaleString()} 升 {tierInfo.next_tier_config.emoji} {tierInfo.next_tier_config.label}
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          {/* 肉包 #5100/#5105 2026-06-01: 卡片餘額 + 兌換碼 */}
          <div className="bg-white rounded-3xl p-8 border border-gold-light/20 mb-8 shadow-sm">
            <div className="flex justify-between items-baseline mb-4">
              <p className="text-gold text-sm tracking-widest">💳 卡片餘額</p>
              <a href="/cards" className="text-pink-600 text-sm font-medium">＋ 購買卡</a>
            </div>
            <p className="text-warm-text text-4xl font-bold mb-4">NT$ {cardBalance.toLocaleString()}</p>

            <div className="border-t border-gold-light/30 pt-4">
              <p className="text-warm-text/70 text-sm mb-3">收到禮品卡兌換碼？輸入這裡：</p>
              <div className="flex gap-2">
                <input value={redeemCode} onChange={e => setRedeemCode(e.target.value.toUpperCase())}
                  placeholder="8 碼兌換碼" maxLength={8}
                  className="flex-1 px-4 py-3 rounded-xl border border-gold-light/40 font-mono tracking-widest text-center" />
                <button onClick={async () => {
                  setRedeemMsg("");
                  if (redeemCode.length !== 8) { setRedeemMsg("兌換碼是 8 碼"); return; }
                  const r = await fetch("/api/cards/redeem", { method: "POST", headers: {"Content-Type":"application/json"},
                    body: JSON.stringify({ code: redeemCode, phone: member?.phone }) });
                  const d = await r.json();
                  if (d.ok) {
                    setRedeemMsg(`✅ 入帳 NT$ ${d.added.toLocaleString()}`);
                    setCardBalance(d.new_balance);
                    setRedeemCode("");
                  } else {
                    setRedeemMsg(`❌ ${d.error}`);
                  }
                }} className="bg-pink-500 text-white px-5 py-3 rounded-xl font-medium">兌換</button>
              </div>
              {redeemMsg && <p className={`text-sm mt-2 ${redeemMsg.startsWith("✅") ? "text-green-600" : "text-red-600"}`}>{redeemMsg}</p>}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-gold-light/20 mb-8 shadow-sm">
            <p className="text-gold text-sm tracking-widest mb-4">推薦好友</p>
            <p className="text-dark text-base mb-3">分享你的電話號碼給朋友</p>
            <p className="text-dark text-base mb-2">朋友預約時填入你的電話</p>
            <p className="text-gold font-bold text-xl mt-5">雙方皆享加值項目免費升級</p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-gold-light/20 mb-8 shadow-sm">
            <p className="text-gold text-sm tracking-widest mb-4">🎟 我的優惠券</p>
            {coupons.length === 0 ? (
              <p className="text-text-light text-base py-4">目前沒有優惠券</p>
            ) : (
              <div className="space-y-4">
                {coupons.map((c) => (
                  <div key={c.id} className={`relative rounded-2xl p-5 border-2 ${c.used ? "border-gray-200 bg-gray-50 opacity-60" : "border-gold/30 bg-gradient-to-r from-gold/5 to-transparent"}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className={`font-bold text-2xl ${c.used ? "text-gray-400 line-through" : "text-gold"}`}>{c.discount_value}% OFF</p>
                        <p className={`text-base mt-1 ${c.used ? "text-gray-400" : "text-dark"}`}>{c.description || "折扣優惠券"}</p>
                      </div>
                      <span className={`text-xs px-3 py-1.5 rounded-full ${c.used ? "bg-gray-200 text-gray-500" : "bg-gold/10 text-gold"}`}>
                        {c.used ? "已使用" : "可使用"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <p className="text-xs text-text-light">代碼：{c.code}</p>
                      <p className="text-xs text-text-light">{c.expires_at ? `有效期限 ${c.expires_at.slice(0,10)}` : "無期限"}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 冠 #4456: 推薦好友明細 (可移除測試資料) */}
          {referrals.length > 0 && (
            <div className="bg-white rounded-3xl p-8 border border-gold-light/20 mb-8 shadow-sm">
              <p className="text-gold text-sm tracking-widest mb-4">🤝 我邀請的好友 ({referrals.length})</p>
              <div className="space-y-3">
                {referrals.map((r) => (
                  <div key={r.id} className="flex justify-between items-center bg-cream/40 rounded-xl p-4 border border-gold-light/10">
                    <div className="text-left">
                      <p className="text-dark font-medium text-base">{r.referred_name || "未填姓名"}</p>
                      <p className="text-text-light text-xs mt-1">{r.referred_phone} · {r.created_at?.slice(0,10)}</p>
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

          {/* 冠 #4456: 預約紀錄 + 累計消費 */}
          <div className="bg-white rounded-3xl p-8 border border-gold-light/20 mb-8 shadow-sm">
            <div className="flex items-baseline justify-between mb-5">
              <h3 className="font-serif-tc text-xl font-bold text-dark">預約紀錄</h3>
              {bookings.length > 0 && (
                <div className="text-right">
                  <p className="text-text-light text-xs">累計消費</p>
                  <p className="text-gold font-bold text-xl">${bookings.reduce((s,b)=>s+(b.total||0),0).toLocaleString()}</p>
                </div>
              )}
            </div>
            {bookings.length === 0 ? <p className="text-text-light text-base py-6">尚無預約紀錄</p> :
            <div className="space-y-4">
              {bookings.map((b) => (
                <div key={b.id} className="bg-cream/30 rounded-2xl p-6 border border-gold-light/10 text-left">
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-dark font-medium text-base">{b.package}</p>
                    <span className={`text-xs px-3 py-1.5 rounded-full ${b.status === "confirmed" ? "bg-green-100 text-green-700" : "bg-gold/10 text-gold"}`}>
                      {b.status === "confirmed" ? "已確認" : "待確認"}
                    </span>
                  </div>
                  <p className="text-text-light text-sm mb-2">{b.date} {b.time}</p>
                  <p className="text-gold font-serif-tc font-bold text-xl">${b.total?.toLocaleString()}</p>
                </div>
              ))}
            </div>}
          </div>

          {/* 冠 #4456: 修改密碼 (折疊) */}
          <details className="bg-white rounded-3xl border border-gold-light/20 mb-8 shadow-sm overflow-hidden">
            <summary className="px-8 py-6 cursor-pointer text-gold text-sm tracking-widest font-medium" style={{listStyle:"none"}}>
              🔒 修改密碼  <span className="text-text-light text-xs ml-2">點此展開</span>
            </summary>
            <div className="px-8 pb-8 space-y-4">
              <input type="password" placeholder="原密碼" value={pwOld} onChange={e=>setPwOld(e.target.value)}
                className="w-full px-5 py-4 rounded-xl border-2 border-gold-light/30 text-base focus:outline-none focus:border-gold" />
              <input type="password" placeholder="新密碼 (至少 4 字)" value={pwNew} onChange={e=>setPwNew(e.target.value)}
                className="w-full px-5 py-4 rounded-xl border-2 border-gold-light/30 text-base focus:outline-none focus:border-gold" />
              <input type="password" placeholder="再次輸入新密碼" value={pwConfirm} onChange={e=>setPwConfirm(e.target.value)}
                className="w-full px-5 py-4 rounded-xl border-2 border-gold-light/30 text-base focus:outline-none focus:border-gold" />
              {pwMsg && <p className={`text-sm py-2 ${pwMsg.startsWith("✅") ? "text-green-600" : "text-red-500"}`}>{pwMsg}</p>}
              <button onClick={handleChangePw}
                className="w-full bg-gold text-white py-4 rounded-xl text-base font-medium active:bg-dark-light">
                更新密碼
              </button>
            </div>
          </details>

          <div className="space-y-4">
            <a href="/booking" className="block w-full bg-gold text-white py-6 rounded-2xl text-xl font-medium text-center active:bg-dark-light shadow-md">預約療程</a>
            <a href="/" className="block w-full py-4 rounded-2xl text-base text-text-light text-center">回首頁</a>
          </div>
        </div>
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
