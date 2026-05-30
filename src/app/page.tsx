"use client";
import Image from "next/image";
import { useState, useEffect, useCallback, createContext, useContext } from "react";

type Page = "home" | "about" | "services" | "packages" | "booking" | "contact";

const EditCtx = createContext<{ editing: boolean; content: Record<string, string>; save: (k: string, v: string) => void }>({ editing: false, content: {}, save: () => {} });

function E({ k, fallback, className = "" }: { k: string; fallback: string; className?: string }) {
  const { editing, content, save } = useContext(EditCtx);
  const text = content[k] || fallback;
  const [val, setVal] = useState(text);
  const [open, setOpen] = useState(false);
  useEffect(() => { setVal(content[k] || fallback); }, [content, k, fallback]);

  if (!editing) return <span className={className}>{text}</span>;

  if (open) {
    return (
      <textarea value={val} onChange={e => setVal(e.target.value)}
        onBlur={() => { save(k, val); setOpen(false); }}
        autoFocus rows={Math.max(1, val.split("\n").length)}
        className={`${className} bg-gold/10 border-2 border-gold rounded-lg px-2 py-1 focus:outline-none resize-none w-full text-center`}
      />
    );
  }
  return (
    <span onClick={() => setOpen(true)}
      className={`${className} cursor-pointer border border-dashed border-gold/40 hover:border-gold hover:bg-gold/5 px-1 rounded transition-all`}>
      {text}
    </span>
  );
}

function Menu({ open, onClose, onNavigate }: { open: boolean; onClose: () => void; onNavigate: (p: Page) => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] fade-in">
      <div className="absolute inset-0 bg-dark/90 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex flex-col items-center justify-center h-full text-center">
        <button onClick={onClose} className="absolute top-6 right-6 text-white/60">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
        <Image src="/logo.svg" alt="JY Beauty" width={360} height={180} className="h-32 w-auto mb-4" />
        <p className="text-gold text-sm tracking-[0.3em] mb-10">RELAX · RADIATE · RENEW</p>
        {[
          { key: "home" as Page, label: "首頁" },
          { key: "about" as Page, label: "關於我們" },
          { key: "services" as Page, label: "專屬為你" },
          { key: "packages" as Page, label: "服務項目" },
          { key: "contact" as Page, label: "聯繫我們" },
        ].map((item) => (
          <button key={item.key} onClick={() => { onNavigate(item.key); onClose(); }}
            className="block font-serif-tc text-3xl text-white/80 hover:text-gold py-5 tracking-wider transition-colors">
            {item.label}
          </button>
        ))}
        <a href="/member" className="block font-serif-tc text-3xl text-white/80 hover:text-gold py-5 tracking-wider transition-colors">
          會員中心
        </a>
      </div>
    </div>
  );
}

function Navbar({ onMenuOpen }: { onMenuOpen: () => void }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-dark/50 to-transparent">
      <div className="flex items-center px-6 py-5">
        <button onClick={onMenuOpen} className="w-11 h-11 flex items-center justify-center bg-white/15 backdrop-blur-sm rounded-full">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-white">
            <path d="M4 8h16M4 16h16"/>
          </svg>
        </button>
      </div>
    </nav>
  );
}

function NavbarLight({ onMenuOpen }: { onMenuOpen: () => void }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-warm-bg/90 backdrop-blur-md border-b border-gold-light/30">
      <div className="flex items-center justify-between px-6 py-4">
        <button onClick={onMenuOpen} className="w-10 h-10 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-dark">
            <path d="M3 8h18M3 16h18"/>
          </svg>
        </button>
        <Image src="/logo.svg" alt="JY Beauty" width={120} height={60} className="h-10 w-auto" />
        <div className="w-10" />
      </div>
    </nav>
  );
}

function HomePage() {
  return (
    <section className="relative h-screen">
      <Image src="/hero-main.jpg" alt="JY Beauty" fill className="object-cover object-top" priority />
      <div className="absolute inset-0 bg-gradient-to-t from-dark/60 via-transparent to-dark/20" />
      <div className="absolute inset-x-0 top-[38%] px-8 text-center">
        <h1 className="font-serif-tc text-3xl md:text-5xl font-bold text-white leading-tight mb-3">
          <E k="hero_title" fallback={"美麗・放鬆\n從 JY Beauty 開始"} />
        </h1>
        <p className="text-white/70 text-sm">
          <E k="hero_subtitle" fallback="私人到府 SPA，在你最放鬆的空間享受專屬療程" />
        </p>
      </div>
    </section>
  );
}

