"use client";
import { useState, useEffect } from "react";

const ADMIN_PASS = process.env.NEXT_PUBLIC_ADMIN_PASS || "1234";

interface Service {
  id: number;
  name: string;
  description: string;
  duration_min: number;
  price: number;
  category: string;
  is_active: boolean;
  sort_order: number;
}

interface Package {
  id: number;
  name: string;
  description: string;
  original_price: number;
  package_price: number;
  duration_min: number;
  service_ids: string;
  is_active: boolean;
  sort_order: number;
  serviceDetails?: Service[];
}

type View = "services" | "packages" | "package-builder";

const CATEGORIES = ["身體", "臉部", "加項", "其他"];

// 冠 #4514/4518 2026-05-30: 市場價對照表，肉包填價時 reference
// 資料來源：美業自由通行 APP 5 位老師 + Clio/Whobooking + Pro360 個體戶
const MARKET_REF: Array<{ match: RegExp; durMatch?: (d: number) => boolean; label: string; price: string }> = [
  { match: /精油.*60|60.*精油/, durMatch: (d) => d === 60, label: '精油 60min', price: '美業 APP $1,800 / Pro360 $1,000-1,200' },
  { match: /精油.*90|90.*精油/, durMatch: (d) => d === 90, label: '精油 90min', price: '美業 APP $2,200 / Clio $2,500 / Pro360 $1,500-1,800' },
  { match: /精油.*120|120.*精油/, durMatch: (d) => d === 120, label: '精油 120min', price: '~Clio $3,300 估算' },
  { match: /美胸|暖宮/, durMatch: (d) => d === 30, label: '美胸/暖宮 30min', price: '個別店家 $1,000-1,500' },
  { match: /美胸/, durMatch: (d) => d === 60, label: '美胸 60min', price: '美業 APP $2,000' },
  { match: /美胸/, durMatch: (d) => d === 90, label: '美胸 90min', price: '美業 APP $2,500' },
  { match: /肩頸|頸/, durMatch: (d) => d === 30, label: '肩頸舒壓 30min', price: '美業 APP $800' },
  { match: /頭療|頭皮/, durMatch: (d) => d === 30, label: '頭皮舒壓 30min', price: '美業 APP $900' },
  { match: /眼周|眼部/, label: '眼周保養', price: '(無 APP 對應，可走精品定位)' },
  { match: /瘦小臉|小臉/, label: '瘦小臉', price: '(無 APP 對應)' },
  { match: /(臉部|皮膚).*基礎|清潔保濕/, label: '臉部基礎', price: '美業 APP 基礎清潔保濕 $1,500' },
  { match: /(臉部|皮膚).*深層|深層|水飛梭|煥膚/, label: '臉部深層', price: '美業 APP 水飛梭/煥膚 $2,500-2,800' },
  { match: /熱石/, label: '熱石加購', price: '(其他平台無對應加購機制)' },
  { match: /刮痧|筋膜/, label: '刮痧/筋膜', price: '(其他平台無對應加購)' },
  { match: /Lulu|美白/, label: '美白護理', price: '美業 APP 亮白淨膚 $2,200' },
];
function getMarketRef(name: string, dur: number): { label: string; price: string } | null {
  for (const r of MARKET_REF) {
    if (r.match.test(name) && (!r.durMatch || r.durMatch(dur))) return { label: r.label, price: r.price };
  }
  return null;
}

