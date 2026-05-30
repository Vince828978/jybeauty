"use client";
import { useState, useEffect, useRef } from "react";

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
  // 冠 #4310 2026-05-29: 預約改成可勾選多項 (服務 + 套餐) + 時間切成時 / 分
  const [nb, setNb] = useState<{
    name: string; phone: string; address: string;
    selected: { kind: "service" | "package"; id: number; name: string; price: number; duration: number }[];
    date: string; hour: string; minute: string; total: number;
  }>({ name: "", phone: "", address: "", selected: [], date: "", hour: "10", minute: "00", total: 0 });
  const [nc, setNc] = useState({ name: "", phone: "", address: "", notes: "" });
  const [notifCount, setNotifCount] = useState(0);
  const [notifications, setNotifications] = useState<Record<string, unknown>[]>([]);
  const [blockedDates, setBlockedDates] = useState<Record<string, unknown>[]>([]);
  const [blockForm, setBlockForm] = useState({ startDate: "", endDate: "", mode: "all" as "all" | "range", startTime: "14:00", endTime: "16:00", reason: "" });
  const [dbPackages, setDbPackages] = useState<{ id: number; name: string; package_price: number; duration_min?: number; is_active: boolean }[]>([]);
  const [dbServices, setDbServices] = useState<{ id: number; name: string; price: number; duration_min: number; category?: string; is_active: boolean }[]>([]);

  const fetchBookings = async () => { const r = await fetch("/api/bookings"); const d = await r.json(); setBookings(d.bookings || []); setLoading(false); };
  const fetchCustomers = async () => { const r = await fetch("/api/customers"); const d = await r.json(); setCustomers(d.customers || []); };
  const fetchStats = async () => { const r = await fetch("/api/stats"); const d = await r.json(); setStats(d); };
  const fetchCoupons = async () => { const r = await fetch("/api/coupons"); const d = await r.json(); setCoupons(d.coupons || []); };
  const fetchReferrals = async () => { const r = await fetch("/api/referrals"); const d = await r.json(); setReferrals(d.referrals || []); };
  const fetchNotifications = async () => { const r = await fetch("/api/notifications"); const d = await r.json(); setNotifCount(d.unreadCount || 0); setNotifications(d.notifications || []); };
  const fetchBlockedDates = async () => { const r = await fetch("/api/blocked-dates"); const d = await r.json(); setBlockedDates(d.blockedDates || []); };
  const fetchDbPackages = async () => { try { const r = await fetch("/api/packages"); const d = await r.json(); setDbPackages((d.packages || []).filter((p: { is_active: boolean }) => p.is_active)); } catch { /* ignore */ } };
  const fetchDbServices = async () => { try { const r = await fetch("/api/services"); const d = await r.json(); setDbServices((d.services || []).filter((s: { is_active: boolean }) => s.is_active)); } catch { /* ignore */ } };

  useEffect(() => { if (typeof window !== "undefined" && sessionStorage.getItem("jyb-admin") === "1") setAuthed(true); }, []);
  const refreshAll = async () => {
    await Promise.all([fetchBookings(), fetchCustomers(), fetchStats(), fetchCoupons(), fetchReferrals(), fetchNotifications(), fetchBlockedDates(), fetchDbPackages(), fetchDbServices()]);
  };
  useEffect(() => { if (authed) { refreshAll(); } /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [authed]);
  useEffect(() => { if (authed) { const iv = setInterval(fetchNotifications, 30000); return () => clearInterval(iv); } }, [authed]);

  // 冠 #4312 2026-05-29: 下拉刷新 (pull-to-refresh) — 任何頁面在頂部下拉都會觸發 refreshAll
  const [pullDelta, setPullDelta] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const pullStartYRef = useRef<number | null>(null);
  const pullDeltaRef = useRef(0);
  const refreshingRef = useRef(false);
  useEffect(() => {
    if (!authed) return;
    const onTS = (e: TouchEvent) => {
      if ((document.scrollingElement?.scrollTop ?? window.scrollY) <= 0) {
        pullStartYRef.current = e.touches[0].clientY;
      } else {
        pullStartYRef.current = null;
      }
    };
    const onTM = (e: TouchEvent) => {
      if (pullStartYRef.current === null || refreshingRef.current) return;
      const d = e.touches[0].clientY - pullStartYRef.current;
      if (d > 0) {
        const clamped = Math.min(d * 0.5, 100);
        pullDeltaRef.current = clamped;
        setPullDelta(clamped);
        if (d > 30) e.preventDefault();
      }
    };
    const onTE = async () => {
      if (pullStartYRef.current === null) return;
      pullStartYRef.current = null;
      if (pullDeltaRef.current > 60 && !refreshingRef.current) {
        refreshingRef.current = true; setRefreshing(true);
        try { await refreshAll(); } finally {
          setTimeout(() => { refreshingRef.current = false; setRefreshing(false); pullDeltaRef.current = 0; setPullDelta(0); }, 400);
        }
      } else {
        pullDeltaRef.current = 0; setPullDelta(0);
      }
    };
    window.addEventListener("touchstart", onTS, { passive: true });
    window.addEventListener("touchmove", onTM, { passive: false });
    window.addEventListener("touchend", onTE);
    window.addEventListener("touchcancel", onTE);
    return () => {
      window.removeEventListener("touchstart", onTS);
      window.removeEventListener("touchmove", onTM);
      window.removeEventListener("touchend", onTE);
      window.removeEventListener("touchcancel", onTE);
    };
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [authed]);

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{background:"linear-gradient(180deg, #FFF0F0 0%, #FFF8F6 30%, #FFFBFA 100%)"}}>
        <div className="relative w-full max-w-sm">
          {/* 裝飾圓點 — 跟首頁同款 */}
          <div className="absolute -top-10 -right-6" style={{width:120,height:120,borderRadius:"50%",background:"linear-gradient(135deg, #FECDD3, #FDA4AF, #FB7185)",opacity:0.4}} />
          <div className="absolute -bottom-8 -left-8" style={{width:96,height:96,borderRadius:"50%",background:"linear-gradient(135deg, #FB7185, #FDA4AF)",opacity:0.3}} />
          <div className="bg-white rounded-[28px] p-10 text-center shadow-lg border border-rose-100 relative">
            <p className="font-serif-tc text-3xl font-bold text-dark mb-2"><span className="text-rose-500">JY</span> Beauty</p>
            <p className="text-text-light text-base mb-8">後台管理登入</p>
            <input type="password" value={pass} onChange={(e) => setPass(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && pass === ADMIN_PASS) { sessionStorage.setItem("jyb-admin", "1"); setAuthed(true); } }}
              placeholder="請輸入管理密碼"
              className="w-full px-6 py-5 rounded-2xl border-2 border-rose-100 bg-white text-dark text-center text-xl focus:outline-none focus:border-rose-300 mb-5" />
            <button onClick={() => { if (pass === ADMIN_PASS) { sessionStorage.setItem("jyb-admin", "1"); setAuthed(true); } }}
              className="w-full text-white py-5 rounded-2xl text-lg font-bold tracking-wide shadow-md active:opacity-90"
              style={{background:"linear-gradient(135deg, #FB7185, #FDA4AF)"}}>登入</button>
          </div>
        </div>
      </div>
    );
  }

  const s = stats as Record<string, Record<string, number>>;

  // 冠 #4312: 下拉刷新指示器，固定貼頂
  const pullIndicator = (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none flex justify-center"
         style={{ transform: `translateY(${refreshing ? 30 : Math.max(0, pullDelta - 20)}px)`, transition: refreshing ? "transform 200ms ease" : (pullDelta === 0 ? "transform 200ms ease" : "none"), opacity: pullDelta > 5 || refreshing ? 1 : 0 }}>
      <div className="bg-white rounded-full shadow-md px-5 py-2 text-sm text-rose-500 font-semibold border border-rose-100">
        {refreshing ? "🔄 重新整理中..." : pullDelta > 60 ? "↑ 放開以更新" : "↓ 下拉更新"}
      </div>
    </div>
  );

  // Home view — #3 柔粉色系（圓形元素+留白+柔和圓角）
  if (view === "home") {
    const pending = Number((stats as Record<string, number>).pending || 0);
    const followUp = Number((stats as Record<string, number>).needFollowUp || 0);
    const revenue = Number(s.month?.revenue || 0);
    return (
      <div className="min-h-screen pb-44" style={{background:"linear-gradient(180deg, #FFF0F0 0%, #FFF8F6 30%, #FFFBFA 100%)"}}>
        {pullIndicator}
        {/* Header — 恢復裝飾圓 */}
        <div className="relative overflow-hidden" style={{background:"linear-gradient(135deg, #FECDD3, #FDA4AF, #FB7185)", borderRadius:"0 0 40px 40px", padding:"44px 24px 36px"}}>
          <div className="absolute" style={{top:-30,right:-30,width:120,height:120,borderRadius:"50%",background:"rgba(255,255,255,0.12)"}} />
          <div className="absolute" style={{bottom:-20,left:-20,width:80,height:80,borderRadius:"50%",background:"rgba(255,255,255,0.08)"}} />
          <div className="max-w-lg mx-auto relative">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white/80 text-sm">Hello</p>
                <p className="font-serif-tc text-2xl font-bold text-white">JY Beauty</p>
              </div>
              <button onClick={() => setView("notifications")} className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center relative">
                <span className="text-sm font-bold text-white">通知</span>
                {notifCount > 0 && <span className="absolute -top-1 -right-1 bg-white text-rose-500 text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">{notifCount}</span>}
              </button>
            </div>
            <div className="text-center">
              <p className="text-white/80 text-xs">本月營收</p>
              <p className="text-white font-bold font-serif-tc text-3xl">${revenue.toLocaleString()}</p>
              <p className="text-white/60 text-xs">{Number(s.month?.count || 0)} 筆預約</p>
            </div>
          </div>
        </div>

        <div className="max-w-lg mx-auto px-4 mt-4">
          {/* 快速操作 — 加大觸控區 */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            {[
              { key: "new-booking" as View, label: "接單" },
              { key: "schedule" as View, label: "排程" },
              { key: "new-customer" as View, label: "新客" },
              { key: "service-record" as View, label: "紀錄" },
            ].map(a => (
              <button key={a.key} onClick={() => setView(a.key)} className="bg-white rounded-2xl py-5 text-center active:scale-95 transition-transform shadow-sm min-h-[60px]">
                <span className="text-dark font-bold text-base">{a.label}</span>
              </button>
            ))}
          </div>

          {/* 數據概覽 — 加大圓形 */}
          <div className="flex justify-around mb-4">
            {[
              { key: "customers" as View, val: customers.length, label: "客戶", color: "#FDA4AF" },
              { key: "bookings" as View, val: bookings.length, label: "預約", color: "#FB7185", badge: pending },
              { key: "stats" as View, val: followUp, label: "待回訪", color: "#FECDD3" },
            ].map(d => (
              <button key={d.key} onClick={() => setView(d.key)} className="flex flex-col items-center active:scale-95 transition-transform relative">
                <div className="w-24 h-24 rounded-full bg-white shadow-sm flex flex-col items-center justify-center" style={{border:`2px solid ${d.color}`}}>
                  <p className="text-dark font-bold text-xl">{d.val}</p>
                  <p className="text-text-light text-[10px]">{d.label}</p>
                </div>
                {d.badge ? <span className="absolute -top-1 right-1 bg-rose-500 text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center">{d.badge}</span> : null}
              </button>
            ))}
          </div>

          {/* 功能列表 — 左右兩欄格子 */}
          <p className="text-rose-300 text-xs font-medium tracking-wider mb-3 px-1">管理功能</p>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { key: "stats" as View, label: "營收報表", desc: "今日/月/累計" },
              { key: "bookings" as View, label: "預約管理", desc: `${bookings.length} 筆預約` },
              { key: "customers" as View, label: "客戶資料", desc: `${customers.length} 位客戶` },
              { key: "coupons" as View, label: "優惠券", desc: `${coupons.length} 張` },
              { key: "referrals" as View, label: "推薦紀錄", desc: `${referrals.length} 筆` },
              { key: "schedule" as View, label: "排程管理", desc: "時段開放/關閉" },
              { key: "notifications" as View, label: "通知中心", desc: notifCount > 0 ? `${notifCount} 則未讀` : "暫無" },
            ].map((item) => (
              <button key={item.key} onClick={() => setView(item.key)}
                className="bg-white rounded-2xl px-4 py-6 text-center active:scale-[0.96] transition-transform shadow-sm min-h-[80px] flex flex-col items-center justify-center">
                <p className="text-dark font-bold text-base">{item.label}</p>
                <p className="text-text-light text-xs mt-1">{item.desc}</p>
              </button>
            ))}
            <a href="/admin/services"
              className="bg-white rounded-2xl px-4 py-6 text-center active:scale-[0.96] transition-transform shadow-sm min-h-[80px] flex flex-col items-center justify-center">
              <p className="text-dark font-bold text-base">服務與套餐</p>
              <p className="text-text-light text-xs mt-1">管理服務項目</p>
            </a>
          </div>
        </div>

        {/* Bottom Tab Bar — 加大觸控區 */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-rose-100/30 safe-area-pb z-50" style={{borderRadius:"20px 20px 0 0"}}>
          <div className="max-w-lg mx-auto flex justify-around py-2">
            {[
              { key: "home" as View, label: "首頁" },
              { key: "bookings" as View, label: "預約" },
              { key: "customers" as View, label: "客戶" },
              { key: "stats" as View, label: "更多" },
            ].map(tab => (
              <button key={tab.key} onClick={() => setView(tab.key)}
                className={`flex-1 flex flex-col items-center justify-center py-4 min-h-[64px] rounded-xl mx-1 active:bg-rose-50 transition-colors ${view === tab.key ? "text-rose-500 bg-rose-50/50 font-bold" : "text-text-light"}`}>
                <span className="text-base font-semibold">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Sub-page header with back button
  const SubHeader = ({ title }: { title: string }) => (
    <div className="relative overflow-hidden" style={{background:"linear-gradient(135deg, #FECDD3, #FDA4AF, #FB7185)", borderRadius:"0 0 32px 32px", padding:"24px 24px 24px"}}>
      <div className="absolute" style={{top:-30,right:-30,width:100,height:100,borderRadius:"50%",background:"rgba(255,255,255,0.12)"}} />
      <div className="absolute" style={{bottom:-15,left:-15,width:64,height:64,borderRadius:"50%",background:"rgba(255,255,255,0.08)"}} />
      <div className="max-w-lg mx-auto flex items-center relative">
        <button onClick={() => setView("home")} className="w-12 h-12 flex items-center justify-center rounded-full bg-white/20 active:bg-white/30">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <p className="flex-1 font-serif-tc text-xl font-bold text-white text-center pr-12">{title}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-rose-50/30 to-white">
      {pullIndicator}
      {view === "stats" && (
        <>
          <SubHeader title="營收報表" />
          {/* 冠 #4459 2026-05-30: 拉開容器寬度 + 卡片內距加大、字級加大、間距增加 */}
          <div className="max-w-2xl mx-auto px-6 py-8 text-center space-y-6">
            <div className="grid grid-cols-2 gap-5">
              <div className="bg-white rounded-2xl p-7 border border-rose-100/60 shadow-sm"><p className="text-text-light text-base mb-2">今日營收</p><p className="text-rose-500 font-bold font-serif-tc text-3xl">${Number(s.today?.revenue || 0).toLocaleString()}</p><p className="text-text-light text-sm mt-1">{Number(s.today?.count || 0)} 筆</p></div>
              <div className="bg-white rounded-2xl p-7 border border-rose-100/60 shadow-sm"><p className="text-text-light text-base mb-2">本月營收</p><p className="text-rose-500 font-bold font-serif-tc text-3xl">${Number(s.month?.revenue || 0).toLocaleString()}</p><p className="text-text-light text-sm mt-1">{Number(s.month?.count || 0)} 筆</p></div>
              <div className="bg-white rounded-2xl p-7 border border-rose-100/60 shadow-sm"><p className="text-text-light text-base mb-2">累計營收</p><p className="text-rose-500 font-bold font-serif-tc text-3xl">${Number(s.total?.revenue || 0).toLocaleString()}</p><p className="text-text-light text-sm mt-1">{Number(s.total?.count || 0)} 筆</p></div>
              <div className="bg-white rounded-2xl p-7 border border-rose-100/60 shadow-sm"><p className="text-text-light text-base mb-2">待確認</p><p className="text-dark font-bold text-3xl">{Number((stats as Record<string, number>).pending || 0)}</p><p className="text-text-light text-sm mt-1">筆預約</p></div>
            </div>
            <div className="bg-white rounded-2xl p-7 border border-rose-100/60 shadow-sm"><p className="text-text-light text-base mb-2">熱門套餐</p><p className="text-dark font-bold text-xl">{String((stats as Record<string, string>).popularPackage || "—")}</p></div>
            <div className="bg-white rounded-2xl p-7 border border-rose-100/60 shadow-sm"><p className="text-text-light text-base mb-2">需回訪提醒</p><p className="text-dark font-bold text-3xl">{Number((stats as Record<string, number>).needFollowUp || 0)} 位客戶</p><p className="text-text-light text-sm mt-1">超過 30 天未到訪</p></div>
            <div className="bg-white rounded-2xl p-7 border border-rose-100/60 text-left mt-2 shadow-sm">
              <p className="text-text-light text-base mb-4 text-center">客戶分析</p>
              <div className="space-y-3 text-base">
                <div className="flex justify-between py-1"><span className="text-text-light">總客戶數</span><span className="text-dark font-bold">{customers.length} 位</span></div>
                <div className="flex justify-between py-1"><span className="text-text-light">本月新客</span><span className="text-dark font-bold">{customers.filter(c => c.created_at && c.created_at.startsWith(new Date().toISOString().slice(0,7))).length} 位</span></div>
                <div className="flex justify-between py-1"><span className="text-text-light">本月預約數</span><span className="text-dark font-bold">{Number(s.month?.count || 0)} 筆</span></div>
                <div className="flex justify-between py-1"><span className="text-text-light">平均客單價</span><span className="text-rose-500 font-bold">${Number(s.month?.count || 0) > 0 ? Math.round(Number(s.month?.revenue || 0) / Number(s.month?.count || 1)).toLocaleString() : "—"}</span></div>
                <div className="flex justify-between py-1"><span className="text-text-light">優惠券使用</span><span className="text-dark font-bold">{coupons.filter((c: Record<string, unknown>) => Number(c.used_count || 0) > 0).length} / {coupons.length} 張</span></div>
                <div className="flex justify-between py-1"><span className="text-text-light">推薦紀錄</span><span className="text-dark font-bold">{referrals.length} 筆</span></div>
              </div>
            </div>
            <button onClick={fetchStats} className="w-full py-5 rounded-2xl border-2 border-rose-400 text-rose-500 text-lg font-medium active:bg-rose-500 active:text-white">重新整理</button>
          </div>
        </>
      )}

      {view === "bookings" && (
        <>
          <SubHeader title="預約管理" />
          <div className="max-w-lg mx-auto px-5 py-6 text-center">
            <div className="flex justify-between items-center mb-5">
              <span className="text-text-light text-base">{bookings.length} 筆預約</span>
              <button onClick={fetchBookings} className="text-rose-500 text-sm border-2 border-rose-400 px-5 py-2 rounded-full">重新整理</button>
            </div>
            {loading ? <p className="text-text-light py-16 text-lg">載入中...</p> :
            bookings.length === 0 ? <p className="text-text-light py-16 text-lg">目前沒有預約</p> :
            <div className="space-y-5">
              {bookings.map((b) => (
                <div key={b.id} className="bg-white rounded-2xl p-6 border border-rose-100/60 text-center">
                  <span className={`inline-block text-sm px-4 py-1.5 rounded-full mb-3 ${b.status === "pending" ? "bg-rose-500/10 text-rose-500" : "bg-green-100 text-green-700"}`}>{b.status === "pending" ? "待確認" : "已確認"}</span>
                  {b.source === "manual" && <span className="inline-block text-sm px-3 py-1 rounded-full bg-blue-50 text-blue-500 ml-2">手動</span>}
                  <p className="font-bold text-dark text-2xl mt-2">{b.name}</p>
                  <p className="text-text-light text-base mt-1">{b.phone}</p>
                  {b.address && <p className="text-text-light text-sm mt-1">{b.address}</p>}
                  <div className="grid grid-cols-2 gap-4 my-5">
                    <div className="bg-rose-50/70 rounded-2xl p-5"><p className="text-text-light text-sm mb-2">套餐</p><p className="text-dark font-medium text-base">{b.package}</p></div>
                    <div className="bg-rose-50/70 rounded-2xl p-5"><p className="text-text-light text-sm mb-2">金額</p><p className="text-rose-500 font-bold font-serif-tc text-2xl">${b.total?.toLocaleString()}</p></div>
                    <div className="bg-rose-50/70 rounded-2xl p-5"><p className="text-text-light text-sm mb-2">日期</p><p className="text-dark font-medium text-base">{b.date}</p></div>
                    <div className="bg-rose-50/70 rounded-2xl p-5"><p className="text-text-light text-sm mb-2">時段</p><p className="text-dark font-medium text-base">{b.time}</p></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={async () => { await fetch("/api/bookings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: b.id, status: b.status === "pending" ? "confirmed" : "pending" }) }); fetchBookings(); fetchStats(); }}
                      className={`py-4 rounded-2xl text-base font-medium border-2 ${b.status === "pending" ? "border-green-500 text-green-600 active:bg-green-500 active:text-white" : "border-rose-400 text-rose-500 active:bg-rose-500 active:text-white"}`}>{b.status === "pending" ? "✓ 確認" : "↩ 待確認"}</button>
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
              <div key={c.id} className="bg-white rounded-2xl p-6 border border-rose-100/60 text-center mb-4">
                <p className="font-bold text-dark text-2xl">{c.name}</p>
                <p className="text-text-light text-base mt-1">{c.phone}</p>
                {c.address && <p className="text-text-light text-sm mt-1">{c.address}</p>}
                <div className="grid grid-cols-3 gap-3 my-4">
                  <div className="bg-rose-50/70 rounded-2xl p-5"><p className="text-text-light text-sm mb-2">預約</p><p className="text-dark font-bold text-xl">{c.booking_count}</p></div>
                  <div className="bg-rose-50/70 rounded-2xl p-5"><p className="text-text-light text-sm mb-2">消費</p><p className="text-rose-500 font-bold font-serif-tc">${Number(c.total_spent).toLocaleString()}</p></div>
                  <div className="bg-rose-50/70 rounded-2xl p-5"><p className="text-text-light text-sm mb-2">最近</p><p className="text-dark text-sm">{c.last_visit || "—"}</p></div>
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
            {/* 建立+發送優惠券 */}
            <div className="bg-white rounded-2xl p-6 border border-rose-100 space-y-4">
              <p className="text-rose-500 text-sm font-medium">建立並發送優惠券</p>
              {/* 方案選擇 */}
              <select value={newCoupon.description} onChange={e => setNewCoupon({...newCoupon, description: e.target.value})}
                className="w-full px-5 py-5 rounded-xl border border-rose-100 text-base focus:outline-none focus:border-rose-300">
                <option value="">自訂方案</option>
                <option value="全方案 85 折">全方案 85 折</option>
                <option value="精油按摩折 $200">精油按摩折 $200</option>
                <option value="臉部保養折 $300">臉部保養折 $300</option>
                <option value="首次體驗 9 折">首次體驗 9 折</option>
                <option value="生日禮 $500 折抵">生日禮 $500 折抵</option>
                <option value="推薦好友雙方 88 折">推薦好友雙方 88 折</option>
              </select>
              <div className="grid grid-cols-2 gap-3">
                <input value={newCoupon.code} onChange={e => setNewCoupon({...newCoupon, code: e.target.value})} placeholder="優惠碼（自動產生）"
                  className="px-4 py-3 rounded-xl border border-rose-100 text-sm focus:outline-none focus:border-rose-300" />
                <input type="number" value={newCoupon.discount_value} onChange={e => setNewCoupon({...newCoupon, discount_value: Number(e.target.value)})} placeholder="折扣 %"
                  className="px-4 py-3 rounded-xl border border-rose-100 text-sm focus:outline-none focus:border-rose-300" />
              </div>
              {newCoupon.description === "" && <input value={newCoupon.description} onChange={e => setNewCoupon({...newCoupon, description: e.target.value})} placeholder="自訂說明"
                className="w-full px-5 py-5 rounded-xl border border-rose-100 text-base focus:outline-none focus:border-rose-300" />}
              {/* 使用期限 */}
              <div className="flex gap-3">
                <select value={newCoupon.expires_at} onChange={e => {
                  if (e.target.value === "custom") return;
                  setNewCoupon({...newCoupon, expires_at: e.target.value});
                }} className="flex-1 px-4 py-3 rounded-xl border border-rose-100 text-sm focus:outline-none">
                  <option value="">無期限</option>
                  <option value={new Date(Date.now()+7*86400000).toISOString().slice(0,10)}>7 天</option>
                  <option value={new Date(Date.now()+30*86400000).toISOString().slice(0,10)}>30 天</option>
                  <option value={new Date(Date.now()+90*86400000).toISOString().slice(0,10)}>90 天</option>
                  <option value="custom">自訂日期</option>
                </select>
                <input type="date" value={newCoupon.expires_at} onChange={e => setNewCoupon({...newCoupon, expires_at: e.target.value})}
                  className="flex-1 px-4 py-3 rounded-xl border border-rose-100 text-sm focus:outline-none" />
              </div>
              {/* 發送對象 — 會員搜尋+勾選 */}
              <div className="text-left">
                <p className="text-xs text-text-light mb-2">發送對象</p>
                <input id="memberSearch" placeholder="搜尋會員（名字或電話）" onChange={e => {
                  const q = e.target.value.toLowerCase();
                  document.querySelectorAll("[data-member-row]").forEach((el) => {
                    const text = el.getAttribute("data-member-row") || "";
                    (el as HTMLElement).style.display = text.includes(q) ? "flex" : "none";
                  });
                }} className="w-full px-4 py-2 rounded-xl border border-rose-100 text-sm focus:outline-none focus:border-rose-300 mb-2" />
                <div className="flex justify-between mb-2">
                  <label className="text-xs text-rose-400 flex items-center gap-1">
                    <input type="checkbox" id="selectAll" onChange={e => {
                      document.querySelectorAll<HTMLInputElement>("[data-member-cb]").forEach(cb => { cb.checked = e.target.checked; });
                    }} /> 全選
                  </label>
                  <span className="text-xs text-text-light">{customers.length} 位會員</span>
                </div>
                <div className="max-h-40 overflow-y-auto space-y-1 border border-rose-50 rounded-xl p-2">
                  {customers.map((c) => (
                    <div key={c.id} data-member-row={`${c.name}${c.phone}`.toLowerCase()} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-rose-50 text-sm">
                      <input type="checkbox" data-member-cb data-phone={c.phone} defaultChecked={false} />
                      <span className="text-dark">{c.name}</span>
                      <span className="text-text-light text-xs">{c.phone}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* 發送按鈕 */}
              <button onClick={async () => {
                const phones: string[] = [];
                document.querySelectorAll<HTMLInputElement>("[data-member-cb]:checked").forEach(cb => {
                  const ph = cb.getAttribute("data-phone");
                  if (ph) phones.push(ph);
                });
                if (phones.length === 0) return alert("請勾選至少一位會員");
                const code = newCoupon.code || `JYB${Date.now().toString(36).toUpperCase()}`;
                let sent = 0;
                for (const ph of phones) {
                  await fetch("/api/member-coupons", { method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ phone: ph, code, discount_value: newCoupon.discount_value, description: newCoupon.description, expires_at: newCoupon.expires_at || null }) });
                  sent++;
                }
                alert(`已發送 ${sent} 張優惠券！`);
                setNewCoupon({ code: "", discount_value: 15, description: "", max_uses: 100, expires_at: "" });
                fetchCoupons();
              }} className="w-full bg-rose-500 text-white py-4 rounded-2xl text-base font-medium active:bg-rose-600">
                發送優惠券
              </button>
            </div>
            {/* 已建立的優惠券 */}
            {coupons.map((c) => (
              <div key={String(c.id)} className="bg-white rounded-2xl p-5 border border-rose-100">
                <p className="text-rose-500 font-bold text-xl">{String(c.code)}</p>
                <p className="text-dark text-base mt-1">{String(c.description)}</p>
                <p className="text-text-light text-sm mt-1">折扣 {String(c.discount_value)}%</p>
                <button onClick={async () => { if (confirm("刪除？")) { await fetch("/api/coupons", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: c.id }) }); fetchCoupons(); } }}
                  className="mt-3 w-full py-3 rounded-2xl border-2 border-red-200 text-red-400 text-sm active:bg-red-500 active:text-white">刪除</button>
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
              <div key={String(r.id)} className="bg-white rounded-2xl p-5 border border-rose-100/60">
                <p className="text-dark font-bold text-lg">推薦人：{String(r.referrer_name || r.referrer_phone)}</p>
                <p className="text-rose-500 text-base mt-2">→ {String(r.referred_name || r.referred_phone)}</p>
                <span className={`inline-block mt-2 text-sm px-4 py-1.5 rounded-full ${r.reward_claimed ? "bg-green-100 text-green-700" : "bg-rose-500/10 text-rose-500"}`}>{r.reward_claimed ? "已發放" : "待發放"}</span>
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
            <div className="bg-white rounded-2xl p-6 border border-rose-100/60 space-y-6">
              <input value={nb.name} onChange={e => setNb({...nb, name: e.target.value})} placeholder="姓名" className="w-full px-6 py-5 rounded-2xl border border-rose-100 text-lg focus:outline-none focus:border-rose-300" />
              <input value={nb.phone} onChange={e => setNb({...nb, phone: e.target.value})} placeholder="電話" inputMode="tel" className="w-full px-6 py-5 rounded-2xl border border-rose-100 text-lg focus:outline-none focus:border-rose-300" />
              <input value={nb.address} onChange={e => setNb({...nb, address: e.target.value})} placeholder="到府地址" className="w-full px-6 py-5 rounded-2xl border border-rose-100 text-lg focus:outline-none focus:border-rose-300" />

              {/* 冠 #4310: 服務 + 套餐 全部可勾選 */}
              <div>
                <p className="text-sm text-text-light mb-3">勾選服務 / 套餐（可複選）</p>
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {dbPackages.length > 0 && (
                    <div>
                      <p className="text-xs text-rose-500 mb-2 font-semibold tracking-wider">套餐</p>
                      {dbPackages.map(dp => {
                        const sel = nb.selected.some(x => x.kind === "package" && x.id === dp.id);
                        return (
                          <label key={`pkg-${dp.id}`}
                            className={`flex items-center gap-4 px-5 py-4 rounded-2xl border-2 mb-2 cursor-pointer active:bg-rose-500-light/10 ${sel ? "border-rose-400 bg-rose-500-light/20" : "border-rose-100 bg-white"}`}>
                            <input type="checkbox" checked={sel} onChange={() => {
                              const next = sel
                                ? nb.selected.filter(x => !(x.kind === "package" && x.id === dp.id))
                                : [...nb.selected, { kind: "package" as const, id: dp.id, name: dp.name, price: dp.package_price, duration: dp.duration_min || 0 }];
                              const total = next.reduce((s, x) => s + x.price, 0);
                              setNb({ ...nb, selected: next, total });
                            }} className="w-6 h-6 accent-rose-500" />
                            <span className="flex-1">
                              <span className="block text-base font-semibold text-dark">{dp.name}</span>
                              <span className="block text-sm text-text-light">套餐 · ${dp.package_price.toLocaleString()}</span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                  {dbServices.length > 0 && (
                    <div>
                      <p className="text-xs text-rose-500 mb-2 font-semibold tracking-wider">單項服務</p>
                      {dbServices.map(svc => {
                        const sel = nb.selected.some(x => x.kind === "service" && x.id === svc.id);
                        return (
                          <label key={`svc-${svc.id}`}
                            className={`flex items-center gap-4 px-5 py-4 rounded-2xl border-2 mb-2 cursor-pointer active:bg-rose-500-light/10 ${sel ? "border-rose-400 bg-rose-500-light/20" : "border-rose-100 bg-white"}`}>
                            <input type="checkbox" checked={sel} onChange={() => {
                              const next = sel
                                ? nb.selected.filter(x => !(x.kind === "service" && x.id === svc.id))
                                : [...nb.selected, { kind: "service" as const, id: svc.id, name: svc.name, price: svc.price, duration: svc.duration_min }];
                              const total = next.reduce((s, x) => s + x.price, 0);
                              setNb({ ...nb, selected: next, total });
                            }} className="w-6 h-6 accent-rose-500" />
                            <span className="flex-1">
                              <span className="block text-base font-semibold text-dark">{svc.name}</span>
                              <span className="block text-sm text-text-light">{svc.duration_min} 分鐘 · ${svc.price.toLocaleString()}{svc.category ? ` · ${svc.category}` : ""}</span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
                {nb.selected.length > 0 && (
                  <p className="text-sm text-dark mt-3">
                    已選 <b className="text-rose-500">{nb.selected.length}</b> 項 · 共
                    <b className="text-rose-500"> {nb.selected.reduce((s, x) => s + x.duration, 0)}</b> 分鐘
                  </p>
                )}
              </div>

              <div>
                <p className="text-sm text-text-light mb-2">日期</p>
                <input type="date" value={nb.date} onChange={e => setNb({...nb, date: e.target.value})} className="w-full px-6 py-5 rounded-2xl border border-rose-100 text-lg focus:outline-none focus:border-rose-300" />
              </div>

              {/* 冠 #4310: 時間切成「時 / 分」兩個獨立 select，10 分鐘為單位 */}
              <div>
                <p className="text-sm text-text-light mb-2">時間（每 10 分鐘為一格）</p>
                <div className="grid grid-cols-2 gap-3">
                  <select value={nb.hour} onChange={e => setNb({ ...nb, hour: e.target.value })}
                    className="px-6 py-5 rounded-2xl border border-rose-100 text-lg focus:outline-none focus:border-rose-300 bg-white">
                    {Array.from({ length: 11 }, (_, i) => String(10 + i).padStart(2, "0")).map(h => (
                      <option key={h} value={h}>{h} 時</option>
                    ))}
                  </select>
                  <select value={nb.minute} onChange={e => setNb({ ...nb, minute: e.target.value })}
                    className="px-6 py-5 rounded-2xl border border-rose-100 text-lg focus:outline-none focus:border-rose-300 bg-white">
                    {["00","10","20","30","40","50"].map(m => (
                      <option key={m} value={m}>{m} 分</option>
                    ))}
                  </select>
                </div>
                <p className="text-xs text-text-light mt-2 text-center">已選：{nb.hour}:{nb.minute}</p>
              </div>

              <div>
                <p className="text-sm text-text-light mb-2">總金額（自動帶入，可手動調整）</p>
                <input type="number" inputMode="numeric" value={nb.total} onChange={e => setNb({...nb, total: Number(e.target.value)})} placeholder="金額" className="w-full px-6 py-5 rounded-2xl border border-rose-100 text-2xl text-center font-bold text-rose-500 focus:outline-none focus:border-rose-300" />
              </div>

              <button onClick={async () => {
                if (!nb.name || !nb.phone || !nb.date) { alert("姓名 / 電話 / 日期必填"); return; }
                if (nb.selected.length === 0) { alert("請至少勾選一項服務或套餐"); return; }
                const packageStr = nb.selected.map(x => x.name).join(" + ");
                const time = `${nb.hour}:${nb.minute}`;
                const totalDur = nb.selected.reduce((s, x) => s + x.duration, 0);
                await fetch("/api/bookings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ package: packageStr, packageTier: "", addons: [], date: nb.date, time, name: nb.name, phone: nb.phone, total: nb.total, address: nb.address, source: "manual", durationMin: totalDur }) });
                await fetch("/api/customers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: nb.name, phone: nb.phone, address: nb.address }) });
                alert("預約已建立！");
                setNb({ name: "", phone: "", address: "", selected: [], date: "", hour: "10", minute: "00", total: 0 });
                fetchBookings(); fetchCustomers(); fetchStats(); setView("bookings");
              }} className="w-full bg-rose-500 text-white py-6 rounded-2xl text-xl font-bold active:bg-dark-light">建立預約</button>
            </div>
          </div>
        </>
      )}

      {view === "new-customer" && (
        <>
          <SubHeader title="新增客戶" />
          <div className="max-w-lg mx-auto px-5 py-6">
            <div className="bg-white rounded-2xl p-6 border border-rose-100/60 text-center space-y-5">
              <input value={nc.name} onChange={e => setNc({...nc, name: e.target.value})} placeholder="姓名" className="w-full px-5 py-4 rounded-2xl border border-rose-100 text-base text-center focus:outline-none focus:border-rose-300" />
              <input value={nc.phone} onChange={e => setNc({...nc, phone: e.target.value})} placeholder="電話" className="w-full px-5 py-4 rounded-2xl border border-rose-100 text-base text-center focus:outline-none focus:border-rose-300" />
              <input value={nc.address} onChange={e => setNc({...nc, address: e.target.value})} placeholder="地址" className="w-full px-5 py-4 rounded-2xl border border-rose-100 text-base text-center focus:outline-none focus:border-rose-300" />
              <textarea value={nc.notes} onChange={e => setNc({...nc, notes: e.target.value})} rows={3} placeholder="備註（膚質、過敏等）" className="w-full px-5 py-4 rounded-2xl border border-rose-100 text-base text-center focus:outline-none focus:border-rose-300 resize-none" />
              <button onClick={async () => {
                if (!nc.name || !nc.phone) return;
                await fetch("/api/customers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(nc) });
                alert("客戶已建立！"); setNc({ name: "", phone: "", address: "", notes: "" }); fetchCustomers(); setView("customers");
              }} className="w-full bg-rose-500 text-white py-5 rounded-2xl text-lg font-medium active:bg-dark-light">新增客戶</button>
            </div>
          </div>
        </>
      )}

      {view === "service-record" && (
        <>
          <SubHeader title="新增服務紀錄" />
          <div className="max-w-lg mx-auto px-5 py-6">
            <div className="bg-white rounded-2xl p-6 border border-rose-100/60 text-center space-y-5">
              <input value={newRecord.customer_name} onChange={e => setNewRecord({...newRecord, customer_name: e.target.value})} placeholder="客戶姓名" className="w-full px-5 py-4 rounded-2xl border border-rose-100 text-base text-center focus:outline-none focus:border-rose-300" />
              <input value={newRecord.customer_phone} onChange={e => setNewRecord({...newRecord, customer_phone: e.target.value})} placeholder="客戶電話" className="w-full px-5 py-4 rounded-2xl border border-rose-100 text-base text-center focus:outline-none focus:border-rose-300" />
              <input type="date" value={newRecord.service_date} onChange={e => setNewRecord({...newRecord, service_date: e.target.value})} className="w-full px-5 py-4 rounded-2xl border border-rose-100 text-base text-center focus:outline-none focus:border-rose-300" />
              <select value={newRecord.package} onChange={e => setNewRecord({...newRecord, package: e.target.value})} className="w-full px-5 py-4 rounded-2xl border border-rose-100 text-base text-center focus:outline-none focus:border-rose-300 bg-white appearance-none">
                <option value="">選擇套餐</option><option>舒壓放鬆套餐</option><option>能量煥膚套餐</option><option>極致寵愛套餐</option>
                {dbPackages.filter(dp => !["舒壓放鬆套餐","能量煥膚套餐","極致寵愛套餐"].includes(dp.name)).map(dp => (
                  <option key={dp.id} value={dp.name}>{dp.name}</option>
                ))}
              </select>
              <textarea value={newRecord.products_used} onChange={e => setNewRecord({...newRecord, products_used: e.target.value})} rows={2} placeholder="使用產品" className="w-full px-5 py-4 rounded-2xl border border-rose-100 text-base text-center focus:outline-none focus:border-rose-300 resize-none" />
              <textarea value={newRecord.techniques} onChange={e => setNewRecord({...newRecord, techniques: e.target.value})} rows={2} placeholder="手法備註" className="w-full px-5 py-4 rounded-2xl border border-rose-100 text-base text-center focus:outline-none focus:border-rose-300 resize-none" />
              <textarea value={newRecord.skin_condition} onChange={e => setNewRecord({...newRecord, skin_condition: e.target.value})} rows={2} placeholder="膚況紀錄" className="w-full px-5 py-4 rounded-2xl border border-rose-100 text-base text-center focus:outline-none focus:border-rose-300 resize-none" />
              <button onClick={async () => {
                if (!newRecord.customer_phone) return;
                await fetch("/api/service-records", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newRecord) });
                alert("紀錄已建立！"); setNewRecord({ customer_phone: "", customer_name: "", service_date: "", package: "", products_used: "", techniques: "", skin_condition: "", notes: "" });
              }} className="w-full bg-rose-500 text-white py-5 rounded-2xl text-lg font-medium active:bg-dark-light">建立紀錄</button>
            </div>
          </div>
        </>
      )}

      {view === "schedule" && (
        <>
          <SubHeader title="排程管理" />
          <div className="max-w-lg mx-auto px-5 py-6 space-y-5">
            <div className="bg-white rounded-2xl p-6 space-y-5 border border-rose-100">
              <p className="text-text-light text-base">關閉預約時段。行事曆的私人行程也會自動封鎖對應時段。</p>
              <div className="border border-rose-100 rounded-2xl p-5 space-y-4">
                <p className="font-bold text-dark text-lg">新增封鎖</p>

                <div>
                  <p className="text-sm text-text-light mb-2">日期範圍</p>
                  <div className="flex gap-3 items-center">
                    <input type="date" value={blockForm.startDate} onChange={e => setBlockForm({...blockForm, startDate: e.target.value})} className="flex-1 px-6 py-6 border-2 border-rose-100 rounded-2xl text-lg focus:outline-none focus:border-rose-300" />
                    <span className="text-text-light text-lg">~</span>
                    <input type="date" value={blockForm.endDate} onChange={e => setBlockForm({...blockForm, endDate: e.target.value})} className="flex-1 px-6 py-6 border-2 border-rose-100 rounded-2xl text-lg focus:outline-none focus:border-rose-300" />
                  </div>
                </div>

                {/* 冠 #4320: 整天 / 部分時段 切換 + 起訖時間都要選 */}
                <div>
                  <p className="text-sm text-text-light mb-2">封鎖範圍</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => setBlockForm({...blockForm, mode: "all"})}
                      className={`py-6 rounded-2xl text-xl font-bold border-2 ${blockForm.mode === "all" ? "bg-rose-500 text-white border-rose-500 shadow-md" : "bg-white text-rose-500 border-rose-200"}`}>
                      整天關閉
                    </button>
                    <button type="button" onClick={() => setBlockForm({...blockForm, mode: "range"})}
                      className={`py-6 rounded-2xl text-xl font-bold border-2 ${blockForm.mode === "range" ? "bg-rose-500 text-white border-rose-500 shadow-md" : "bg-white text-rose-500 border-rose-200"}`}>
                      指定時段
                    </button>
                  </div>
                </div>

                {blockForm.mode === "range" && (
                  <div>
                    <p className="text-sm text-text-light mb-2">起訖時間（每 10 分鐘為一格）</p>
                    <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
                      <select value={blockForm.startTime} onChange={e => setBlockForm({...blockForm, startTime: e.target.value})}
                        className="px-6 py-6 border-2 border-rose-100 rounded-2xl text-lg bg-white focus:outline-none focus:border-rose-300">
                        {(() => { const s: string[] = []; for (let h = 10; h <= 20; h++) for (let m = 0; m < 60; m += 10) { if (h === 20 && m > 0) break; s.push(`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`); } return s; })().map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <span className="text-text-light text-lg text-center">~</span>
                      <select value={blockForm.endTime} onChange={e => setBlockForm({...blockForm, endTime: e.target.value})}
                        className="px-6 py-6 border-2 border-rose-100 rounded-2xl text-lg bg-white focus:outline-none focus:border-rose-300">
                        {(() => { const s: string[] = []; for (let h = 10; h <= 20; h++) for (let m = 0; m < 60; m += 10) { if (h === 20 && m > 0) break; s.push(`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`); } return s; })().map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <p className="text-xs text-text-light mt-2">⚠ 「{blockForm.startTime} ~ {blockForm.endTime}」之間整段時間都不能預約</p>
                  </div>
                )}

                <input value={blockForm.reason} onChange={e => setBlockForm({...blockForm, reason: e.target.value})} placeholder="原因（選填，例：員工請假 / 設備維修）" className="w-full px-6 py-6 border-2 border-rose-100 rounded-2xl text-lg focus:outline-none focus:border-rose-300" />

                <button onClick={async () => {
                  if (!blockForm.startDate) return alert("請選擇日期");
                  if (blockForm.mode === "range") {
                    if (blockForm.startTime >= blockForm.endTime) return alert("結束時間必須晚於開始時間");
                  }
                  const dates: string[] = [];
                  const start = new Date(blockForm.startDate);
                  const end = blockForm.endDate ? new Date(blockForm.endDate) : start;
                  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                    dates.push(d.toISOString().slice(0, 10));
                  }
                  const payload = blockForm.mode === "all"
                    ? { action: "block_dates", dates, time: "all", reason: blockForm.reason }
                    : { action: "block_dates", dates, startTime: blockForm.startTime, endTime: blockForm.endTime, reason: blockForm.reason };
                  await fetch("/api/calendar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
                  setBlockForm({ startDate: "", endDate: "", mode: "all", startTime: "14:00", endTime: "16:00", reason: "" });
                  fetchBlockedDates();
                  alert("已封鎖！");
                }} className="w-full bg-rose-500 text-white py-6 rounded-2xl text-2xl font-bold active:bg-rose-600 shadow-md">🔒 封鎖時段</button>
              </div>

              <div>
                <p className="font-bold text-dark text-lg mb-3">已封鎖的時段</p>
                {blockedDates.length === 0 ? <p className="text-text-light text-base text-center py-8">目前沒有手動封鎖的時段</p> : (
                  <div className="space-y-3">
                    {blockedDates.map((bd: Record<string, unknown>) => (
                      <div key={String(bd.id)} className="flex items-center justify-between bg-rose-50/70 px-5 py-4 rounded-2xl">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-dark text-base">{String(bd.date)}</p>
                          <p className="text-text-light text-sm mt-1">
                            {bd.time === "all" || !bd.time
                              ? "整天關閉"
                              : (bd.end_time ? `${String(bd.time)} ~ ${String(bd.end_time)}` : `${String(bd.time)} 起`)}
                          </p>
                          {bd.reason ? <p className="text-text-light text-sm mt-1">原因：{String(bd.reason)}</p> : null}
                        </div>
                        <button onClick={async () => {
                          await fetch("/api/calendar", { method: "POST", headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ action: "unblock_date", id: bd.id }) });
                          fetchBlockedDates();
                        }} className="bg-white border-2 border-rose-300 text-rose-500 px-5 py-3 rounded-2xl text-base font-bold active:bg-rose-100">解除</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {view === "notifications" && (
        <>
          <button onClick={() => setView("home")} className="text-rose-500 text-sm mb-4">&larr; 返回</button>
          <div className="bg-white rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-dark">通知中心</h2>
              {notifCount > 0 && <button onClick={async () => {
                await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ readAll: true }) });
                fetchNotifications();
              }} className="text-rose-500 text-sm">全部已讀</button>}
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
