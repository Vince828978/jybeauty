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

export default function ServicesPage() {
  const [authed, setAuthed] = useState(false);
  const [pass, setPass] = useState("");
  const [view, setView] = useState<View>("services");
  const [services, setServices] = useState<Service[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  // Service form
  const [editService, setEditService] = useState<Service | null>(null);
  const [serviceForm, setServiceForm] = useState({ name: "", description: "", duration_min: 60, price: 0, category: "身體", sort_order: 0 });
  const [showServiceForm, setShowServiceForm] = useState(false);

  // Package builder
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);
  const [pkgForm, setPkgForm] = useState({ name: "", description: "", package_price: 0, duration_min: 60, sort_order: 0 });
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
    setServiceForm({ name: "", description: "", duration_min: 60, price: 0, category: "身體", sort_order: 0 });
    setEditService(null);
    setShowServiceForm(false);
  };

  const resetPkgForm = () => {
    setPkgForm({ name: "", description: "", package_price: 0, duration_min: 60, sort_order: 0 });
    setSelectedServiceIds([]);
    setEditPkg(null);
    setShowPkgForm(false);
  };

  const handleSaveService = async () => {
    if (!serviceForm.name || !serviceForm.price) return;
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
    if (!pkgForm.name || !pkgForm.package_price || selectedServiceIds.length === 0) return;
    const payload = {
      ...pkgForm,
      service_ids: selectedServiceIds,
      original_price: originalTotal,
      duration_min: pkgForm.duration_min || totalDuration,
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
                    placeholder="服務名稱" className="w-full px-4 py-3 rounded-xl border border-rose-100 text-sm focus:outline-none focus:border-rose-300" />
                  <input value={serviceForm.description} onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                    placeholder="服務說明（選填）" className="w-full px-4 py-3 rounded-xl border border-rose-100 text-sm focus:outline-none focus:border-rose-300" />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-text-light mb-1 block">時長（分鐘）</label>
                      <input type="number" value={serviceForm.duration_min} onChange={(e) => setServiceForm({ ...serviceForm, duration_min: Number(e.target.value) })}
                        className="w-full px-4 py-3 rounded-xl border border-rose-100 text-sm focus:outline-none focus:border-rose-300" />
                    </div>
                    <div>
                      <label className="text-xs text-text-light mb-1 block">價格</label>
                      <input type="number" value={serviceForm.price} onChange={(e) => setServiceForm({ ...serviceForm, price: Number(e.target.value) })}
                        className="w-full px-4 py-3 rounded-xl border border-rose-100 text-sm focus:outline-none focus:border-rose-300" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-text-light mb-1 block">分類</label>
                      <select value={serviceForm.category} onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-rose-100 text-sm focus:outline-none focus:border-rose-300 bg-white">
                        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-text-light mb-1 block">排序</label>
                      <input type="number" value={serviceForm.sort_order} onChange={(e) => setServiceForm({ ...serviceForm, sort_order: Number(e.target.value) })}
                        className="w-full px-4 py-3 rounded-xl border border-rose-100 text-sm focus:outline-none focus:border-rose-300" />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={resetServiceForm}
                      className="flex-1 py-3 rounded-xl border-2 border-rose-200 text-rose-400 text-sm font-medium active:bg-rose-50">取消</button>
                    <button onClick={handleSaveService}
                      className="flex-1 py-3 rounded-xl bg-rose-500 text-white text-sm font-medium active:bg-rose-600">{editService ? "更新" : "新增"}</button>
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
                placeholder="套餐名稱" className="w-full px-4 py-3 rounded-xl border border-rose-100 text-sm focus:outline-none focus:border-rose-300" />
              <input value={pkgForm.description} onChange={(e) => setPkgForm({ ...pkgForm, description: e.target.value })}
                placeholder="套餐說明（選填）" className="w-full px-4 py-3 rounded-xl border border-rose-100 text-sm focus:outline-none focus:border-rose-300" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-text-light mb-1 block">套餐售價</label>
                  <input type="number" value={pkgForm.package_price} onChange={(e) => setPkgForm({ ...pkgForm, package_price: Number(e.target.value) })}
                    placeholder="套餐價格" className="w-full px-4 py-3 rounded-xl border border-rose-100 text-sm focus:outline-none focus:border-rose-300" />
                </div>
                <div>
                  <label className="text-xs text-text-light mb-1 block">總時長（分鐘）</label>
                  <input type="number" value={pkgForm.duration_min || totalDuration} onChange={(e) => setPkgForm({ ...pkgForm, duration_min: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl border border-rose-100 text-sm focus:outline-none focus:border-rose-300" />
                </div>
              </div>
              <div>
                <label className="text-xs text-text-light mb-1 block">排序</label>
                <input type="number" value={pkgForm.sort_order} onChange={(e) => setPkgForm({ ...pkgForm, sort_order: Number(e.target.value) })}
                  className="w-full px-4 py-3 rounded-xl border border-rose-100 text-sm focus:outline-none focus:border-rose-300" />
              </div>

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
