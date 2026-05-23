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
          <p className="text-text-light text-sm mb-8">後台管理登入</p>
          <input type="password" value={pass} onChange={(e) => setPass(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && pass === ADMIN_PASS) { sessionStorage.setItem("jyb-admin", "1"); setAuthed(true); } }}
            placeholder="請輸入管理密碼"
            className="w-full px-4 py-3 rounded-xl border border-gold-light/30 bg-white text-dark text-center placeholder-text-light/50 focus:outline-none focus:border-gold transition-colors mb-4" />
          <button onClick={() => { if (pass === ADMIN_PASS) { sessionStorage.setItem("jyb-admin", "1"); setAuthed(true); } }}
            className="w-full bg-gold text-white py-3 rounded-full text-sm tracking-wide hover:bg-dark-light transition-colors">登入</button>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: "bookings" as const, label: "預約列表" },
    { key: "customers" as const, label: "客戶資料" },
    { key: "new-booking" as const, label: "+預約" },
    { key: "new-customer" as const, label: "+客戶" },
  ];

  return (
    <div className="min-h-screen bg-warm-bg">
      <div className="bg-white border-b border-gold-light/30 px-4 pt-5 pb-0 sticky top-0 z-50">
        <p className="font-serif-tc text-lg font-bold text-dark text-center mb-4"><span className="text-gold">JY</span> Beauty 後台</p>
        <div className="flex justify-center gap-1">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2 text-xs font-medium rounded-t-lg transition-colors ${tab === t.key ? "bg-warm-bg text-gold border-t border-x border-gold-light/30" : "text-text-light hover:text-dark"}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6">
        {tab === "bookings" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-text-light text-sm">{bookings.length} 筆預約</span>
              <button onClick={fetchBookings} className="text-gold text-xs border border-gold px-3 py-1 rounded-full">重新整理</button>
            </div>
            {loading ? <p className="text-center text-text-light py-10">載入中...</p> :
            bookings.length === 0 ? <p className="text-center text-text-light py-10">目前沒有預約</p> :
            <div className="space-y-4">
              {bookings.map((b) => (
                <div key={b.id} className="bg-white rounded-2xl p-5 border border-gold-light/20 text-center">
                  <span className={`inline-block text-xs px-3 py-1 rounded-full mb-2 ${b.status === "pending" ? "bg-gold/10 text-gold" : "bg-green-100 text-green-700"}`}>
                    {b.status === "pending" ? "待確認" : "已確認"}
                  </span>
                  {b.source === "manual" && <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-500 ml-2">手動</span>}
                  <p className="font-semibold text-dark text-lg">{b.name}</p>
                  <p className="text-text-light text-sm">{b.phone}</p>
                  {b.address && <p className="text-text-light text-xs mt-1">{b.address}</p>}
                  <div className="grid grid-cols-2 gap-3 text-sm my-3">
                    <div><p className="text-text-light text-xs">套餐</p><p className="text-dark font-medium">{b.package}</p></div>
                    <div><p className="text-text-light text-xs">金額</p><p className="text-gold font-bold font-serif-tc text-lg">${b.total?.toLocaleString()}</p></div>
                    <div><p className="text-text-light text-xs">日期</p><p className="text-dark font-medium">{b.date}</p></div>
                    <div><p className="text-text-light text-xs">時段</p><p className="text-dark font-medium">{b.time}</p></div>
                  </div>
                  <p className="text-text-light text-xs mb-3">{b.created_at ? new Date(b.created_at).toLocaleString("zh-TW") : ""}</p>
                  <div className="flex justify-center gap-2">
                    <button onClick={async () => { await fetch("/api/bookings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: b.id, status: b.status === "pending" ? "confirmed" : "pending" }) }); fetchBookings(); }}
                      className={`text-xs px-4 py-2 rounded-full border ${b.status === "pending" ? "border-green-500 text-green-600" : "border-gold text-gold"}`}>
                      {b.status === "pending" ? "確認" : "待確認"}
                    </button>
                    <button onClick={async () => { if (confirm("確定刪除？")) { await fetch("/api/bookings", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: b.id }) }); fetchBookings(); } }}
                      className="text-xs px-4 py-2 rounded-full border border-red-300 text-red-400">刪除</button>
                  </div>
                </div>
              ))}
            </div>}
          </div>
        )}

        {tab === "customers" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-text-light text-sm">{customers.length} 位客戶</span>
              <button onClick={fetchCustomers} className="text-gold text-xs border border-gold px-3 py-1 rounded-full">重新整理</button>
            </div>
            {customers.length === 0 ? <p className="text-center text-text-light py-10">目前沒有客戶資料</p> :
            <div className="space-y-4">
              {customers.map((c) => (
                <div key={c.id} className="bg-white rounded-2xl p-5 border border-gold-light/20 text-center">
                  <p className="font-semibold text-dark text-lg">{c.name}</p>
                  <p className="text-text-light text-sm">{c.phone}</p>
                  {c.address && <p className="text-text-light text-xs mt-1">{c.address}</p>}
                  {c.notes && <p className="text-text-light text-xs italic mt-1">{c.notes}</p>}
                  <div className="grid grid-cols-3 gap-2 text-sm mt-3 mb-3">
                    <div><p className="text-text-light text-xs">預約次數</p><p className="text-dark font-bold">{c.booking_count}</p></div>
                    <div><p className="text-text-light text-xs">累計消費</p><p className="text-gold font-bold font-serif-tc">${Number(c.total_spent).toLocaleString()}</p></div>
                    <div><p className="text-text-light text-xs">最近到訪</p><p className="text-dark text-xs">{c.last_visit || "—"}</p></div>
                  </div>
                  <button onClick={async () => { if (confirm("確定刪除客戶？")) { await fetch("/api/customers", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: c.id }) }); fetchCustomers(); } }}
                    className="text-xs px-4 py-2 rounded-full border border-red-300 text-red-400">刪除</button>
                </div>
              ))}
            </div>}
          </div>
        )}

        {tab === "new-booking" && (
          <div className="bg-white rounded-2xl p-6 border border-gold-light/20">
            <h3 className="font-serif-tc text-lg font-bold text-dark text-center mb-6">手動建立預約</h3>
            <div className="space-y-4">
              <div><label className="text-xs text-text-light block mb-1">姓名</label><input value={nb.name} onChange={e => setNb({...nb, name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gold-light/30 text-sm focus:outline-none focus:border-gold" /></div>
              <div><label className="text-xs text-text-light block mb-1">電話</label><input value={nb.phone} onChange={e => setNb({...nb, phone: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gold-light/30 text-sm focus:outline-none focus:border-gold" /></div>
              <div><label className="text-xs text-text-light block mb-1">地址</label><input value={nb.address} onChange={e => setNb({...nb, address: e.target.value})} placeholder="到府服務地址" className="w-full px-4 py-3 rounded-xl border border-gold-light/30 text-sm focus:outline-none focus:border-gold" /></div>
              <div><label className="text-xs text-text-light block mb-1">套餐</label>
                <select value={nb.package} onChange={e => { const p = e.target.value; const t = p === "舒壓放鬆套餐" ? 2280 : p === "能量煥膚套餐" ? 3480 : 4880; setNb({...nb, package: p, total: t}); }}
                  className="w-full px-4 py-3 rounded-xl border border-gold-light/30 text-sm focus:outline-none focus:border-gold bg-white">
                  <option>舒壓放鬆套餐</option><option>能量煥膚套餐</option><option>極致寵愛套餐</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs text-text-light block mb-1">日期</label><input type="date" value={nb.date} onChange={e => setNb({...nb, date: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gold-light/30 text-sm focus:outline-none focus:border-gold" /></div>
                <div><label className="text-xs text-text-light block mb-1">時段</label>
                  <select value={nb.time} onChange={e => setNb({...nb, time: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gold-light/30 text-sm focus:outline-none focus:border-gold bg-white">
                    {["10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00"].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div><label className="text-xs text-text-light block mb-1">金額</label><input type="number" value={nb.total} onChange={e => setNb({...nb, total: Number(e.target.value)})} className="w-full px-4 py-3 rounded-xl border border-gold-light/30 text-sm focus:outline-none focus:border-gold" /></div>
              <button onClick={async () => {
                if (!nb.name || !nb.phone || !nb.date) return;
                await fetch("/api/bookings", { method: "POST", headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ package: nb.package, packageTier: "", addons: [], date: nb.date, time: nb.time, name: nb.name, phone: nb.phone, total: nb.total, address: nb.address, source: "manual" }) });
                await fetch("/api/customers", { method: "POST", headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ name: nb.name, phone: nb.phone, address: nb.address }) });
                alert("預約已建立！");
                setNb({ name: "", phone: "", address: "", package: "舒壓放鬆套餐", date: "", time: "10:00", total: 2280 });
                fetchBookings(); fetchCustomers(); setTab("bookings");
              }} className="w-full bg-gold text-white py-3 rounded-full text-sm tracking-wide">建立預約</button>
            </div>
          </div>
        )}

        {tab === "new-customer" && (
          <div className="bg-white rounded-2xl p-6 border border-gold-light/20">
            <h3 className="font-serif-tc text-lg font-bold text-dark text-center mb-6">新增客戶</h3>
            <div className="space-y-4">
              <div><label className="text-xs text-text-light block mb-1">姓名</label><input value={nc.name} onChange={e => setNc({...nc, name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gold-light/30 text-sm focus:outline-none focus:border-gold" /></div>
              <div><label className="text-xs text-text-light block mb-1">電話</label><input value={nc.phone} onChange={e => setNc({...nc, phone: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gold-light/30 text-sm focus:outline-none focus:border-gold" /></div>
              <div><label className="text-xs text-text-light block mb-1">地址</label><input value={nc.address} onChange={e => setNc({...nc, address: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gold-light/30 text-sm focus:outline-none focus:border-gold" /></div>
              <div><label className="text-xs text-text-light block mb-1">備註（膚質、過敏等）</label><textarea value={nc.notes} onChange={e => setNc({...nc, notes: e.target.value})} rows={3} className="w-full px-4 py-3 rounded-xl border border-gold-light/30 text-sm focus:outline-none focus:border-gold resize-none" /></div>
              <button onClick={async () => {
                if (!nc.name || !nc.phone) return;
                await fetch("/api/customers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(nc) });
                alert("客戶已建立！");
                setNc({ name: "", phone: "", address: "", notes: "" });
                fetchCustomers(); setTab("customers");
              }} className="w-full bg-gold text-white py-3 rounded-full text-sm tracking-wide">新增客戶</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
