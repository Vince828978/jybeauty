"use client";
import Image from "next/image";
import { useState, useEffect } from "react";

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-warm-bg/90 backdrop-blur-md border-b border-gold-light/30">
      <div className="flex items-center justify-center py-3">
        <a href="#">
          <Image src="/logo.svg" alt="JY Beauty" width={160} height={80} className="h-14 w-auto" />
        </a>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative h-screen">
      <Image src="/hero-main.jpg" alt="JY Beauty" fill className="object-cover object-top" priority />
      <div className="absolute inset-0 bg-gradient-to-t from-dark/60 via-transparent to-warm-bg/30" />
      <div className="absolute bottom-0 left-0 right-0 pb-20 px-8 text-center">
        <p className="text-gold-light text-xs tracking-[0.4em] uppercase mb-3">RELAX · RENEW · RADIATE</p>
        <h1 className="font-serif-tc text-3xl md:text-5xl font-bold text-white leading-tight mb-4">
          美麗・放鬆<br />從 JY Beauty 開始
        </h1>
        <p className="text-white/80 text-sm mb-8 max-w-xs mx-auto">
          私人到府 SPA，在你最放鬆的空間享受專屬療程
        </p>
        <a href="/booking" className="inline-block bg-gold text-white px-8 py-3 text-sm tracking-wide rounded-full hover:bg-dark-light transition-colors">
          預約體驗
        </a>
      </div>
    </section>
  );
}

function About() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-sm md:max-w-2xl mx-auto px-8 text-center">
        <p className="text-gold text-xs tracking-[0.3em] uppercase mb-4">ABOUT US</p>
        <h2 className="font-serif-tc text-2xl md:text-3xl font-bold text-dark mb-6">
          不開店，我去找你
        </h2>
        <p className="text-text-light text-sm leading-loose mb-8">
          我們相信，最好的 SPA 空間就是你最放鬆的地方。<br />
          專業設備到府，給你完整不被打斷的療癒時光。
        </p>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-text-light">
          <span>美容丙乙級證照</span>
          <span>·</span>
          <span>15 年經驗</span>
          <span>·</span>
          <span>孕婦按摩培訓</span>
        </div>
      </div>
    </section>
  );
}

function AboutImage() {
  return (
    <section>
      <div className="relative h-[60vh]">
        <Image src="/about.jpg" alt="JY Beauty 美容師" fill className="object-cover object-top" />
      </div>
    </section>
  );
}

function PackageCarousel() {
  const packages = [
    { tier: "Basic", name: "舒壓放鬆套餐", price: "$2,280", highlight: "精油按摩 60min + 臉部基礎護理" },
    { tier: "Popular", name: "能量煥膚套餐", price: "$3,480", highlight: "精油按摩 90min + 深層護理 + 加項1項", popular: true },
    { tier: "Luxury", name: "極致寵愛套餐", price: "$4,880", highlight: "精油按摩 120min + 深層護理 + 加項3項" },
  ];
  const [active, setActive] = useState(1);
  const prev = () => setActive((p) => (p - 1 + packages.length) % packages.length);
  const next = () => setActive((p) => (p + 1) % packages.length);

  return (
    <section className="py-20 bg-cream/50">
      <div className="max-w-sm md:max-w-4xl mx-auto px-8 text-center">
        <p className="text-gold text-xs tracking-[0.3em] uppercase mb-4">TREATMENTS</p>
        <h2 className="font-serif-tc text-2xl md:text-3xl font-bold text-dark mb-10">療程方案</h2>

        {/* Mobile carousel */}
        <div className="md:hidden relative">
          <div className="relative min-h-[220px] mx-6">
            {packages.map((p, i) => (
              <div key={p.name} className={`absolute inset-0 transition-all duration-500 ${i === active ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none"}`}>
                <div className={`bg-white px-6 py-8 rounded-2xl border text-center ${p.popular ? "border-gold shadow-lg" : "border-gold-light/20"}`}>
                  {p.popular && <span className="inline-block bg-gold text-white text-xs px-4 py-1 rounded-full mb-3">人氣推薦</span>}
                  <p className="text-gold text-xs italic">{p.tier}</p>
                  <h3 className="font-serif-tc text-xl font-bold text-dark mt-1 mb-2">{p.name}</h3>
                  <p className="text-text-light text-xs mb-4">{p.highlight}</p>
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
              <h3 className="font-serif-tc text-xl font-bold text-dark mt-1 mb-2">{p.name}</h3>
              <p className="text-text-light text-xs mb-4">{p.highlight}</p>
              <p className="font-serif-tc text-3xl text-gold font-bold">{p.price}</p>
            </div>
          ))}
        </div>

        <a href="/booking" className="inline-block mt-10 border border-gold text-gold px-8 py-3 text-sm tracking-wide rounded-full hover:bg-gold hover:text-white transition-colors">
          查看完整療程 →
        </a>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-sm md:max-w-3xl mx-auto px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { label: "到府服務", sub: "專業到家" },
            { label: "一對一", sub: "專屬時光" },
            { label: "15年經驗", sub: "專業品質" },
            { label: "完整放鬆", sub: "不被打斷" },
          ].map((f) => (
            <div key={f.label}>
              <p className="font-serif-tc text-lg text-dark font-semibold">{f.label}</p>
              <p className="text-text-light text-xs mt-1">{f.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function GalleryImage() {
  return (
    <section>
      <div className="relative h-[50vh]">
        <Image src="/hero-1.jpg" alt="JY Beauty" fill className="object-cover object-top" />
      </div>
    </section>
  );
}

function Booking() {
  return (
    <section className="py-20 bg-dark text-white text-center">
      <div className="max-w-sm mx-auto px-8">
        <p className="text-gold-light text-xs tracking-[0.3em] uppercase mb-4">BOOKING</p>
        <h2 className="font-serif-tc text-2xl font-bold mb-4">預約你的放鬆時光</h2>
        <p className="text-white/60 text-sm leading-relaxed mb-8">
          首次預約享 85 折優惠<br />推薦好友雙方皆享加值升級
        </p>
        <a href="/booking" className="inline-block bg-gold text-white px-10 py-3.5 text-sm tracking-wide rounded-full hover:bg-gold-light transition-colors">
          立即預約
        </a>
        <p className="text-white/40 text-xs mt-6">LINE 預約 ｜ @jy.beauty</p>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-dark text-white/50 py-10 border-t border-white/10">
      <div className="text-center">
        <p className="font-serif-tc text-lg text-white mb-1"><span className="text-gold">JY</span> Beauty</p>
        <p className="text-xs tracking-wide">美麗・放鬆・從 JY Beauty 開始</p>
        <p className="text-xs mt-4">&copy; 2026 JY Beauty</p>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <About />
      <AboutImage />
      <PackageCarousel />
      <Features />
      <GalleryImage />
      <Booking />
      <Footer />
    </main>
  );
}
