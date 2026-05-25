"use client";
import { useState, useEffect } from "react";

const ADMIN_PASS = process.env.NEXT_PUBLIC_ADMIN_PASS || "1234";

interface Booking {
  id: number; package: string; package_tier: string; date: string; time: string;
  name: string; phone: string; total: number; addons: string; address: string;
  source: string; created_at: string; status: string;
}
interface Customer {
  id: number; name: string; phone: string; address: string; notes: string;
  booking_count: number; total_spent: number; last_visit: string; created_at: string;
}

type View = "home"|"bookings"|"customers"|"new-booking"|"new-customer"|"stats"|"coupons"|"referrals"|"service-record"|"schedule"|"notifications";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pass, setPass] = useState("");
  const [view, setView] = useState<View>("home");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Record<string, unknown>>({});
  const [coupons, setCoupons] = useState<Record<string, unknown>[]>([]);
  const [referrals, setReferrals] = useState<Record<string, unknown>[]>([]);
  const [newCoupon, setNewCoupon] = useState({ code: "", discount_value: 15, description: "", max_uses: 100, expires_at: "" });
  const [newRecord, setNewRecord] = useState({ customer_phone: "", customer_name: "", service_date: "", package: "", products_used: "", techniques: "", skin_condition: "", notes: "" });
  const [nb, setNb] = useState({ name: "", phone: "", address: "", package: "舒壓放鬆套餐", date: "", time: "10:00", total: 2280 });
  const [nc, setNc] = useState({ name: "", phone: "", address: "", notes: "" });
  const [notifCount, setNotifCount] = useState(0);
  const [notifications, setNotifications] = useState<Record<string, unknown>[]>([]);
  const [blockedDates, setBlockedDates] = useState<Record<string, unknown>[]>([]);
  const [blockForm, setBlockForm] = useState({ startDate: "", endDate: "", time: "all", reason: "" });

  const fetchBookings = async () => { const r = await fetch("/api/bookings"); const d = await r.json(); setBookings(d.bookings || []); setLoading(false); };
  const fetchCustomers = async () => { const r = await fetch("/api/customers"); const d = await r.json(); setCustomers(d.customers || []); };
  const fetchStats = async () => { const r = await fetch("/api/stats"); const d = await r.json(); setStats(d); };
  const fetchCoupons = async () => { const r = await fetch("/api/coupons"); const d = await r.json(); setCoupons(d.coupons || []); };
  const fetchReferrals = async () => { const r = await fetch("/api/referrals"); const d = await r.json(); setReferrals(d.referrals || []); };
  const fetchNotifications = async () => { const r = await fetch("/api/notifications"); const d = await r.json(); setNotifCount(d.unreadCount || 0); setNotifications(d.notifications || []); };
  const fetchBlockedDates = async () => { const r = await fetch("/api/blocked-dates"); const d = await r.json(); setBlockedDates(d.blockedDates || []); };

  useEffect(() => { if (typeof window !== "undefined" && sessionStorage.getItem("jyb-admin") === "1") setAuthed(true); }, []);
  useEffect(() => { if (authed) { fetchBookings(); fetchCustomers(); fetchStats(); fetchCoupons(); fetchReferrals(); fetchNotifications(); fetchBlockedDates(); } }, [authed]);
  useEffect(() => { if (authed) { const iv = setInterval(fetchNotifications, 30000); return () => clearInterval(iv); } }, [authed]);

  if (!authed) {
    return (
      <div className="min-h-screen bg-warm-bg flex items-center justify-center px-8">
        <div className="bg-white rounded-2xl p-10 max-w-sm w-full text-center">
          <p className="font-serif-tc text-2xl font-bold text-dark mb-2"><span className="text-gold">JY</span> Beauty</p>
          <p className="text-text-light text-base mb-8">後台管理登入</p>
          <input type="password" value={pass} onChange={(e) => setPass(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && pass === ADMIN_PASS) { sessionStorage.setItem("jyb-admin", "1"); setAuthed(true); } }}
            placeholder="請輸入管理密碼"
            className="w-full px-5 py-4 rounded-2xl border border-gold-light/30 bg-white text-dark text-center text-lg focus:outline-none focus:border-gold mb-5" />
          <button onClick={() => { if (pass === ADMIN_PASS) { sessionStorage.setItem("jyb-admin", "1"); setAuthed(true); } }}
            className="w-full bg-gold text-white py-4 rounded-full text-base tracking-wide">登入</button>
        </div>
      </div>
    );
  }

  const s = stats as Record<string, Record<string, number>>;

  // Home view with dashboard + function menu
  if (view === "home") {
    return (
      <div className="min-h-screen bg-warm-bg">
        <div className="bg-white border-b border-gold-light/30 px-6 py-5 text-center">
          <p className="font-serif-tc text-xl font-bold text-dark"><span className="text-gold">JY</span> Beauty 後台</p>
        </div>
        <div className="max-w-lg mx-auto px-5 py-6">
          {/* 儀表板區域 */}
          <div className="bg-white rounded-2xl p-6 border border-gold-light/20 mb-6 text-center">
            <p className="text-gold text-xs tracking-wide mb-4">儀表板</p>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-cream/50 rounded-xl p-4">
                <p className="text-text-light text-xs mb-1">本月營收</p>
                <p className="text-gold font-bold font-serif-tc text-2xl">${Number(s.month?.revenue || 0).toLocaleString()}</p>
              </div>
              <div className="bg-cream/50 rounded-xl p-4">
                <p className="text-text-light text-xs mb-1">待確認</p>
                <p className="text-dark font-bold text-2xl">{Number((stats as Record<string, number>).pending || 0)}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-cream/50 rounded-xl p-4">
                <p className="text-text-light text-xs mb-1">客戶數</p>
                <p className="text-dark font-bold text-2xl">{customers.length}</p>
              </div>
              <div className="bg-cream/50 rounded-xl p-4">
                <p className="text-text-light text-xs mb-1">需回訪</p>
                <p className="text-dark font-bold text-2xl">{Number((stats as Record<string, number>).needFollowUp || 0)}</p>
              </div>
            </div>
          </div>

          {/* 功能列表 */}
          <p className="text-text-light text-sm text-center mb-4">功能選單</p>
          <div className="space-y-3">
            {[
              { key: "stats" as View, label: "營收報表", desc: "今日/月/累計營收統計", icon: "📊" },
              { key: "bookings" as View, label: "預約管理", desc: `${bookings.length} 筆預約`, icon: "📋" },
              { key: "customers" as View, label: "客戶資料", desc: `${customers.length} 位客戶`, icon: "👤" },
              { key: "coupons" as View, label: "優惠券管理", desc: `${coupons.length} 張優惠券`, icon: "🎟" },
              { key: "referrals" as View, label: "推薦好友", desc: `${referrals.length} 筆推薦紀錄`, icon: "🤝" },
              { key: "new-booking" as View, label: "手動建立預約", desc: "LINE / 電話預約用", icon: "➕" },
              { key: "new-customer" as View, label: "新增客戶", desc: "建立客戶檔案", icon: "➕" },
              { key: "service-record" as View, label: "新增服務紀錄", desc: "記錄產品/手法/膚況", icon: "📝" },
              { key: "schedule" as View, label: "排程管理", desc: "關閉時段/整天/多天", icon: "📅" },
              { key: "notifications" as View, label: `通知中心${notifCount > 0 ? ` (${notifCount})` : ""}`, desc: notifCount > 0 ? `${notifCount} 則未讀通知` : "暫無新通知", icon: notifCount > 0 ? "🔴" : "🔔" },
            ].map((item) => (
              <button key={item.key} onClick={() => setView(item.key)}
                className="w-full bg-white rounded-2xl p-5 border border-gold-light/20 flex items-center gap-4 text-left active:bg-gold/5 active:border-gold transition-all">
                <span className="text-2xl">{item.icon}</span>
                <div className="flex-1">
                  <p className="text-dark font-medium text-lg">{item.label}</p>
                  <p className="text-text-light text-sm">{item.desc}</p>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gold-light"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Sub-page header with back button
  const SubHeader = ({ title }: { title: string }) => (
    <div className="bg-white border-b border-gold-light/30 px-6 py-5 sticky top-0 z-50">
      <div className="max-w-lg mx-auto flex items-center">
        <button onClick={() => setView("home")} className="w-12 h-12 flex items-center justify-center rounded-full active:bg-cream">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-dark"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <p className="flex-1 font-serif-tc text-lg font-bold text-dark text-center pr-12">{title}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-warm-bg">
      {view === "stats" && (
        <>
          <SubHeader title="營收報表" />
          <div className="max-w-lg mx-auto px-5 py-6 text-center space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-gold-light/20"><p className="text-text-light text-sm mb-1">今日營收</p><p className="text-gold font-bold font-serif-tc text-2xl">${Number(s.today?.revenue || 0).toLocaleString()}</p><p className="text-text-light text-xs">{Number(s.today?.count || 0)} 筆</p></div>
              <div className="bg-white rounded-2xl p-5 border border-gold-light/20"><p className="text-text-light text-sm mb-1">本月營收</p><p className="text-gold font-bold font-serif-tc text-2xl">${Number(s.month?.revenue || 0).toLocaleString()}</p><p className="text-text-light text-xs">{Number(s.month?.count || 0)} 筆</p></div>
              <div className="bg-white rounded-2xl p-5 border border-gold-light/20"><p className="text-text-light text-sm mb-1">累計營收</p><p className="text-gold font-bold font-serif-tc text-2xl">${Number(s.total?.revenue || 0).toLocaleString()}</p><p className="text-text-light text-xs">{Number(s.total?.count || 0)} 筆</p></div>
              <div className="bg-white rounded-2xl p-5 border border-gold-light/20"><p className="text-text-light text-sm mb-1">待確認</p><p className="text-dark font-bold text-2xl">{Number((stats as Record<string, number>).pending || 0)}</p><p className="text-text-light text-xs">筆預約</p></div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gold-light/20"><p className="text-text-light text-sm mb-1">熱門套餐</p><p className="text-dark font-bold text-lg">{String((stats as Record<string, string>).popularPackage || "—")}</p></div>
            <div className="bg-white rounded-2xl p-5 border border-gold-light/20"><p className="text-text-light text-sm mb-1">需回訪提醒</p><p className="text-dark font-bold text-2xl">{Number((stats as Record<string, number>).needFollowUp || 0)} 位客戶</p><p className="text-text-light text-xs">超過 30 天未到訪</p></div>
            <button onClick={fetchStats} className="w-full py-4 rounded-2xl border-2 border-gold text-gold text-base font-medium active:bg-gold active:text-white">重新整理</button>
          </div>
        </>
      )}

      {view === "bookings" && (
        <>
          <SubHeader title="預約管理" />
          <div className="max-w-lg mx-auto px-5 py-6 text-center">
            <div className="flex justify-between items-center mb-5">
              <span className="text-text-light text-base">{bookings.length} 筆預約</span>
              <button onClick={fetchBookings} className="text-gold text-sm border-2 border-gold px-5 py-2 rounded-full">重新整理</button>
            </div>
            {loading ? <p className="text-text-light py-16 text-lg">載入中...</p> :
            bookings.length === 0 ? <p className="text-text-light py-16 text-lg">目前沒有預約</p> :
            <div className="space-y-5">
              {bookings.map((b) => (
                <div key={b.id} className="bg-white rounded-2xl p-6 border border-gold-light/20 text-center">
                  <span className={`inline-block text-sm px-4 py-1.5 rounded-full mb-3 ${b.status === "pending" ? "bg-gold/10 text-gold" : "bg-green-100 text-green-700"}`}>{b.status === "pending" ? "待確認" : "已確認"}</span>
                  {b.source === "manual" && <span className="inline-block text-sm px-3 py-1 rounded-full bg-blue-50 text-blue-500 ml-2">手動</span>}
                  <p className="font-bold text-dark text-2xl mt-2">{b.name}</p>
                  <p className="text-text-light text-base mt-1">{b.phone}</p>
                  {b.address && <p className="text-text-light text-sm mt-1">{b.address}</p>}
                  <div className="grid grid-cols-2 gap-4 my-5">
                    <div className="bg-cream/50 rounded-xl p-3"><p className="text-text-light text-xs mb-1">套餐</p><p className="text-dark font-medium text-base">{b.package}</p></div>
                    <div className="bg-cream/50 rounded-xl p-3"><p className="text-text-light text-xs mb-1">金額</p><p className="text-gold font-bold font-serif-tc text-2xl">${b.total?.toLocaleString()}</p></div>
                    <div className="bg-cream/50 rounded-xl p-3"><p className="text-text-light text-xs mb-1">日期</p><p className="text-dark font-medium text-base">{b.date}</p></div>
                    <div className="bg-cream/50 rounded-xl p-3"><p className="text-text-light text-xs mb-1">時段</p><p className="text-dark font-medium text-base">{b.time}</p></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={async () => { await fetch("/api/bookings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: b.id, status: b.status === "pending" ? "confirmed" : "pending" }) }); fetchBookings(); fetchStats(); }}
                      className={`py-4 rounded-2xl text-base font-medium border-2 ${b.status === "pending" ? "border-green-500 text-green-600 active:bg-green-500 active:text-white" : "border-gold text-gold active:bg-gold active:text-white"}`}>{b.status === "pending" ? "✓ 確認" : "↩ 待確認"}</button>
                    <button onClick={async () => { if (confirm("確定刪除？")) { await fetch("/api/bookings", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: b.id }) }); fetchBookings(); fetchStats(); } }}
                      className="py-4 rounded-2xl text-base font-medium border-2 border-red-300 text-red-400 active:bg-red-500 active:text-white">刪除</button>
                  </div>
                </div>
              ))}
            </div>}
          </div>
        </>
      )}

      {view === "customers" && (
        <>
          <SubHeader title="客戶資料" />
          <div className="max-w-lg mx-auto px-5 py-6 text-center">
            <span className="text-text-light text-base block mb-5">{customers.length} 位客戶</span>
            {customers.map((c) => (
              <div key={c.id} className="bg-white rounded-2xl p-6 border border-gold-light/20 text-center mb-4">
                <p className="font-bold text-dark text-2xl">{c.name}</p>
                <p className="text-text-light text-base mt-1">{c.phone}</p>
                {c.address && <p className="text-text-light text-sm mt-1">{c.address}</p>}
                <div className="grid grid-cols-3 gap-3 my-4">
                  <div className="bg-cream/50 rounded-xl p-3"><p className="text-text-light text-xs mb-1">預約</p><p className="text-dark font-bold text-xl">{c.booking_count}</p></div>
                  <div className="bg-cream/50 rounded-xl p-3"><p className="text-text-light text-xs mb-1">消費</p><p className="text-gold font-bold font-serif-tc">${Number(c.total_spent).toLocaleString()}</p></div>
                  <div className="bg-cream/50 rounded-xl p-3"><p className="text-text-light text-xs mb-1">最近</p><p className="text-dark text-sm">{c.last_visit || "—"}</p></div>
                </div>
                <button onClick={async () => { if (confirm("確定刪除？")) { await fetch("/api/customers", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: c.id }) }); fetchCustomers(); } }}
                  className="w-full py-4 rounded-2xl border-2 border-red-300 text-red-400 text-base active:bg-red-500 active:text-white">刪除</button>
              </div>
            ))}
          </div>
        </>
      )}

      {view === "coupons" && (
        <>
          <SubHeader title="優惠券管理" />
          <div className="max-w-lg mx-auto px-5 py-6 text-center space-y-5">
            <div className="bg-white rounded-2xl p-6 border border-gold-light/20 space-y-4">
              <p className="text-gold text-sm font-medium">建立優惠券</p>
              <input value={newCoupon.code} onChange={e => setNewCoupon({...newCoupon, code: e.target.value})} placeholder="優惠碼" className="w-full px-5 py-4 rounded-2xl border border-gold-light/30 text-base text-center focus:outline-none focus:border-gold" />
              <input type="number" value={newCoupon.discount_value} onChange={e => setNewCoupon({...newCoupon, discount_value: Number(e.target.value)})} placeholder="折扣 %" className="w-full px-5 py-4 rounded-2xl border border-gold-light/30 text-base text-center focus:outline-none focus:border-gold" />
              <input value={newCoupon.description} onChange={e => setNewCoupon({...newCoupon, description: e.target.value})} placeholder="說明" className="w-full px-5 py-4 rounded-2xl border border-gold-light/30 text-base text-center focus:outline-none focus:border-gold" />
              <button onClick={async () => { if (!newCoupon.code) return; await fetch("/api/coupons", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newCoupon) }); setNewCoupon({ code: "", discount_value: 15, description: "", max_uses: 100, expires_at: "" }); fetchCoupons(); }}
                className="w-full bg-gold text-white py-5 rounded-2xl text-lg font-medium active:bg-dark-light">建立</button>
            </div>
            {coupons.map((c) => (
              <div key={String(c.id)} className="bg-white rounded-2xl p-5 border border-gold-light/20">
                <p className="text-gold font-bold text-xl">{String(c.code)}</p>
                <p className="text-dark text-base mt-1">{String(c.description)}</p>
                <p className="text-text-light text-sm mt-1">折扣 {String(c.discount_value)}%</p>
                <button onClick={async () => { if (confirm("刪除？")) { await fetch("/api/coupons", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: c.id }) }); fetchCoupons(); } }}
                  className="mt-3 w-full py-3 rounded-2xl border-2 border-red-300 text-red-400 text-base active:bg-red-500 active:text-white">刪除</button>
              </div>
            ))}
          </div>
        </>
      )}

      {view === "referrals" && (
        <>
          <SubHeader title="推薦好友" />
          <div className="max-w-lg mx-auto px-5 py-6 text-center space-y-5">
            {referrals.length === 0 ? <p className="text-text-light py-10 text-lg">目前沒有推薦紀錄</p> :
            referrals.map((r) => (
              <div key={String(r.id)} className="bg-white rounded-2xl p-5 border border-gold-light/20">
                <p className="text-dark font-bold text-lg">推薦人：{String(r.referrer_name || r.referrer_phone)}</p>
                <p className="text-gold text-base mt-2">→ {String(r.referred_name || r.referred_phone)}</p>
                <span className={`inline-block mt-2 text-sm px-4 py-1.5 rounded-full ${r.reward_claimed ? "bg-green-100 text-green-700" : "bg-gold/10 text-gold"}`}>{r.reward_claimed ? "已發放" : "待發放"}</span>
                {!r.reward_claimed && <button onClick={async () => { await fetch("/api/referrals", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: r.id }) }); fetchReferrals(); }}
                  className="mt-3 w-full py-4 rounded-2xl border-2 border-green-500 text-green-600 text-base active:bg-green-500 active:text-white">標記已發放</button>}
              </div>
            ))}
          </div>
        </>
      )}

      {view === "new-booking" && (
        <>
          <SubHeader title="手動建立預約" />
          <div className="max-w-lg mx-auto px-5 py-6">
            <div className="bg-white rounded-2xl p-6 border border-gold-light/20 text-center space-y-5">
              <input value={nb.name} onChange={e => setNb({...nb, name: e.target.value})} placeholder="姓名" className="w-full px-5 py-4 rounded-2xl border border-gold-light/30 text-base text-center focus:outline-none focus:border-gold" />
              <input value={nb.phone} onChange={e => setNb({...nb, phone: e.target.value})} placeholder="電話" className="w-full px-5 py-4 rounded-2xl border border-gold-light/30 text-base text-center focus:outline-none focus:border-gold" />
              <input value={nb.address} onChange={e => setNb({...nb, address: e.target.value})} placeholder="到府地址" className="w-full px-5 py-4 rounded-2xl border border-gold-light/30 text-base text-center focus:outline-none focus:border-gold" />
              <select value={nb.package} onChange={e => { const p = e.target.value; const t = p === "舒壓放鬆套餐" ? 2280 : p === "能量煥膚套餐" ? 3480 : 4880; setNb({...nb, package: p, total: t}); }}
                className="w-full px-5 py-4 rounded-2xl border border-gold-light/30 text-base text-center focus:outline-none focus:border-gold bg-white appearance-none">
                <option>舒壓放鬆套餐</option><option>能量煥膚套餐</option><option>極致寵愛套餐</option>
              </select>
              <div className="grid grid-cols-2 gap-4">
                <input type="date" value={nb.date} onChange={e => setNb({...nb, date: e.target.value})} className="px-4 py-4 rounded-2xl border border-gold-light/30 text-base text-center focus:outline-none focus:border-gold" />
                <select value={nb.time} onChange={e => setNb({...nb, time: e.target.value})} className="px-4 py-4 rounded-2xl border border-gold-light/30 text-base text-center focus:outline-none focus:border-gold bg-white appearance-none">
                  {["10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00"].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <input type="number" value={nb.total} onChange={e => setNb({...nb, total: Number(e.target.value)})} placeholder="金額" className="w-full px-5 py-4 rounded-2xl border border-gold-light/30 text-base text-center focus:outline-none focus:border-gold" />
              <button onClick={async () => {
                if (!nb.name || !nb.phone || !nb.date) return;
                await fetch("/api/bookings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ package: nb.package, packageTier: "", addons: [], date: nb.date, time: nb.time, name: nb.name, phone: nb.phone, total: nb.total, address: nb.address, source: "manual" }) });
                await fetch("/api/customers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: nb.name, phone: nb.phone, address: nb.address }) });
                alert("預約已建立！"); setNb({ name: "", phone: "", address: "", package: "舒壓放鬆套餐", date: "", time: "10:00", total: 2280 }); fetchBookings(); fetchCustomers(); fetchStats(); setView("bookings");
              }} className="w-full bg-gold text-white py-5 rounded-2xl text-lg font-medium active:bg-dark-light">建立預約</button>
            </div>
          </div>
        </>
      )}

      {view === "new-customer" && (
        <>
          <SubHeader title="新增客戶" />
          <div className="max-w-lg mx-auto px-5 py-6">
            <div className="bg-white rounded-2xl p-6 border border-gold-light/20 text-center space-y-5">
              <input value={nc.name} onChange={e => setNc({...nc, name: e.target.value})} placeholder="姓名" className="w-full px-5 py-4 rounded-2xl border border-gold-light/30 text-base text-center focus:outline-none focus:border-gold" />
              <input value={nc.phone} onChange={e => setNc({...nc, phone: e.target.value})} placeholder="電話" className="w-full px-5 py-4 rounded-2xl border border-gold-light/30 text-base text-center focus:outline-none focus:border-gold" />
              <input value={nc.address} onChange={e => setNc({...nc, address: e.target.value})} placeholder="地址" className="w-full px-5 py-4 rounded-2xl border border-gold-light/30 text-base text-center focus:outline-none focus:border-gold" />
              <textarea value={nc.notes} onChange={e => setNc({...nc, notes: e.target.value})} rows={3} placeholder="備註（膚質、過敏等）" className="w-full px-5 py-4 rounded-2xl border border-gold-light/30 text-base text-center focus:outline-none focus:border-gold resize-none" />
              <button onClick={async () => {
                if (!nc.name || !nc.phone) return;
                await fetch("/api/customers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(nc) });
                alert("客戶已建立！"); setNc({ name: "", phone: "", address: "", notes: "" }); fetchCustomers(); setView("customers");
              }} className="w-full bg-gold text-white py-5 rounded-2xl text-lg font-medium active:bg-dark-light">新增客戶</button>
            </div>
          </div>
        </>
      )}

      {view === "service-record" && (
        <>
          <SubHeader title="新增服務紀錄" />
          <div className="max-w-lg mx-auto px-5 py-6">
            <div className="bg-white rounded-2xl p-6 border border-gold-light/20 text-center space-y-5">
              <input value={newRecord.customer_name} onChange={e => setNewRecord({...newRecord, customer_name: e.target.value})} placeholder="客戶姓名" className="w-full px-5 py-4 rounded-2xl border border-gold-light/30 text-base text-center focus:outline-none focus:border-gold" />
              <input value={newRecord.customer_phone} onChange={e => setNewRecord({...newRecord, customer_phone: e.target.value})} placeholder="客戶電話" className="w-full px-5 py-4 rounded-2xl border border-gold-light/30 text-base text-center focus:outline-none focus:border-gold" />
              <input type="date" value={newRecord.service_date} onChange={e => setNewRecord({...newRecord, service_date: e.target.value})} className="w-full px-5 py-4 rounded-2xl border border-gold-light/30 text-base text-center focus:outline-none focus:border-gold" />
              <select value={newRecord.package} onChange={e => setNewRecord({...newRecord, package: e.target.value})} className="w-full px-5 py-4 rounded-2xl border border-gold-light/30 text-base text-center focus:outline-none focus:border-gold bg-white appearance-none">
                <option value="">選擇套餐</option><option>舒壓放鬆套餐</option><option>能量煥膚套餐</option><option>極致寵愛套餐</option>
              </select>
              <textarea value={newRecord.products_used} onChange={e => setNewRecord({...newRecord, products_used: e.target.value})} rows={2} placeholder="使用產品" className="w-full px-5 py-4 rounded-2xl border border-gold-light/30 text-base text-center focus:outline-none focus:border-gold resize-none" />
              <textarea value={newRecord.techniques} onChange={e => setNewRecord({...newRecord, techniques: e.target.value})} rows={2} placeholder="手法備註" className="w-full px-5 py-4 rounded-2xl border border-gold-light/30 text-base text-center focus:outline-none focus:border-gold resize-none" />
              <textarea value={newRecord.skin_condition} onChange={e => setNewRecord({...newRecord, skin_condition: e.target.value})} rows={2} placeholder="膚況紀錄" className="w-full px-5 py-4 rounded-2xl border border-gold-light/30 text-base text-center focus:outline-none focus:border-gold resize-none" />
              <button onClick={async () => {
                if (!newRecord.customer_phone) return;
                await fetch("/api/service-records", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newRecord) });
                alert("紀錄已建立！"); setNewRecord({ customer_phone: "", customer_name: "", service_date: "", package: "", products_used: "", techniques: "", skin_condition: "", notes: "" });
              }} className="w-full bg-gold text-white py-5 rounded-2xl text-lg font-medium active:bg-dark-light">建立紀錄</button>
            </div>
          </div>
        </>
      )}

      {view === "schedule" && (
        <>
          <button onClick={() => setView("home")} className="text-gold text-sm mb-4">&larr; 返回</button>
          <div className="bg-white rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-bold text-dark">排程管理</h2>
            <p className="text-text-light text-sm">關閉預約時段。行事曆的私人行程也會自動封鎖對應時段。</p>
            <div className="border border-gold-light/30 rounded-xl p-4 space-y-3">
              <p className="font-medium text-dark">新增封鎖</p>
              <div className="flex gap-2">
                <input type="date" value={blockForm.startDate} onChange={e => setBlockForm({...blockForm, startDate: e.target.value})} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                <span className="self-center text-text-light">~</span>
                <input type="date" value={blockForm.endDate} onChange={e => setBlockForm({...blockForm, endDate: e.target.value})} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              </div>
              <select value={blockForm.time} onChange={e => setBlockForm({...blockForm, time: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option value="all">整天關閉</option>
                {["10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00"].map(t => <option key={t} value={t}>{t} 該時段</option>)}
              </select>
              <input value={blockForm.reason} onChange={e => setBlockForm({...blockForm, reason: e.target.value})} placeholder="原因（選填）" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              <button onClick={async () => {
                if (!blockForm.startDate) return alert("請選擇日期");
                const dates: string[] = [];
                const start = new Date(blockForm.startDate);
                const end = blockForm.endDate ? new Date(blockForm.endDate) : start;
                for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                  dates.push(d.toISOString().slice(0, 10));
                }
                await fetch("/api/calendar", { method: "POST", headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ action: "block_dates", dates, time: blockForm.time, reason: blockForm.reason }) });
                setBlockForm({ startDate: "", endDate: "", time: "all", reason: "" });
                fetchBlockedDates();
                alert("已封鎖！");
              }} className="w-full bg-red-500 text-white py-3 rounded-xl font-medium">封鎖時段</button>
            </div>
            <div>
              <p className="font-medium text-dark mb-2">已封鎖的時段</p>
              {blockedDates.length === 0 ? <p className="text-text-light text-sm">目前沒有手動封鎖的時段</p> : (
                <div className="space-y-2">
                  {blockedDates.map((bd: Record<string, unknown>) => (
                    <div key={String(bd.id)} className="flex items-center justify-between bg-red-50 px-4 py-3 rounded-xl">
                      <div>
                        <span className="font-medium text-dark">{String(bd.date)}</span>
                        <span className="text-text-light ml-2">{bd.time === "all" ? "整天" : String(bd.time)}</span>
                        {bd.reason ? <span className="text-text-light ml-2 text-sm">({String(bd.reason)})</span> : null}
                      </div>
                      <button onClick={async () => {
                        await fetch("/api/calendar", { method: "POST", headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ action: "unblock_date", id: bd.id }) });
                        fetchBlockedDates();
                      }} className="text-red-500 text-sm font-medium">解除</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {view === "notifications" && (
        <>
          <button onClick={() => setView("home")} className="text-gold text-sm mb-4">&larr; 返回</button>
          <div className="bg-white rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-dark">通知中心</h2>
              {notifCount > 0 && <button onClick={async () => {
                await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ readAll: true }) });
                fetchNotifications();
              }} className="text-gold text-sm">全部已讀</button>}
            </div>
            {notifications.length === 0 ? <p className="text-text-light text-sm text-center py-8">暫無通知</p> : (
              <div className="space-y-2">
                {notifications.map((n: Record<string, unknown>) => (
                  <div key={String(n.id)} className={`px-4 py-3 rounded-xl border ${n.read ? "bg-gray-50 border-gray-100" : "bg-amber-50 border-amber-200"}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${n.type === "conflict" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>{n.type === "conflict" ? "衝突" : String(n.type)}</span>
                        <p className="text-dark text-sm mt-1">{String(n.message)}</p>
                        <p className="text-text-light text-xs mt-1">{String(n.created_at).slice(0, 16)}</p>
                      </div>
                      {!n.read && <span className="w-2 h-2 bg-red-500 rounded-full mt-1 flex-shrink-0"></span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
