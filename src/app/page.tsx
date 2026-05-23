"use client";
import Image from "next/image";
import { useState } from "react";

type Page = "home" | "about" | "services" | "booking" | "contact";

function Menu({ open, onClose, onNavigate }: { open: boolean; onClose: () => void; onNavigate: (p: Page) => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] fade-in">
      <div className="absolute inset-0 bg-dark/90 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex flex-col items-center justify-center h-full text-center">
        <button onClick={onClose} className="absolute top-6 right-6 text-white/60">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
        <Image src="/logo.svg" alt="JY Beauty" width={360} height={180} className="h-32 w-auto mb-14" />
        {[
          { key: "home" as Page, label: "首頁" },
          { key: "about" as Page, label: "關於我們" },
          { key: "services" as Page, label: "療程方案" },
          { key: "booking" as Page, label: "線上預約" },
          { key: "contact" as Page, label: "聯繫我們" },
        ].map((item) => (
          <button key={item.key} onClick={() => { onNavigate(item.key); onClose(); }}
            className="block font-serif-tc text-3xl text-white/80 hover:text-gold py-5 tracking-wider transition-colors">
            {item.label}
          </button>
        ))}
        <div className="mt-14 text-white/30 text-sm tracking-[0.3em]">RELAX · RENEW · RADIATE</div>
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
      <div className="absolute bottom-0 left-0 right-0 pb-44 px-8 text-center">
        <p className="text-gold-light text-xs tracking-[0.4em] uppercase mb-4">RELAX · RENEW · RADIATE</p>
        <h1 className="font-serif-tc text-3xl md:text-5xl font-bold text-white leading-tight mb-5">
          美麗・放鬆<br />從 JY Beauty 開始
        </h1>
        <p className="text-white/70 text-sm mb-10 max-w-xs mx-auto">
          私人到府 SPA，在你最放鬆的空間享受專屬療程
        </p>
        <a href="/booking" className="inline-block bg-gold text-white px-8 py-3 text-sm tracking-wide rounded-full hover:bg-dark-light transition-colors">
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
      <div className="max-w-sm md:max-w-xl mx-auto px-10 py-12 text-center">
        <p className="text-gold text-xs tracking-[0.3em] uppercase mb-4">ABOUT US</p>
        <h2 className="font-serif-tc text-2xl font-bold text-dark mb-6">不開店，我去找你</h2>
        <div className="text-text-light text-sm leading-loose mb-8 space-y-4">
          <p>做美容這些年，看過太多客人拖著疲憊的身體來到店裡，做完療程整個人放鬆了，結果一出門又要擠捷運、找車位，那份放鬆在回家路上就消失了一半。</p>
          <p>我一直在想，如果做完就能直接躺在自己的床上，蓋著自己最喜歡的被子，那才是真正完整的放鬆。</p>
          <p className="font-medium text-dark font-serif-tc text-base">所以我決定，不開店，我去找你。</p>
          <p>我把所有專業設備都帶在身上——精油、美容床、毛巾、音樂，到你家幫你佈置一個專屬的 SPA 空間。你不用出門、不用趕時間、不用跟別人共用空間。</p>
          <p className="font-medium text-dark">這段時間，完全是你的。</p>
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
  const packages = [
    { tier: "Basic", name: "舒壓放鬆套餐", price: "$2,280", items: ["精油按摩 60 min", "臉部保養 基礎護理"] },
    { tier: "Popular", name: "能量煥膚套餐", price: "$3,480", items: ["精油按摩 90 min", "臉部保養 深層護理", "身體加項 任選 1 項"], popular: true },
    { tier: "Luxury", name: "極致寵愛套餐", price: "$4,880", items: ["精油按摩 120 min", "臉部保養 深層護理", "身體加項 任選 2 項", "臉部加項 任選 1 項"] },
  ];
  const [active, setActive] = useState(1);
  const prev = () => setActive((p) => (p - 1 + packages.length) % packages.length);
  const next = () => setActive((p) => (p + 1) % packages.length);

  return (
    <section className="min-h-screen pt-20 bg-cream/50">
      <div className="relative h-[35vh]">
        <Image src="/hero-2.jpg" alt="JY Beauty 療程" fill className="object-cover object-[center_30%]" />
      </div>
      <div className="max-w-sm md:max-w-4xl mx-auto px-8 py-12 text-center">
        <p className="text-gold text-xs tracking-[0.3em] uppercase mb-4">TREATMENTS</p>
        <h2 className="font-serif-tc text-2xl font-bold text-dark mb-10">療程方案</h2>

        {/* Mobile carousel */}
        <div className="md:hidden relative">
          <div className="relative min-h-[260px] mx-8">
            {packages.map((p, i) => (
              <div key={p.name} className={`absolute inset-0 transition-all duration-500 ${i === active ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none"}`}>
                <div className={`bg-white px-6 py-8 rounded-2xl border text-center ${p.popular ? "border-gold shadow-lg" : "border-gold-light/20"}`}>
                  {p.popular && <span className="inline-block bg-gold text-white text-xs px-4 py-1 rounded-full mb-3">人氣推薦</span>}
                  <p className="text-gold text-xs italic">{p.tier}</p>
                  <h3 className="font-serif-tc text-xl font-bold text-dark mt-1 mb-3">{p.name}</h3>
                  <div className="space-y-1.5 mb-4 inline-block text-left">
                    {p.items.map((item) => (
                      <div key={item} className="flex items-center gap-2 text-xs text-text-light">
                        <span className="w-1 h-1 bg-gold rounded-full inline-block flex-shrink-0" />{item}
                      </div>
                    ))}
                  </div>
                  <p className="font-serif-tc text-3xl text-gold font-bold">{p.price}</p>
                </div>
              </div>
            ))}
          </div>
          <button onClick={prev} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-white/80 rounded-full shadow border border-gold-light/30">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gold"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <button onClick={next} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-white/80 rounded-full shadow border border-gold-light/30">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gold"><path d="M9 18l6-6-6-6"/></svg>
          </button>
          <div className="flex justify-center gap-2 mt-6">
            {packages.map((_, i) => (
              <button key={i} onClick={() => setActive(i)} className={`h-2 rounded-full transition-all ${i === active ? "bg-gold w-6" : "bg-gold-light/40 w-2"}`} />
            ))}
          </div>
        </div>

        {/* Desktop grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-6">
          {packages.map((p) => (
            <div key={p.name} className={`bg-white p-8 rounded-2xl border text-center card-hover ${p.popular ? "border-gold shadow-lg" : "border-gold-light/20"}`}>
              {p.popular && <span className="inline-block bg-gold text-white text-xs px-4 py-1 rounded-full mb-3">人氣推薦</span>}
              <p className="text-gold text-xs italic">{p.tier}</p>
              <h3 className="font-serif-tc text-xl font-bold text-dark mt-1 mb-3">{p.name}</h3>
              <div className="space-y-2 mb-4 inline-block text-left">
                {p.items.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-text-light">
                    <span className="w-1 h-1 bg-gold rounded-full inline-block flex-shrink-0" />{item}
                  </div>
                ))}
              </div>
              <p className="font-serif-tc text-3xl text-gold font-bold">{p.price}</p>
            </div>
          ))}
        </div>

        <a href="/booking" className="inline-block mt-10 bg-gold text-white px-8 py-3 text-sm tracking-wide rounded-full hover:bg-dark-light transition-colors">
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
          <a href="/booking" className="inline-block bg-gold text-white px-10 py-3.5 text-sm tracking-wide rounded-full hover:bg-gold-light transition-colors">
            立即預約
          </a>
          <p className="text-white/20 text-xs mt-8">&copy; 2026 JY Beauty</p>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [page, setPage] = useState<Page>("home");

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
    <main>
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
  );
}
