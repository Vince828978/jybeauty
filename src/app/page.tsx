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
        <p className="text-gold text-sm tracking-[0.3em] mb-10">RELAX · RENEW · RADIATE</p>
        {[
          { key: "home" as Page, label: "首頁" },
          { key: "about" as Page, label: "關於我們" },
          { key: "services" as Page, label: "療程方案" },
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
        <a href="/booking" className="inline-block border-2 border-gold text-gold px-20 py-5 text-xl tracking-[0.5em] hover:bg-gold hover:text-white transition-all font-serif-tc">
          預約體驗
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
        <div className="text-text-light text-sm leading-loose mb-8 space-y-4">
          <p>每次看到客人做完療程，拎著包包匆匆忙忙趕回家，臉上剛剛的放鬆已經消失一半——捷運好擠、車位好難找、路上好曬。</p>
          <p>我就在想，為什麼放鬆完還要這麼累？</p>
          <p className="font-medium text-dark font-serif-tc text-base">所以我把 SPA 搬到你家。</p>
          <p>你做完翻個身就能睡著，不用趕路、不用在意任何人。醒來的時候，你會發現這才叫真正休息過。</p>
          <p className="font-medium text-dark">不用出門、不用找停車位。<br />生活已經忙碌了，只為了讓你多一點休息。</p>
        </div>
        <div className="border-t border-gold-light/30 pt-6">
          <p className="text-gold text-xs tracking-wide mb-4">專業資歷</p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-text-light">
            <span>美容丙乙級證照</span><span>·</span>
            <span>15 年經驗</span><span>·</span>
            <span>資深美容顧問</span><span>·</span>
            <span>孕婦按摩培訓</span><span>·</span>
            <span>韓式霧唇培訓</span><span>·</span>
            <span>火罐拉筋放鬆</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function ServicesPage() {
  const audiences = [
    { label: "新手媽媽", desc: "帶小孩不方便出門，在家就能享受放鬆" },
    { label: "孕婦產後", desc: "孕期舒緩、產後修復，不必舟車勞頓" },
    { label: "忙碌上班族", desc: "下班回家就是 SPA，時間最高效利用" },
    { label: "術後修護", desc: "醫美術後在家安心保養，不必再跑診所" },
    { label: "銀髮長輩", desc: "子女送禮，到府按摩最貼心" },
    { label: "居家工作者", desc: "關上螢幕，美容師已到門口" },
  ];

  return (
    <section className="min-h-screen pt-20 bg-white">
      <div className="relative h-[40vh]">
        <Image src="/hero-2.jpg" alt="JY Beauty 服務" fill className="object-cover object-[center_30%]" />
      </div>
      <div className="md:max-w-3xl mx-auto px-10 py-10 text-center">
        <p className="text-gold text-xs tracking-[0.3em] uppercase mb-4">OUR SERVICES</p>
        <h2 className="font-serif-tc text-2xl font-bold text-dark mb-8"><E k="services_title" fallback="專為你設計的服務" /></h2>

        {/* 服務模式 */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="bg-cream/50 rounded-2xl p-5 text-center">
            <p className="font-serif-tc text-lg font-bold text-dark mb-2">到府服務</p>
            <p className="text-text-light text-sm">美容師到你家<br />最熟悉的空間放鬆</p>
          </div>
          <div className="bg-cream/50 rounded-2xl p-5 text-center">
            <p className="font-serif-tc text-lg font-bold text-dark mb-2">工作室服務</p>
            <p className="text-text-light text-sm">就近配合工作室<br />專業環境同樣享受</p>
          </div>
        </div>

        {/* 服務對象 */}
        <p className="text-text-light text-sm mb-6">不管你是誰<br />放鬆這件事，我們帶到你身邊</p>
        <div className="space-y-4 mb-10">
          {audiences.map((a) => (
            <div key={a.label} className="text-center">
              <p className="font-serif-tc text-dark font-semibold text-lg">{a.label}</p>
              <p className="text-text-light text-sm">{a.desc}</p>
            </div>
          ))}
        </div>

        <a href="/booking" className="inline-block bg-gold text-white px-12 py-5 text-lg tracking-wide rounded-2xl font-medium active:bg-dark-light transition-colors">
          立即預約
        </a>
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