function AboutPage() {
  return (
    <section className="min-h-screen pt-20" style={{background: "linear-gradient(180deg, #2c2420 0%, #3d2e24 30%, #4a3828 60%, #3d2e24 100%)"}}>
      <div className="relative h-[45vh]">
        <Image src="/about.jpg" alt="JY Beauty 美容師" fill className="object-cover object-top" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#3d2e24] to-transparent" />
      </div>
      <div className="md:max-w-xl mx-auto px-10 py-12 text-center">
        <p className="text-gold text-xs tracking-[0.3em] uppercase mb-4">ABOUT US</p>
        <h2 className="font-serif-tc text-2xl font-bold text-white mb-6"><E k="about_title" fallback="不開店，我去找你" /></h2>
        <div className="text-white/70 text-sm leading-loose space-y-4">
          <p>15年的美容經驗，<br />讓我接觸過無數不同的人。</p>
          <p>每個人都有不同的故事、生活與壓力。<br />而唯一始終不變的，<br />就是現代人長期累積的疲憊感。</p>
          <p>工作、情緒、人際、生活節奏——<br />那些有形與無形的壓力，<br />早已悄悄消耗著我們。</p>
          <p>很多人下班後，<br />只是想好好放鬆一下，<br />卻還得花時間搜尋、比較、擔心踩雷。</p>
          <p className="font-medium text-white">因此，我們希望把「療癒」這件事，<br />變得更簡單。</p>
          <p>您可以在回家途中直接線上預約，<br />選擇到府服務，或前往工作室。<br />省去等待與不確定感，<br />讓每一次放鬆，都能真正安心。</p>
          <p>我們堅持客製化服務。<br />不只是固定流程，<br />而是真正了解您的疲勞來源與身體狀態。</p>
          <p>哪裡不舒服，<br />我們就專注替您改善哪裡。</p>
          <p className="font-medium text-white">因為好的療程，<br />不只是當下舒服。<br />而是讓身心都慢慢回到平衡。</p>
        </div>
      </div>
    </section>
  );
}

function ServicesPage() {
  return (
    <section className="min-h-screen pt-20 bg-dark">
      <div className="relative h-[40vh]">
        <Image src="/about-2.jpg" alt="JY Beauty" fill className="object-cover object-top" />
        <div className="absolute inset-0 bg-dark/30" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h2 className="font-serif-tc text-3xl font-bold text-white mb-2">專屬為你</h2>
            <p className="text-white/60 text-sm tracking-wider">EXCLUSIVE FOR YOU</p>
          </div>
        </div>
      </div>
      <div className="md:max-w-3xl mx-auto px-10 py-10 text-center">
        <p className="text-white/70 text-sm leading-loose mb-8">
          每個人的身體狀況不同，<br />
          我們不做固定流程，<br />
          而是根據您的需求客製化每一次療程。<br /><br />
          <span className="font-medium text-white">告訴我們哪裡不舒服，<br />我們就專注替您改善哪裡。</span>
        </p>

        <div className="w-16 h-px bg-gold/40 mx-auto mb-8" />

        <p className="text-gold text-xs tracking-[0.3em] uppercase mb-4">服務對象</p>
        <div className="space-y-3 mb-10">
          {[
            { label: "新手媽媽", desc: "帶小孩不方便出門，在家就能享受放鬆" },
            { label: "孕婦產後", desc: "孕期舒緩、產後修復，不必舟車勞頓" },
            { label: "忙碌上班族", desc: "下班回家就是 SPA，時間最高效利用" },
            { label: "術後修護", desc: "醫美術後在家安心保養，不必再跑診所" },
            { label: "銀髮長輩", desc: "子女送禮，到府按摩最貼心" },
            { label: "居家工作者", desc: "關上螢幕，美容師已到門口" },
          ].map((a) => (
            <div key={a.label} className="text-center">
              <p className="font-serif-tc text-white font-semibold text-lg">{a.label}</p>
              <p className="text-white/50 text-sm">{a.desc}</p>
            </div>
          ))}
        </div>

        <div className="w-16 h-px bg-gold/40 mx-auto mb-8" />

        <p className="text-gold text-xs tracking-[0.3em] uppercase mb-4">專業資歷</p>
        <div className="space-y-2 mb-10 text-sm text-white/50">
          <p>美容丙乙級證照 · 15 年經驗</p>
          <p>資深美容顧問 · 孕婦按摩培訓</p>
          <p>韓式霧唇培訓 · 火罐拉筋放鬆</p>
        </div>

        <div className="w-16 h-px bg-gold/40 mx-auto mb-8" />

        <p className="text-gold text-xs tracking-[0.3em] uppercase mb-4">服務方式</p>
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="border border-gold/20 rounded-2xl p-5 text-center">
            <p className="font-serif-tc text-lg font-bold text-white mb-1">到府服務</p>
            <p className="text-white/50 text-sm">美容師到你家</p>
          </div>
          <div className="border border-gold/20 rounded-2xl p-5 text-center">
            <p className="font-serif-tc text-lg font-bold text-white mb-1">工作室服務</p>
            <p className="text-white/50 text-sm">就近配合工作室</p>
          </div>
        </div>

        <p className="text-white/50 text-sm leading-loose">
          每個舒壓療程都可依照您的需求調整，<br />
          時長我們都可以配合。
        </p>
      </div>
    </section>
  );
}

