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

  const handleLogin = async () => {
    setError("");
    const r = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "login", phone, password }) });
    const d = await r.json();
    if (d.success) {
      setMember(d.member);
      setBookings(d.bookings || []);
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
      <div className="min-h-screen bg-warm-bg">
        <div className="bg-white border-b border-gold-light/30 px-6 py-5 text-center">
          <p className="font-serif-tc text-xl font-bold text-dark"><span className="text-gold">JY</span> Beauty</p>
          <p className="text-text-light text-sm">會員中心</p>
        </div>
        <div className="max-w-sm mx-auto px-6 py-8 text-center">
          <div className="bg-white rounded-2xl p-8 border border-gold-light/20 mb-6">
            <p className="text-gold text-xs tracking-wide mb-2">MEMBER</p>
            <p className="font-bold text-dark text-2xl mb-1">{member.name}</p>
            <p className="text-text-light text-base">{member.phone}</p>
            {member.address && <p className="text-text-light text-sm mt-1">{member.address}</p>}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-cream/50 rounded-xl p-4">
                <p className="text-text-light text-xs mb-1">預約次數</p>
                <p className="text-dark font-bold text-2xl">{bookings.length}</p>
              </div>
              <div className="bg-cream/50 rounded-xl p-4">
                <p className="text-text-light text-xs mb-1">推薦好友</p>
                <p className="text-gold font-bold text-2xl">{referralCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gold-light/20 mb-6">
            <p className="text-gold text-xs tracking-wide mb-3">推薦好友</p>
            <p className="text-dark text-sm mb-2">分享你的電話號碼給朋友</p>
            <p className="text-dark text-sm mb-1">朋友預約時填入你的電話</p>
            <p className="text-gold font-bold text-lg mt-3">雙方皆享加值項目免費升級</p>
          </div>

          <h3 className="font-serif-tc text-lg font-bold text-dark mb-4">預約紀錄</h3>
          {bookings.length === 0 ? <p className="text-text-light py-6">尚無預約紀錄</p> :
          <div className="space-y-3">
            {bookings.map((b) => (
              <div key={b.id} className="bg-white rounded-2xl p-5 border border-gold-light/20">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-dark font-medium">{b.package}</p>
                  <span className={`text-xs px-3 py-1 rounded-full ${b.status === "confirmed" ? "bg-green-100 text-green-700" : "bg-gold/10 text-gold"}`}>
                    {b.status === "confirmed" ? "已確認" : "待確認"}
                  </span>
                </div>
                <p className="text-text-light text-sm">{b.date} {b.time}</p>
                <p className="text-gold font-serif-tc font-bold text-lg">${b.total?.toLocaleString()}</p>
              </div>
            ))}
          </div>}

          <div className="mt-8 space-y-3">
            <a href="/booking" className="block w-full bg-gold text-white py-5 rounded-2xl text-lg font-medium text-center active:bg-dark-light">預約療程</a>
            <a href="/" className="block w-full py-4 rounded-2xl text-base text-text-light text-center">回首頁</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-bg flex items-center justify-center px-6">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center">
        <p className="font-serif-tc text-2xl font-bold text-dark mb-1"><span className="text-gold">JY</span> Beauty</p>
        <p className="text-text-light text-sm mb-8">會員{mode === "login" ? "登入" : "註冊"}</p>

        {error && <p className="text-red-500 text-sm mb-4 bg-red-50 rounded-xl py-2">{error}</p>}

        <div className="space-y-4 mb-6">
          {mode === "register" && (
            <input value={name} onChange={e => setName(e.target.value)} placeholder="姓名"
              className="w-full px-5 py-4 rounded-2xl border border-gold-light/30 text-base text-center focus:outline-none focus:border-gold" />
          )}
          <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="手機號碼" type="tel"
            className="w-full px-5 py-4 rounded-2xl border border-gold-light/30 text-base text-center focus:outline-none focus:border-gold" />
          <input value={password} onChange={e => setPassword(e.target.value)} placeholder="密碼" type="password"
            className="w-full px-5 py-4 rounded-2xl border border-gold-light/30 text-base text-center focus:outline-none focus:border-gold" />
          {mode === "register" && (
            <>
              <input value={address} onChange={e => setAddress(e.target.value)} placeholder="地址（選填）"
                className="w-full px-5 py-4 rounded-2xl border border-gold-light/30 text-base text-center focus:outline-none focus:border-gold" />
              <input value={referralPhone} onChange={e => setReferralPhone(e.target.value)} placeholder="推薦人電話（選填）"
                className="w-full px-5 py-4 rounded-2xl border border-gold-light/30 text-base text-center focus:outline-none focus:border-gold" />
            </>
          )}
        </div>

        <button onClick={mode === "login" ? handleLogin : handleRegister}
          className="w-full bg-gold text-white py-5 rounded-2xl text-lg font-medium active:bg-dark-light mb-4">
          {mode === "login" ? "登入" : "註冊"}
        </button>

        <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
          className="text-gold text-base">
          {mode === "login" ? "還沒有帳號？立即註冊" : "已有帳號？登入"}
        </button>

        <a href="/" className="block text-text-light text-sm mt-6">回首頁</a>
      </div>
    </div>
  );
}
