"use client";
import { useState, useEffect } from "react";

const ADMIN_PASS = "1234";

interface Booking {
  id: number; package: string; package_tier: string; date: string; time: string;
  name: string; phone: string; total: number; addons: string; address: string;
  source: string; created_at: string; status: string;
}
interface Customer {
  id: number; name: string; phone: string; address: string; notes: string;
  booking_count: number; total_spent: number; last_visit: string; created_at: string;
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pass, setPass] = useState("");
  const [tab, setTab] = useState<"bookings"|"customers"|"new-booking"|"new-customer">("bookings");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [nb, setNb] = useState({ name: "", phone: "", address: "", package: "舒壓放鬆套餐", date: "", time: "10:00", total: 2280 });
  const [nc, setNc] = useState({ name: "", phone: "", address: "", notes: "" });

  const fetchBookings = async () => { const r = await fetch("/api/bookings"); const d = await r.json(); setBookings(d.bookings || []); setLoading(false); };
  const fetchCustomers = async () => { const r = await fetch("/api/customers"); const d = await r.json(); setCustomers(d.customers || []); };

  useEffect(() => { if (typeof window !== "undefined" && sessionStorage.getItem("jyb-admin") === "1") setAuthed(true); }, []);
  useEffect(() => { if (authed) { fetchBookings(); fetchCustomers(); } }, [authed]);

  if (!authed) {
    return (
      <div className="min-h-screen bg-warm-bg flex items-center justify-center px-8">
        <div className="bg-white rounded-2xl p-10 max-w-sm w-full text-center">
          <p className="font-serif-tc text-2xl font-bold text-dark mb-2"><span className="text-gold">JY</span> Beauty</p>
          <p className="text-text-light text-base mb-8">後台管理登入</p>
          <input type="password" value={pass} onChange={(e) => setPass(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && pass === ADMIN_PASS) { sessionStorage.setItem("jyb-admin", "1"); setAuthed(true); } }}
            placeholder="請輸入管理密碼"
            className="w-full px-5 py-4 rounded-2xl border border-gold-light/30 bg-white text-dark text-center text-lg placeholder-text-light/50 focus:outline-none focus:border-gold mb-5" />
          <button onClick={() => { if (pass === ADMIN_PASS) { sessionStorage.setItem("jyb-admin", "1"); setAuthed(true); } }}
            className="w-full bg-gold text-white py-4 rounded-full text-base tracking-wide">登入</button>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: "bookings" as const, label: "預約" },
    { key: "customers" as const, label: "客戶" },
    { key: "new-booking" as const, label: "＋預約" },
    { key: "new-customer" as const, label: "＋客戶" },
  ];

  return (
    <div className="min-h-screen bg-warm-bg">
      {/* Header */}
      <div className="bg-white border-b border-gold-light/30 px-4 pt-5 pb-0 sticky top-0 z-50">
        <p className="font-serif-tc text-xl font-bold text-dark text-center mb-4"><span className="text-gold">JY</span> Beauty 後台</p>
        <div className="grid grid-cols-4 gap-1">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`py-3 text-sm font-medium text-center rounded-t-xl transition-colors ${tab === t.key ? "bg-warm-bg text-gold border-t-2 border-x border-gold" : "text-text-light"}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 py-6">

        {/* 預約列表 */}
        {tab === "bookings" && (
          <div className="text-center">
            <div className="flex justify-between items-center mb-5">
              <span className="text-text-light text-base">{bookings.length} 筆預約</span>
              <button onClick={fetchBookings} className="text-gold text-sm border-2 border-gold px-5 py-2 rounded-full">重新整理</button>
            </div>
            {loading ? <p className="text-text-light py-16 text-lg">載入中...</p> :
            bookings.length === 0 ? <p className="text-text-light py-16 text-lg">目前沒有預約</p> :
            <div className="space-y-5">
              {bookings.map((b) => (
                <div key={b.id} className="bg-white rounded-2xl p-6 border border-gold-light/20 text-center">
                  <span className={`inline-block text-sm px-4 py-1.5 rounded-full mb-3 ${b.status === "pending" ? "bg-gold/10 text-gold" : "bg-green-100 text-green-700"}`}>
                    {b.status === "pending" ? "待確認" : "已確認"}
                  </span>
                  {b.source === "manual" && <span className="inline-block text-sm px-3 py-1 rounded-full bg-blue-50 text-blue-500 ml-2">手動</span>}
                  <p className="font-bold text-dark text-2xl mt-2">{b.name}</p>
                  <p className="text-text-light text-base mt-1">{b.phone}</p>
                  {b.address && <p className="text-text-light text-sm mt-1">{b.address}</p>}
                  <div className="grid grid-cols-2 gap-4 my-5">
                    <div className="bg-cream/50 rounded-xl p-3">
                      <p className="text-text-light text-xs mb-1">套餐</p>
                      <p className="text-dark font-medium text-base">{b.package}</p>
                    </div>
                    <div className="bg-cream/50 rounded-xl p-3">
                      <p className="text-text-light text-xs mb-1">金額</p>
                      <p className="text-gold font-bold font-serif-tc text-2xl">${b.total?.toLocaleString()}</p>
                    </div>
                    <div className="bg-cream/50 rounded-xl p-3">
                      <p className="text-text-light text-xs mb-1">日期</p>
                      <p className="text-dark font-medium text-base">{b.date}</p>
                    </div>
                    <div className="bg-cream/50 rounded-xl p-3">
                      <p className="text-text-light text-xs mb-1">時段</p>
                      <p className="text-dark font-medium text-base">{b.time}</p>
                    </div>
                  </div>
                  <p className="text-text-light text-xs mb-5">{b.created_at ? new Date(b.created_at).toLocaleString("zh-TW") : ""}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={async () => { await fetch("/api/bookings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: b.id, status: b.status === "pending" ? "confirmed" : "pending" }) }); fetchBookings(); }}
                      className={`py-4 rounded-2xl text-base font-medium border-2 ${b.status === "pending" ? "border-green-500 text-green-600 active:bg-green-500 active:text-white" : "border-gold text-gold active:bg-gold active:text-white"}`}>
                      {b.status === "pending" ? "✓ 確認預約" : "↩ 改待確認"}
                    </button>
                    <button onClick={async () => { if (confirm("確定刪除這筆預約嗎？")) { await fetch("/api/bookings", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: b.id }) }); fetchBookings(); } }}
                      className="py-4 rounded-2xl text-base font-medium border-2 border-red-300 text-red-400 active:bg-red-500 active:text-white">
                      刪除
                    </button>
                  </div>
                </div>
              ))}
            </div>}
          </div>
        )}

        {/* 客戶資料 */}
        {tab === "customers" && (
          <div className="text-center">
            <div className="flex justify-between items-center mb-5">
              <span className="text-text-light text-base">{customers.length} 位客戶</span>
              <button onClick={fetchCustomers} className="text-gold text-sm border-2 border-gold px-5 py-2 rounded-full">重新整理</button>
            </div>
            {customers.length === 0 ? <p className="text-text-light py-16 text-lg">目前沒有客戶資料</p> :
            <div className="space-y-5">
              {customers.map((c) => (
                <div key={c.id} className="bg-white rounded-2xl p-6 border border-gold-light/20 text-center">
                  <p className="font-bold text-dark text-2xl">{c.name}</p>
                  <p className="text-text-light text-base mt-1">{c.phone}</p>
                  {c.address && <p className="text-text-light text-sm mt-1">{c.address}</p>}
                  {c.notes && <p className="text-text-light text-sm italic mt-2 bg-cream/50 rounded-xl p-3">{c.notes}</p>}
                  <div className="grid grid-cols-3 gap-3 my-5">
                    <div className="bg-cream/50 rounded-xl p-3">
                      <p className="text-text-light text-xs mb-1">預約次數</p>
                      <p className="text-dark font-bold text-xl">{c.booking_count}</p>
                    </div>
                    <div className="bg-cream/50 rounded-xl p-3">
                      <p className="text-text-light text-xs mb-1">累計消費</p>
                      <p className="text-gold font-bold font-serif-tc text-lg">${Number(c.total_spent).toLocaleString()}</p>
                    </div>
                    <div className="bg-cream/50 rounded-xl p-3">
                      <p className="text-text-light text-xs mb-1">最近到訪</p>
                      <p className="text-dark text-sm">{c.last_visit || "—"}</p>
                    </div>
                  </div>
                  <button onClick={async () => { if (confirm("確定刪除客戶？")) { await fetch("/api/customers", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: c.id }) }); fetchCustomers(); } }}
                    className="w-full py-4 rounded-2xl text-base font-medium border-2 border-red-300 text-red-400 active:bg-red-500 active:text-white">
                    刪除客戶
                  </button>
                </div>
              ))}
            </div>}
          </div>
        )}

        {/* 手動新增預約 */}
        {tab === "new-booking" && (
          <div className="bg-white rounded-2xl p-6 border border-gold-light/20 text-center">
            <h3 className="font-serif-tc text-xl font-bold text-dark mb-6">手動建立預約</h3>
            <div className="space-y-5">
              <div><label className="text-sm text-text-light block mb-2">姓名</label><input value={nb.name} onChange={e => setNb({...nb, name: e.target.value})} className="w-full px-5 py-4 rounded-2xl border border-gold-light/30 text-base text-center focus:outline-none focus:border-gold" /></div>
              <div><label className="text-sm text-text-light block mb-2">電話</label><input value={nb.phone} onChange={e => setNb({...nb, phone: e.target.value})} className="w-full px-5 py-4 rounded-2xl border border-gold-light/30 text-base text-center focus:outline-none focus:border-gold" /></div>
              <div><label className="text-sm text-text-light block mb-2">到府地址</label><input value={nb.address} onChange={e => setNb({...nb, address: e.target.value})} placeholder="服務地址" className="w-full px-5 py-4 rounded-2xl border border-gold-light/30 text-base text-center focus:outline-none focus:border-gold" /></div>
              <div><label className="text-sm text-text-light block mb-2">套餐</label>
                <select value={nb.package} onChange={e => { const p = e.target.value; const t = p === "舒壓放鬆套餐" ? 2280 : p === "能量煥膚套餐" ? 3480 : 4880; setNb({...nb, package: p, total: t}); }}
                  className="w-full px-5 py-4 rounded-2xl border border-gold-light/30 text-base text-center focus:outline-none focus:border-gold bg-white appearance-none">
                  <option>舒壓放鬆套餐</option><option>能量煥膚套餐</option><option>極致寵愛套餐</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm text-text-light block mb-2">日期</label><input type="date" value={nb.date} onChange={e => setNb({...nb, date: e.target.value})} className="w-full px-4 py-4 rounded-2xl border border-gold-light/30 text-base text-center focus:outline-none focus:border-gold" /></div>
                <div><label className="text-sm text-text-light block mb-2">時段</label>
                  <select value={nb.time} onChange={e => setNb({...nb, time: e.target.value})}
                    className="w-full px-4 py-4 rounded-2xl border border-gold-light/30 text-base text-center focus:outline-none focus:border-gold bg-white appearance-none">
                    {["10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00"].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div><label className="text-sm text-text-light block mb-2">金額</label><input type="number" value={nb.total} onChange={e => setNb({...nb, total: Number(e.target.value)})} className="w-full px-5 py-4 rounded-2xl border border-gold-light/30 text-base text-center focus:outline-none focus:border-gold" /></div>
              <button onClick={async () => {
                if (!nb.name || !nb.phone || !nb.date) return;
                await fetch("/api/bookings", { method: "POST", headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ package: nb.package, packageTier: "", addons: [], date: nb.date, time: nb.time, name: nb.name, phone: nb.phone, total: nb.total, address: nb.address, source: "manual" }) });
                await fetch("/api/customers", { method: "POST", headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ name: nb.name, phone: nb.phone, address: nb.address }) });
                alert("預約已建立！");
                setNb({ name: "", phone: "", address: "", package: "舒壓放鬆套餐", date: "", time: "10:00", total: 2280 });
                fetchBookings(); fetchCustomers(); setTab("bookings");
              }} className="w-full bg-gold text-white py-5 rounded-2xl text-lg font-medium tracking-wide active:bg-dark-light">
                建立預約
              </button>
            </div>
          </div>
        )}

        {/* 新增客戶 */}
        {tab === "new-customer" && (
          <div className="bg-white rounded-2xl p-6 border border-gold-light/20 text-center">
            <h3 className="font-serif-tc text-xl font-bold text-dark mb-6">新增客戶</h3>
            <div className="space-y-5">
              <div><label className="text-sm text-text-light block mb-2">姓名</label><input value={nc.name} onChange={e => setNc({...nc, name: e.target.value})} className="w-full px-5 py-4 rounded-2xl border border-gold-light/30 text-base text-center focus:outline-none focus:border-gold" /></div>
              <div><label className="text-sm text-text-light block mb-2">電話</label><input value={nc.phone} onChange={e => setNc({...nc, phone: e.target.value})} className="w-full px-5 py-4 rounded-2xl border border-gold-light/30 text-base text-center focus:outline-none focus:border-gold" /></div>
              <div><label className="text-sm text-text-light block mb-2">地址</label><input value={nc.address} onChange={e => setNc({...nc, address: e.target.value})} className="w-full px-5 py-4 rounded-2xl border border-gold-light/30 text-base text-center focus:outline-none focus:border-gold" /></div>
              <div><label className="text-sm text-text-light block mb-2">備註（膚質、過敏等）</label><textarea value={nc.notes} onChange={e => setNc({...nc, notes: e.target.value})} rows={3} className="w-full px-5 py-4 rounded-2xl border border-gold-light/30 text-base text-center focus:outline-none focus:border-gold resize-none" /></div>
              <button onClick={async () => {
                if (!nc.name || !nc.phone) return;
                await fetch("/api/customers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(nc) });
                alert("客戶已建立！");
                setNc({ name: "", phone: "", address: "", notes: "" });
                fetchCustomers(); setTab("customers");
              }} className="w-full bg-gold text-white py-5 rounded-2xl text-lg font-medium tracking-wide active:bg-dark-light">
                新增客戶
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
