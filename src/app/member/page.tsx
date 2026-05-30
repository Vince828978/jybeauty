"use client";
import { useState } from "react";

interface MemberData {
  name: string; phone: string; address: string; points: number; created_at: string;
}
interface BookingData {
  id: number; package: string; date: string; time: string; total: number; status: string;
}

export default function MemberPage() {
  const [mode, setMode] = useState<"login"|"register">("login");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [referralPhone, setReferralPhone] = useState("");
  const [error, setError] = useState("");
  const [member, setMember] = useState<MemberData | null>(null);
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [referralCount, setReferralCount] = useState(0);
  const [coupons, setCoupons] = useState<Array<{id: number; code: string; discount_value: number; description: string; expires_at: string; used: boolean}>>([]);

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
    } else {
      setError(d.error || "登入失敗");
    }
  };

  const handleRegister = async () => {
    setError("");
    if (!name || !phone || !password) { setError("請填寫必要欄位"); return; }
    const r = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "register", name, phone, password, address, referral_phone: referralPhone }) });
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

          <div className="bg-white rounded-3xl p-8 border border-gold-light/20 mb-8 shadow-sm">
            <h3 className="font-serif-tc text-xl font-bold text-dark mb-5">預約紀錄</h3>
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