export default function ServicesPage() {
  const [authed, setAuthed] = useState(false);
  const [pass, setPass] = useState("");
  const [view, setView] = useState<View>("services");
  const [services, setServices] = useState<Service[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  // Service form
  const [editService, setEditService] = useState<Service | null>(null);
  const [serviceForm, setServiceForm] = useState({ name: "", description: "", duration_min: 60, price: 0, category: "身體", sort_order: 0, is_public: true });
  const [showServiceForm, setShowServiceForm] = useState(false);

  // Package builder
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);
  const [pkgForm, setPkgForm] = useState({ name: "", description: "", package_price: 0, duration_min: 60, sort_order: 0, is_public: true });
  const [editPkg, setEditPkg] = useState<Package | null>(null);
  const [showPkgForm, setShowPkgForm] = useState(false);

  const fetchServices = async () => {
    const r = await fetch("/api/services");
    const d = await r.json();
    setServices(d.services || []);
    setLoading(false);
  };

  const fetchPackages = async () => {
    const r = await fetch("/api/packages");
    const d = await r.json();
    setPackages(d.packages || []);
  };

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("jyb-admin") === "1") setAuthed(true);
  }, []);

  useEffect(() => {
    if (authed) { fetchServices(); fetchPackages(); }
  }, [authed]);

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{background:"linear-gradient(180deg, #FFF0F0 0%, #FFF8F6 30%, #FFFBFA 100%)"}}>
        <div className="relative w-full max-w-sm">
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

  const activeServices = services.filter((s) => s.is_active);
  const originalTotal = selectedServiceIds.reduce((sum, id) => {
    const s = services.find((sv) => sv.id === id);
    return sum + (s?.price || 0);
  }, 0);
  const totalDuration = selectedServiceIds.reduce((sum, id) => {
    const s = services.find((sv) => sv.id === id);
    return sum + (s?.duration_min || 0);
  }, 0);

  const resetServiceForm = () => {
    setServiceForm({ name: "", description: "", duration_min: 60, price: 0, category: "身體", sort_order: 0, is_public: true });
    setEditService(null);
    setShowServiceForm(false);
  };

  const resetPkgForm = () => {
    setPkgForm({ name: "", description: "", package_price: 0, duration_min: 60, sort_order: 0, is_public: true });
    setSelectedServiceIds([]);
    setEditPkg(null);
    setShowPkgForm(false);
  };

  const handleSaveService = async () => {
    // 冠 #4340 2026-05-29: 時長必填 — 不寫客戶端 calendar 算不出結束時間
    if (!serviceForm.name) { alert("請填服務名稱"); return; }
    if (!serviceForm.duration_min || serviceForm.duration_min < 10) { alert("時長必填，至少 10 分鐘"); return; }
    if (!serviceForm.price && serviceForm.price !== 0) { alert("請填價格（免費填 0）"); return; }
    if (editService) {
      await fetch("/api/services", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...serviceForm, id: editService.id, is_active: editService.is_active }),
      });
    } else {
      await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(serviceForm),
      });
    }
    resetServiceForm();
    fetchServices();
  };

  const handleToggleActive = async (svc: Service) => {
    await fetch("/api/services", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...svc, is_active: !svc.is_active }),
    });
    fetchServices();
  };

  const handleSavePackage = async () => {
    // 冠 #4340: 套餐至少 1 個服務 → 時長自動 = 所有服務時長加總，可手動覆寫
    if (!pkgForm.name) { alert("請填套餐名稱"); return; }
    if (!pkgForm.package_price) { alert("請填套餐售價"); return; }
    if (selectedServiceIds.length === 0) { alert("請至少勾選一項服務"); return; }
    const finalDuration = pkgForm.duration_min || totalDuration;
    if (!finalDuration || finalDuration < 10) {
      alert("套餐時長必須有值（會自動從所選服務加總，可手動覆寫）");
      return;
    }
    const payload = {
      ...pkgForm,
      service_ids: selectedServiceIds,
      original_price: originalTotal,
      duration_min: finalDuration,
    };
    if (editPkg) {
      await fetch("/api/packages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, id: editPkg.id, is_active: editPkg.is_active }),
      });
    } else {
      await fetch("/api/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    resetPkgForm();
    fetchPackages();
  };

  const handleDeactivatePackage = async (id: number) => {
    await fetch("/api/packages", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchPackages();
  };

  const startEditService = (svc: Service) => {
    setServiceForm({
      name: svc.name,
      description: svc.description || "",
      duration_min: svc.duration_min,
      price: svc.price,
      category: svc.category || "身體",
      sort_order: svc.sort_order || 0,
      is_public: (svc as { is_public?: boolean }).is_public !== false,
    });
    setEditService(svc);
    setShowServiceForm(true);
  };

  const startEditPackage = (pkg: Package) => {
    let sids: number[] = [];
    try { sids = JSON.parse(String(pkg.service_ids)); } catch { sids = []; }
    setSelectedServiceIds(sids);
    setPkgForm({
      name: pkg.name,
      description: pkg.description || "",
      package_price: pkg.package_price,
      duration_min: pkg.duration_min,
      sort_order: pkg.sort_order || 0,
      is_public: (pkg as { is_public?: boolean }).is_public !== false,
    });
    setEditPkg(pkg);
    setShowPkgForm(true);
    setView("package-builder");
  };

  const toggleServiceId = (id: number) => {
    setSelectedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen pb-24" style={{ background: "linear-gradient(180deg, #FFF0F0 0%, #FFF8F6 30%, #FFFBFA 100%)" }}>
      {/* Header */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #FECDD3, #FDA4AF, #FB7185)", borderRadius: "0 0 40px 40px", padding: "48px 24px 36px" }}>
        <div className="absolute" style={{ top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.12)" }} />
        <div className="absolute" style={{ bottom: -20, left: -20, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
        <div className="max-w-lg mx-auto relative">
          <div className="flex items-center justify-between mb-4">
            <a href="/admin" className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
            </a>
            <p className="font-serif-tc text-xl font-bold text-white">服務與套餐管理</p>
            <div className="w-10" />
          </div>
          {/* Tab Switcher */}
          <div className="flex gap-2 bg-white/20 rounded-full p-1">
            <button onClick={() => setView("services")}
              className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all ${view === "services" ? "bg-white text-rose-500 shadow-sm" : "text-white/90"}`}>
              服務項目
            </button>
            <button onClick={() => { setView("packages"); resetPkgForm(); }}
              className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all ${view === "packages" ? "bg-white text-rose-500 shadow-sm" : "text-white/90"}`}>
              套餐管理
            </button>
            <button onClick={() => { setView("package-builder"); resetPkgForm(); }}
              className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all ${view === "package-builder" ? "bg-white text-rose-500 shadow-sm" : "text-white/90"}`}>
              建立套餐
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 py-6">
        {/* ===== SERVICES VIEW ===== */}
        {view === "services" && (
          <div className="fade-in">
            <div className="flex justify-between items-center mb-5">
              <span className="text-text-light text-sm">{services.length} 項服務</span>
              <button onClick={() => { resetServiceForm(); setShowServiceForm(true); }}
                className="bg-rose-500 text-white text-sm px-5 py-2.5 rounded-full active:bg-rose-600 transition-colors">
                + 新增服務
              </button>
            </div>

            {/* Service Form Modal */}
            {showServiceForm && (
              <div className="bg-white rounded-[22px] p-6 mb-5 border border-rose-100 shadow-sm">
                <p className="text-rose-500 text-sm font-medium mb-4">{editService ? "編輯服務" : "新增服務"}</p>
                <div className="space-y-3">
                  <input value={serviceForm.name} onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                    placeholder="服務名稱" className="w-full px-5 py-5 rounded-xl border border-rose-100 text-base focus:outline-none focus:border-rose-300" />
                  <input value={serviceForm.description} onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                    placeholder="服務說明（選填）" className="w-full px-5 py-5 rounded-xl border border-rose-100 text-base focus:outline-none focus:border-rose-300" />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-text-light mb-2 block">時長（分鐘）</label>
                      <input type="number" value={serviceForm.duration_min} onChange={(e) => setServiceForm({ ...serviceForm, duration_min: Number(e.target.value) })}
                        className="w-full px-5 py-5 rounded-xl border border-rose-100 text-base focus:outline-none focus:border-rose-300" />
                    </div>
                    <div>
                      <label className="text-sm text-text-light mb-2 block">價格</label>
                      <input type="number" value={serviceForm.price} onChange={(e) => setServiceForm({ ...serviceForm, price: Number(e.target.value) })}
                        className="w-full px-5 py-5 rounded-xl border border-rose-100 text-base focus:outline-none focus:border-rose-300" />
                    </div>
                  </div>
                  {/* 冠 #4514/4518: 市場價對照給肉包填價時參考 */}
                  {(() => {
                    const ref = getMarketRef(serviceForm.name, serviceForm.duration_min);
                    return ref ? (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs">
                        <p className="text-amber-800 font-medium mb-1">📊 市場參考 — {ref.label}</p>
                        <p className="text-amber-700">{ref.price}</p>
                      </div>
                    ) : (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-500">
                        無對應市場資料（這個 SKU 比較獨特，自己決定）
                      </div>
                    );
                  })()}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-text-light mb-2 block">分類</label>
                      <select value={serviceForm.category} onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                        className="w-full px-5 py-5 rounded-xl border border-rose-100 text-base focus:outline-none focus:border-rose-300 bg-white">
                        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-text-light mb-2 block">排序</label>
                      <input type="number" value={serviceForm.sort_order} onChange={(e) => setServiceForm({ ...serviceForm, sort_order: Number(e.target.value) })}
                        className="w-full px-5 py-5 rounded-xl border border-rose-100 text-base focus:outline-none focus:border-rose-300" />
                    </div>
                  </div>
                  {/* 冠 #4344 2026-05-29: 客戶網站可見開關 (像親友優惠這種只給後台手動下單用的勾掉) */}
                  <label className="flex items-center gap-3 px-1 py-2 cursor-pointer">
                    <input type="checkbox" checked={serviceForm.is_public}
                      onChange={(e) => setServiceForm({ ...serviceForm, is_public: e.target.checked })}
                      className="w-6 h-6 accent-rose-500" />
                    <span className="text-sm text-dark flex-1">
                      🌐 客戶網站可見
                      <span className="block text-xs text-text-light">關閉的話只有後台「手動建立預約」會看到（例：親友優惠方案）</span>
                    </span>
                  </label>
                  <div className="flex gap-3 pt-2">
                    <button onClick={resetServiceForm}
                      className="flex-1 py-4 rounded-xl border-2 border-rose-200 text-rose-400 text-base font-semibold active:bg-rose-50">取消</button>
                    <button onClick={handleSaveService}
                      className="flex-1 py-4 rounded-xl bg-rose-500 text-white text-base font-semibold active:bg-rose-600">{editService ? "更新" : "新增"}</button>
                  </div>
                </div>
              </div>
            )}

            {loading ? (
              <p className="text-text-light text-center py-16">載入中...</p>
            ) : services.length === 0 ? (
              <p className="text-text-light text-center py-16">尚無服務項目</p>
            ) : (
              <div className="space-y-3">
                {/* Group by category */}
                {CATEGORIES.map((cat) => {
                  const catServices = services.filter((s) => s.category === cat);
                  if (catServices.length === 0) return null;
                  return (
                    <div key={cat}>
                      <p className="text-rose-300 text-xs font-medium tracking-wider mb-2 px-1">{cat}</p>
                      <div className="space-y-2">
                        {catServices.map((svc) => (
                          <div key={svc.id}
                            className={`bg-white rounded-[18px] px-5 py-4 flex items-center gap-3 border ${svc.is_active ? "border-rose-50" : "border-gray-200 opacity-50"} shadow-sm`}>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-dark font-semibold text-sm truncate">{svc.name}</p>
                                {!svc.is_active && <span className="text-[10px] bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">已停用</span>}
                              </div>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-text-light text-xs">{svc.duration_min} 分鐘</span>
                                <span className="text-rose-500 font-bold text-sm">${svc.price.toLocaleString()}</span>
                              </div>
                              {/* 冠 #4521: 市場參考標記 */}
                              {(() => {
                                const ref = getMarketRef(svc.name, svc.duration_min);
                                return ref ? (
                                  <p className="text-amber-600 text-[11px] mt-1">📊 {ref.price}</p>
                                ) : null;
                              })()}
                              {svc.description && <p className="text-text-light text-xs mt-1 truncate">{svc.description}</p>}
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {/* Active toggle */}
                              <button onClick={() => handleToggleActive(svc)}
                                className={`w-11 h-6 rounded-full relative transition-colors ${svc.is_active ? "bg-rose-400" : "bg-gray-300"}`}>
                                <div className={`w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 transition-all ${svc.is_active ? "left-5.5" : "left-0.5"}`}
                                  style={{ left: svc.is_active ? "22px" : "2px" }} />
                              </button>
                              {/* Edit button */}
                              <button onClick={() => startEditService(svc)}
                                className="w-9 h-9 rounded-full bg-rose-50 flex items-center justify-center text-rose-400 active:bg-rose-100">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {/* Uncategorized */}
                {(() => {
                  const uncategorized = services.filter((s) => !CATEGORIES.includes(s.category));
                  if (uncategorized.length === 0) return null;
                  return (
                    <div>
                      <p className="text-rose-300 text-xs font-medium tracking-wider mb-2 px-1">未分類</p>
                      <div className="space-y-2">
                        {uncategorized.map((svc) => (
                          <div key={svc.id}
                            className={`bg-white rounded-[18px] px-5 py-4 flex items-center gap-3 border ${svc.is_active ? "border-rose-50" : "border-gray-200 opacity-50"} shadow-sm`}>
                            <div className="flex-1 min-w-0">
                              <p className="text-dark font-semibold text-sm truncate">{svc.name}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-text-light text-xs">{svc.duration_min} 分鐘</span>
                                <span className="text-rose-500 font-bold text-sm">${svc.price.toLocaleString()}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button onClick={() => handleToggleActive(svc)}
                                className={`w-11 h-6 rounded-full relative transition-colors ${svc.is_active ? "bg-rose-400" : "bg-gray-300"}`}>
                                <div className="w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 transition-all"
                                  style={{ left: svc.is_active ? "22px" : "2px" }} />
                              </button>
                              <button onClick={() => startEditService(svc)}
                                className="w-9 h-9 rounded-full bg-rose-50 flex items-center justify-center text-rose-400 active:bg-rose-100">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* ===== PACKAGES VIEW ===== */}
        {view === "packages" && (
          <div className="fade-in">
            <div className="flex justify-between items-center mb-5">
              <span className="text-text-light text-sm">{packages.length} 個套餐</span>
              <button onClick={() => { resetPkgForm(); setShowPkgForm(true); setView("package-builder"); }}
                className="bg-rose-500 text-white text-sm px-5 py-2.5 rounded-full active:bg-rose-600 transition-colors">
                + 建立套餐
              </button>
            </div>

            {packages.length === 0 ? (
              <p className="text-text-light text-center py-16">尚無套餐</p>
            ) : (
              <div className="space-y-4">
                {packages.map((pkg) => {
                  let serviceIds: number[] = [];
                  try { serviceIds = JSON.parse(String(pkg.service_ids)); } catch { /* empty */ }
                  const serviceNames = serviceIds.map((id) => {
                    const svc = services.find((s) => s.id === id);
                    return svc?.name || `#${id}`;
                  });
                  const discount = pkg.original_price > 0
                    ? Math.round((1 - pkg.package_price / pkg.original_price) * 100)
                    : 0;
                  return (
                    <div key={pkg.id}
                      className={`bg-white rounded-[22px] p-5 border ${pkg.is_active ? "border-rose-50" : "border-gray-200 opacity-60"} shadow-sm`}>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-dark font-bold text-base">{pkg.name}</p>
                          {pkg.description && <p className="text-text-light text-xs mt-1">{pkg.description}</p>}
                        </div>
                        {!pkg.is_active && <span className="text-[10px] bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">已停用</span>}
                      </div>
                      {/* Service list */}
                      <div className="space-y-1 mb-3">
                        {serviceNames.map((name, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-rose-300" />
                            <span className="text-text-light text-xs">{name}</span>
                          </div>
                        ))}
                      </div>
                      {/* Price row */}
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-text-light text-sm line-through">${pkg.original_price.toLocaleString()}</span>
                        <span className="text-rose-500 font-bold text-lg">${pkg.package_price.toLocaleString()}</span>
                        {discount > 0 && <span className="bg-rose-50 text-rose-500 text-xs px-2 py-0.5 rounded-full">省 {discount}%</span>}
                        <span className="text-text-light text-xs ml-auto">{pkg.duration_min} 分鐘</span>
                      </div>
                      {/* Actions */}
                      <div className="flex gap-3">
                        <button onClick={() => startEditPackage(pkg)}
                          className="flex-1 py-2.5 rounded-xl border border-rose-200 text-rose-400 text-sm font-medium active:bg-rose-50">編輯</button>
                        <button onClick={() => { if (confirm("確定停用此套餐？")) handleDeactivatePackage(pkg.id); }}
                          className="flex-1 py-2.5 rounded-xl border border-red-200 text-red-400 text-sm font-medium active:bg-red-50">{pkg.is_active ? "停用" : "已停用"}</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ===== PACKAGE BUILDER ===== */}
        {view === "package-builder" && (
          <div className="fade-in">
            <p className="text-rose-500 text-sm font-medium mb-4">{editPkg ? "編輯套餐" : "建立新套餐"}</p>

            {/* Select services */}
            <div className="bg-white rounded-[22px] p-5 border border-rose-50 shadow-sm mb-4">
              <p className="text-dark font-semibold text-sm mb-3">選擇包含的服務項目</p>
              {activeServices.length === 0 ? (
                <p className="text-text-light text-xs py-4 text-center">請先新增服務項目</p>
              ) : (
                <div className="space-y-2">
                  {CATEGORIES.map((cat) => {
                    const catServices = activeServices.filter((s) => s.category === cat);
                    if (catServices.length === 0) return null;
                    return (
                      <div key={cat}>
                        <p className="text-text-light text-xs mb-1.5">{cat}</p>
                        {catServices.map((svc) => {
                          const checked = selectedServiceIds.includes(svc.id);
                          return (
                            <button key={svc.id} onClick={() => toggleServiceId(svc.id)}
                              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-all ${checked ? "bg-rose-50 border border-rose-200" : "bg-gray-50 border border-transparent hover:bg-gray-100"}`}>
                              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${checked ? "bg-rose-500 border-rose-500" : "border-gray-300"}`}>
                                {checked && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>}
                              </div>
                              <div className="flex-1 text-left">
                                <span className="text-dark text-sm">{svc.name}</span>
                                <span className="text-text-light text-xs ml-2">{svc.duration_min}min</span>
                              </div>
                              <span className="text-rose-500 font-semibold text-sm">${svc.price.toLocaleString()}</span>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              )}
              {/* Running total */}
              {selectedServiceIds.length > 0 && (
                <div className="mt-4 pt-3 border-t border-rose-100 flex justify-between items-center">
                  <span className="text-text-light text-sm">{selectedServiceIds.length} 項服務・{totalDuration} 分鐘</span>
                  <span className="text-dark font-bold">原價 ${originalTotal.toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* Package details */}
            <div className="bg-white rounded-[22px] p-5 border border-rose-50 shadow-sm mb-4 space-y-3">
              <p className="text-dark font-semibold text-sm mb-1">套餐資訊</p>
              <input value={pkgForm.name} onChange={(e) => setPkgForm({ ...pkgForm, name: e.target.value })}
                placeholder="套餐名稱" className="w-full px-5 py-5 rounded-xl border border-rose-100 text-base focus:outline-none focus:border-rose-300" />
              <input value={pkgForm.description} onChange={(e) => setPkgForm({ ...pkgForm, description: e.target.value })}
                placeholder="套餐說明（選填）" className="w-full px-5 py-5 rounded-xl border border-rose-100 text-base focus:outline-none focus:border-rose-300" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-text-light mb-2 block">套餐售價</label>
                  <input type="number" value={pkgForm.package_price} onChange={(e) => setPkgForm({ ...pkgForm, package_price: Number(e.target.value) })}
                    placeholder="套餐價格" className="w-full px-5 py-5 rounded-xl border border-rose-100 text-base focus:outline-none focus:border-rose-300" />
                </div>
                <div>
                  <label className="text-sm text-text-light mb-2 block">總時長（分鐘）</label>
                  <input type="number" value={pkgForm.duration_min || totalDuration} onChange={(e) => setPkgForm({ ...pkgForm, duration_min: Number(e.target.value) })}
                    className="w-full px-5 py-5 rounded-xl border border-rose-100 text-base focus:outline-none focus:border-rose-300" />
                </div>
              </div>
              <div>
                <label className="text-sm text-text-light mb-2 block">排序</label>
                <input type="number" value={pkgForm.sort_order} onChange={(e) => setPkgForm({ ...pkgForm, sort_order: Number(e.target.value) })}
                  className="w-full px-5 py-5 rounded-xl border border-rose-100 text-base focus:outline-none focus:border-rose-300" />
              </div>

              {/* 冠 #4350 2026-05-29: 親友專案這種只給後台用、不對外公開 */}
              <label className="flex items-center gap-3 px-1 py-2 cursor-pointer">
                <input type="checkbox" checked={pkgForm.is_public}
                  onChange={(e) => setPkgForm({ ...pkgForm, is_public: e.target.checked })}
                  className="w-6 h-6 accent-rose-500" />
                <span className="text-sm text-dark flex-1">
                  🌐 客戶網站可見
                  <span className="block text-xs text-text-light">關閉的話只有後台「手動建立預約」會看到（例：親友專案組合）</span>
                </span>
              </label>

              {/* Preview */}
              {pkgForm.package_price > 0 && originalTotal > 0 && (
                <div className="bg-rose-50 rounded-xl p-4 mt-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-light">原價合計</span>
                    <span className="text-text-light line-through">${originalTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-dark font-medium">套餐售價</span>
                    <span className="text-rose-500 font-bold text-lg">${pkgForm.package_price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-text-light">折扣</span>
                    <span className="text-rose-500 font-medium">省 {Math.round((1 - pkgForm.package_price / originalTotal) * 100)}%</span>
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button onClick={() => { resetPkgForm(); setView("packages"); }}
                className="flex-1 py-4 rounded-2xl border-2 border-rose-200 text-rose-400 text-sm font-medium active:bg-rose-50">取消</button>
              <button onClick={handleSavePackage}
                disabled={!pkgForm.name || !pkgForm.package_price || selectedServiceIds.length === 0}
                className={`flex-1 py-4 rounded-2xl text-sm font-medium transition-colors ${pkgForm.name && pkgForm.package_price && selectedServiceIds.length > 0 ? "bg-rose-500 text-white active:bg-rose-600" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}>
                {editPkg ? "更新套餐" : "建立套餐"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
