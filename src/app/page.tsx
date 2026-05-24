"use client";
import Image from "next/image";
import { useState, useEffect, useCallback, createContext, useContext } from "react";

type Page = "home" | "about" | "services" | "booking" | "contact";

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
      <div className="absolute inset-x-0 bottom-[18%] text-center">
        <a href="/member" className="inline-block border-2 border-gold text-gold px-20 py-5 text-xl tracking-[0.5em] hover:bg-gold hover:text-white transition-all font-serif-tc">
          會員預約
        </a>
      </div>
    </section>
  );
}

function AboutPage() {
  return (
    <section className="min-h-screen pt-20 bg-white">
      <div className="relative h-[45vh]">
        <Image src="/about.jpg" alt="JY Beauty 美容師" fill className="object-cover object-top" />
      </div>
      <div className="md:max-w-xl mx-auto px-10 py-12 text-center">
        <p className="text-gold text-xs tracking-[0.3em] uppercase mb-4">ABOUT US</p>
        <h2 className="font-serif-tc text-2xl font-bold text-dark mb-6"><E k="about_title" fallback="不開店，我去找你" /></h2>
        <div className="text-text-light text-sm leading-loose space-y-4">
          <p>15年的美容經驗，<br />讓我接觸過無數不同的人。</p>
          <p>每個人都有不同的故事、生活與壓力。<br />而唯一始終不變的，<br />就是現代人長期累積的疲憊感。</p>
          <p>工作、情緒、人際、生活節奏——<br />那些有形與無形的壓力，<br />早已悄悄消耗著我們。</p>
          <p>很多人下班後，<br />只是想好好放鬆一下，<br />卻還得花時間搜尋、比較、擔心踩雷。</p>
          <p className="font-medium text-dark">因此，我們希望把「療癒」這件事，<br />變得更簡單。</p>
          <p>您可以在回家途中直接線上預約，<br />選擇到府服務，或前往工作室。<br />省去等待與不確定感，<br />讓每一次放鬆，都能真正安心。</p>
          <p>我們堅持客製化服務。<br />不只是固定流程，<br />而是真正了解您的疲勞來源與身體狀態。</p>
          <p>哪裡不舒服，<br />我們就專注替您改善哪裡。</p>
          <p className="font-medium text-dark">因為好的療程，<br />不只是當下舒服。<br />而是讓身心都慢慢回到平衡。</p>
        </div>
      </div>
    </section>
  );
}

function ServicesPage() {
  return (
    <section className="min-h-screen pt-20 bg-white">
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
        <p className="text-text-light text-sm leading-loose mb-8">
          每個人的身體狀況不同，<br />
          我們不做固定流程，<br />
          而是根據您的需求客製化每一次療程。<br /><br />
          <span className="font-medium text-dark">告訴我們哪裡不舒服，<br />我們就專注替您改善哪裡。</span>
        </p>

        <div className="section-divider mb-8" />

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
              <p className="font-serif-tc text-dark font-semibold text-lg">{a.label}</p>
              <p className="text-text-light text-sm">{a.desc}</p>
            </div>
          ))}
        </div>

        <div className="section-divider mb-8" />

        <p className="text-gold text-xs tracking-[0.3em] uppercase mb-4">專業資歷</p>
        <div className="space-y-2 mb-10 text-sm text-text-light">
          <p>美容丙乙級證照 · 15 年經驗</p>
          <p>資深美容顧問 · 孕婦按摩培訓</p>
          <p>韓式霧唇培訓 · 火罐拉筋放鬆</p>
        </div>

        <div className="section-divider mb-8" />

        <p className="text-gold text-xs tracking-[0.3em] uppercase mb-4">服務方式</p>
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-cream/50 rounded-2xl p-5 text-center">
            <p className="font-serif-tc text-lg font-bold text-dark mb-1">到府服務</p>
            <p className="text-text-light text-sm">美容師到你家</p>
          </div>
          <div className="bg-cream/50 rounded-2xl p-5 text-center">
            <p className="font-serif-tc text-lg font-bold text-dark mb-1">工作室服務</p>
            <p className="text-text-light text-sm">就近配合工作室</p>
          </div>
        </div>

        <p className="text-text-light text-sm leading-loose">
          每個舒壓療程都可依照您的需求調整，<br />
          時長我們都可以配合。
        </p>
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
        {/* 懸浮按鈕 */}
        <div className="fixed bottom-6 right-5 z-[150] flex flex-col gap-2 items-end">
          <a href="https://line.me/R/ti/p/@jy.beauty" target="_blank"
            className="text-sm font-medium active:opacity-30 transition-opacity" style={{color: "rgba(6,199,85,0.5)"}}>
            與我聊聊
          </a>
          <a href="/experience"
            className="text-sm font-medium text-gold/50 active:opacity-30 transition-opacity">
            立即體驗
          </a>
        </div>
        <Menu open={menuOpen} onClose={() => setMenuOpen(false)} onNavigate={setPage} />
        {page === "home" ? (
          <Navbar onMenuOpen={() => setMenuOpen(true)} />
        ) : (
          <NavbarLight onMenuOpen={() => setMenuOpen(true)} />
        )}
        <div key={page} className="fade-in">
          {renderPage()}
        </div>
      </main>
    </EditCtx.Provider>
  );
}