// 冠 #4334 2026-05-29: 官網首頁精選組合也改成從 DB 拉，肉包後台建立後才顯示
// 冠 #4352 2026-05-29: 精選組合分頁改成顯示「服務項目」，而非套餐
type SiteService = {
  id: number;
  name: string;
  description?: string;
  price: number;
  duration_min: number;
  category?: string;
  is_active: boolean;
  is_public?: boolean;
};

function PackagesPage() {
  const [services, setServices] = useState<SiteService[]>([]);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    fetch("/api/services")
      .then(r => r.json())
      // 親友價格這種 is_public=false 不在官網露出
      .then(d => setServices((d.services || []).filter((s: SiteService) => s.is_active && s.is_public !== false)))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  // 分類分組顯示 (身體 / 臉部 / 未分類 / 其他)
  const grouped: Record<string, SiteService[]> = {};
  for (const s of services) {
    const cat = s.category || "其他";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(s);
  }
  const orderHint = ["身體", "臉部", "未分類", "其他"];
  const cats = Object.keys(grouped).sort((a, b) => {
    const ai = orderHint.indexOf(a);
    const bi = orderHint.indexOf(b);
    return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi);
  });
  return (
    <section className="min-h-screen pt-20 bg-dark">
      <div className="relative h-[35vh]">
        <Image src="/about-2.jpg" alt="JY Beauty 服務項目" fill className="object-cover object-top" />
        <div className="absolute inset-0 bg-dark/50" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gold-light text-xs tracking-[0.3em] uppercase mb-2">SERVICES</p>
            <h2 className="font-serif-tc text-3xl font-bold text-white">服務項目</h2>
          </div>
        </div>
      </div>
      {/* 冠 #4452 2026-05-30: 加大左右 padding，pb 留空間避免被右下浮動按鈕擋住 */}
      <div className="md:max-w-3xl mx-auto px-8 md:px-16 py-8 pb-40">
        {!loaded ? (
          <p className="text-white/40 py-12 text-center">載入中...</p>
        ) : services.length === 0 ? (
          <div className="border border-gold/30 rounded-2xl p-10 text-center">
            <p className="text-3xl mb-3">📋</p>
            <p className="text-white font-bold text-lg mb-2">服務項目尚未上架</p>
            <p className="text-white/50 text-sm">店家正在後台建立中，請稍後再回來看看～</p>
          </div>
        ) : (
          <div className="space-y-10">
            {cats.map((cat) => (
              <div key={cat}>
                <p className="text-gold-light text-xs tracking-[0.3em] uppercase mb-2 text-center">{cat.toUpperCase()}</p>
                <h3 className="text-gold font-serif-tc text-2xl font-bold mb-6 text-center">{cat}</h3>
                <div className="space-y-4 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
                  {/* 冠 #4489 2026-05-30: 字級加大、移除分線、時長改放金額上方 */}
                  {grouped[cat].map((s) => (
                    <div key={s.id} className="border border-gold/30 rounded-2xl p-7 flex flex-col bg-dark/30">
                      <h4 className="text-white font-serif-tc text-2xl font-bold mb-2">{s.name}</h4>
                      {s.description && <p className="text-white/60 text-sm mb-3">{s.description}</p>}
                      <div className="mt-auto pt-4 text-right">
                        <p className="text-white/60 text-base mb-1">{s.duration_min} 分鐘</p>
                        <p className="text-gold font-serif-tc text-3xl font-bold">${s.price.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="text-center mt-12">
          <a href="/member" className="inline-block bg-gold text-white px-12 py-5 text-lg tracking-wide rounded-2xl font-medium active:bg-dark-light transition-colors">
            會員預約
          </a>
        </div>
      </div>
    </section>
  );
}

function ContactPage() {
  return (
    <section className="min-h-screen pt-20 bg-dark text-white flex flex-col">
      <div className="relative h-[40vh]">
        <Image src="/hero-1.jpg" alt="JY Beauty" fill className="object-cover object-top" />
        <div className="absolute inset-0 bg-dark/30" />
      </div>
      <div className="flex-1 flex items-center justify-center px-8 py-12">
        <div className="text-center max-w-sm">
          <p className="text-gold-light text-xs tracking-[0.3em] uppercase mb-4">CONTACT</p>
          <h2 className="font-serif-tc text-2xl font-bold mb-6">聯繫我們</h2>
          <div className="space-y-4 mb-8">
            <div>
              <p className="text-white/40 text-xs mb-1">LINE 預約</p>
              <p className="text-white font-medium">@jy.beauty</p>
            </div>
            <div>
              <p className="text-white/40 text-xs mb-1">服務時間</p>
              <p className="text-white font-medium">預約制，配合您的時間</p>
            </div>
            <div>
              <p className="text-white/40 text-xs mb-1">服務方式</p>
              <p className="text-white font-medium">專業到府服務</p>
            </div>
          </div>
          <a href="/booking" className="inline-block bg-gold text-white px-14 py-5 text-xl tracking-wide rounded-2xl font-medium active:bg-gold-light transition-colors">
            立即預約
          </a>
          <p className="text-white/20 text-sm mt-10">&copy; 2026 JY Beauty</p>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [page, setPage] = useState<Page>("home");
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState<Record<string, string>>({});

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search.includes("edit=1")) {
      const p = prompt("輸入管理密碼進入編輯模式");
      if (p === "1234") setEditing(true);
    }
    fetch("/api/content").then(r => r.json()).then(d => { if (d.content) setContent(d.content); }).catch(() => {});
  }, []);

  const save = useCallback(async (k: string, v: string) => {
    setContent(prev => ({ ...prev, [k]: v }));
    await fetch("/api/content", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: k, value: v }) });
  }, []);

  const renderPage = () => {
    switch (page) {
      case "home": return <HomePage />;
      case "about": return <AboutPage />;
      case "services": return <ServicesPage />;
      case "packages": return <PackagesPage />;
      case "booking": return <ServicesPage />;
      case "contact": return <ContactPage />;
    }
  };

  return (
    <EditCtx.Provider value={{ editing, content, save }}>
      <main>
        {editing && (
          <div className="fixed bottom-4 right-4 z-[200] bg-gold text-white px-4 py-2 rounded-full text-sm shadow-lg">
            編輯模式 ON
          </div>
        )}
        <Menu open={menuOpen} onClose={() => setMenuOpen(false)} onNavigate={setPage} />
        {/* 左上懸浮按鈕 */}
        <div className="fixed top-6 left-5 z-[150] flex flex-col gap-3">
          <button onClick={() => setMenuOpen(true)}
            className="w-[68px] h-[68px] float-btn flex flex-col items-center justify-center">
            <span className="corner-tr" /><span className="corner-bl" />
            <span className="text-gold/90 text-xs font-medium leading-tight">認識</span>
            <span className="text-gold/90 text-xs font-medium leading-tight">JY</span>
          </button>
          <button onClick={() => { setPage("home"); window.location.href = "/member"; }}
            className="w-[68px] h-[68px] float-btn flex flex-col items-center justify-center">
            <span className="corner-tr" /><span className="corner-bl" />
            <span className="text-gold/90 text-xs font-medium leading-tight">會員</span>
            <span className="text-gold/90 text-xs font-medium leading-tight">預約</span>
          </button>
        </div>
        {/* 右下懸浮按鈕 */}
        <div className="fixed bottom-6 right-5 z-[150] flex flex-col gap-3">
          <a href="/experience"
            className="w-[68px] h-[68px] float-btn flex flex-col items-center justify-center">
            <span className="corner-tr" /><span className="corner-bl" />
            <span className="text-gold/90 text-xs font-medium leading-tight">立即</span>
            <span className="text-gold/90 text-xs font-medium leading-tight">體驗</span>
          </a>
          <a href="https://lin.ee/PeB8CkE" target="_blank"
            className="w-[68px] h-[68px] float-btn flex flex-col items-center justify-center">
            <span className="corner-tr" /><span className="corner-bl" />
            <span className="text-gold/90 text-xs font-medium leading-tight">與我</span>
            <span className="text-gold/90 text-xs font-medium leading-tight">聊聊</span>
          </a>
        </div>
        <div key={page} className="fade-in">
          {renderPage()}
        </div>
      </main>
    </EditCtx.Provider>
  );
}
