"use client";
import Image from "next/image";
import { useState, useEffect } from "react";


function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-warm-bg/90 backdrop-blur-md border-b border-gold-light/30">
      <div className="max-w-6xl mx-auto px-6 md:px-8 lg:px-12 py-4 flex items-center justify-between">
        <a href="#" className="flex items-center">
          <Image src="/logo.svg" alt="JY Beauty" width={120} height={60} className="h-10 w-auto" />
        </a>
        <div className="hidden md:flex items-center gap-8 text-sm text-text-light">
          <a href="#about" className="hover:text-gold transition-colors">關於我們</a>
          <a href="#services" className="hover:text-gold transition-colors">療程服務</a>
          <a href="#why" className="hover:text-gold transition-colors">為什麼選擇我們</a>
          <a href="#contact" className="hover:text-gold transition-colors">聯繫預約</a>
        </div>
        <a href="#contact" className="bg-gold text-white px-5 py-2 text-sm tracking-wide hover:bg-dark-light transition-colors">立即預約</a>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-24 pb-12">
      <div className="hero-gradient absolute inset-0" />
      <div className="relative max-w-6xl mx-auto px-10 md:px-12 lg:px-16 grid md:grid-cols-2 gap-12 items-center">
        <div className="fade-in order-2 md:order-1">
          <p className="text-gold text-sm tracking-[0.3em] uppercase mb-4">RELAX · RENEW · RADIATE</p>
          <h1 className="font-serif-tc text-3xl md:text-5xl lg:text-6xl font-bold text-dark leading-tight mb-6">
            美麗・放鬆<br /><span className="text-gold">從 JY Beauty 開始</span>
          </h1>
          <p className="text-text-light text-base md:text-lg leading-relaxed mb-8 max-w-lg">
            不必出門，專業到家。我們把最好的 SPA 帶到你身邊，在你最放鬆的空間，享受專屬一對一的療癒時光。
          </p>
          <div className="flex flex-row gap-4">
            <a href="#contact" className="bg-gold text-white px-6 py-3.5 text-center text-sm tracking-wide hover:bg-dark-light transition-colors rounded-full">預約到府服務</a>
            <a href="#services" className="border border-gold text-gold px-6 py-3.5 text-center text-sm tracking-wide hover:bg-gold hover:text-white transition-colors rounded-full">瀏覽療程</a>
          </div>
        </div>
        <div className="relative h-[300px] md:h-[600px] order-1 md:order-2">
          <Image src="/hero-main.jpg" alt="JY Beauty" fill className="object-cover object-top" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-warm-bg/30 to-transparent" />
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="about" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-10 md:px-12 lg:px-16 grid md:grid-cols-2 gap-12 md:gap-16 items-center">
        <div className="relative h-[350px] md:h-[500px]">
          <Image src="/about.jpg" alt="JY Beauty 美容師" fill className="object-cover object-top" />
        </div>
        <div>
          <p className="text-gold text-sm tracking-[0.3em] uppercase mb-3">ABOUT US</p>
          <h2 className="font-serif-tc text-3xl md:text-4xl font-bold text-dark mb-6">把 SPA 帶到你身邊</h2>
          <div className="section-divider mb-8 !ml-0" />
          <div className="space-y-4 text-text-light leading-relaxed">
            <p>做美容這些年，看過太多客人拖著疲憊的身體來到店裡，做完療程整個人放鬆了，結果一出門又要擠捷運、找車位，那份放鬆在回家路上就消失了一半。</p>
            <p>我一直在想，如果做完就能直接躺在自己的床上，蓋著自己最喜歡的被子，那才是真正完整的放鬆。</p>
            <p className="font-medium text-dark">所以我決定，不開店，我去找你。</p>
            <p>專業設備帶在身上——精油、美容床、毛巾、音樂，到你家佈置一個專屬的 SPA 空間。你不用出門、不用趕時間、不用跟別人共用空間。這段時間，完全是你的。</p>
          </div>
          <div className="mt-8 pt-8 border-t border-gold-light/30">
            <p className="text-gold text-sm tracking-wide mb-4 font-medium">專業資歷</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-text-light">
              <span>美容丙乙級證照</span>
              <span>美容 SPA 經驗 15 年</span>
              <span>資深美容顧問</span>
              <span>孕婦按摩培訓</span>
              <span>漂眉 / 韓式霧唇培訓</span>
              <span>手腳深層護理</span>
              <span>火罐 / 運動拉筋放鬆</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Services() {
  const packages = [
    {
      tier: "Basic",
      name: "舒壓放鬆套餐",
      subtitle: "放鬆身心・深層釋放",
      price: "$2,280",
      items: ["精油按摩 60 min", "臉部保養 基礎護理"],
      desc: "適合想要放鬆減壓、保養入門的你",
    },
    {
      tier: "Popular",
      name: "能量煥膚套餐",
      subtitle: "深層保養・由內而外透亮",
      price: "$3,480",
      items: ["精油按摩 90 min", "臉部保養 深層護理", "身體加項 任選 1 項"],
      desc: "適合想要深層保養、找回自信光采的你",
      popular: true,
    },
    {
      tier: "Luxury",
      name: "極致寵愛套餐",
      subtitle: "全方位呵護・極致寵愛",
      price: "$4,880",
      items: ["精油按摩 120 min", "臉部保養 深層護理", "身體加項 任選 2 項", "臉部加項 任選 1 項"],
      desc: "適合想要全方位寵愛自己、享受極致呵護的你",
    },
  ];
  const bodyAddons = [
    { name: "熱石", dur: "30min", price: "+$200" },
    { name: "刮痧/筋膜放鬆", dur: "30min", price: "+$300" },
    { name: "頭療（含耳燭）", dur: "30min", price: "+$400" },
    { name: "加乘體驗放鬆 UP", dur: "15min", price: "+$300" },
  ];
  const faceAddons = [
    { name: "Lulu SPA 美白去角質+敷體", dur: "40min", price: "+$600" },
    { name: "臉部瘦小臉", dur: "20min", price: "+$500" },
    { name: "細緻護理 緊緻拉提", dur: "", price: "+$500" },
    { name: "導入亮光 由內而外透亮", dur: "", price: "+$500" },
  ];

  return (
    <section id="services" className="py-24 bg-cream/50">
      <div className="max-w-6xl mx-auto px-10 md:px-12 lg:px-16">
        <div className="text-center mb-16">
          <p className="text-gold text-sm tracking-[0.3em] uppercase mb-3">TREATMENTS</p>
          <h2 className="font-serif-tc text-3xl md:text-4xl font-bold text-dark mb-4">療癒時光・專屬於你</h2>
          <div className="section-divider mb-6" />
          <p className="text-text-light max-w-xl mx-auto">3 種精選套餐，打造最美的自己</p>
        </div>

        <PackageCarousel packages={packages} />

        <div className="mb-10">
          <h3 className="font-serif-tc text-lg text-dark mb-1 text-center">身體加項</h3>
          <p className="text-text-light text-sm mb-6 text-center">（任選）</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {bodyAddons.map((a) => (
              <div key={a.name} className="bg-white border border-gold-light/20 rounded-xl p-5 text-center card-hover">
                <p className="text-dark text-sm font-medium mb-1">{a.name}</p>
                {a.dur && <p className="text-text-light text-xs mb-2">{a.dur}</p>}
                <p className="font-serif-tc text-gold font-semibold">{a.price}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-10">
          <h3 className="font-serif-tc text-lg text-dark mb-1 text-center">臉部加項</h3>
          <p className="text-text-light text-sm mb-6 text-center">（任選）</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {faceAddons.map((a) => (
              <div key={a.name} className="bg-white border border-gold-light/20 rounded-xl p-5 text-center card-hover">
                <p className="text-dark text-sm font-medium mb-1">{a.name}</p>
                {a.dur && <p className="text-text-light text-xs mb-2">{a.dur}</p>}
                <p className="font-serif-tc text-gold font-semibold">{a.price}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-text-light text-xs mt-6">服務皆含：舒壓放鬆・促進循環・深層釋放疲勞 ／ 依個人狀況調整手法與產品</p>

        <div className="mt-8 bg-white border border-gold-light/20 p-6">
          <h4 className="font-serif-tc text-dark font-semibold mb-3">到府服務費</h4>
          <div className="grid grid-cols-3 gap-4 text-sm text-text-light">
            <div className="text-center p-3 bg-cream/50"><p className="font-medium text-dark">市區 10km 內</p><p className="text-gold font-semibold mt-1">免收</p></div>
            <div className="text-center p-3 bg-cream/50"><p className="font-medium text-dark">郊區 10-20km</p><p className="text-gold font-semibold mt-1">+$200</p></div>
            <div className="text-center p-3 bg-cream/50"><p className="font-medium text-dark">遠程 20km+</p><p className="text-gold font-semibold mt-1">另議</p></div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SvgIcon({ d }: { d: string }) {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="text-gold mx-auto">
      <path d={d} />
    </svg>
  );
}

function PackageCarousel({ packages }: { packages: { tier: string; name: string; subtitle: string; price: string; items: string[]; desc: string; popular?: boolean }[] }) {
  const [active, setActive] = useState(1);
  const prev = () => setActive((p) => (p - 1 + packages.length) % packages.length);
  const next = () => setActive((p) => (p + 1) % packages.length);

  return (
    <>
      {/* Mobile carousel */}
      <div className="md:hidden mb-12 mt-8">
        <div className="relative flex items-center justify-center">
          <button onClick={prev} className="absolute left-0 z-10 w-10 h-10 flex items-center justify-center text-gold text-2xl">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <div className="w-[72vw] min-h-[340px] relative">
            {packages.map((p, i) => (
              <div
                key={p.name}
                className={`absolute inset-0 transition-all duration-500 ${i === active ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none"}`}
              >
                <div className={`bg-white p-7 rounded-2xl border text-center h-full flex flex-col justify-center items-center ${p.popular ? "border-gold shadow-lg" : "border-gold-light/20"}`}>
                  {p.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-white text-xs px-5 py-1.5 tracking-wide rounded-full">人氣推薦</div>}
                  <p className="text-gold text-sm italic mb-1">{p.tier}</p>
                  <h3 className="font-serif-tc text-2xl font-bold text-dark mb-1">{p.name}</h3>
                  <p className="text-text-light text-sm mb-4">{p.subtitle}</p>
                  <div className="space-y-2 mb-4 text-left">
                    {p.items.map((item) => (
                      <div key={item} className="flex items-center gap-3 text-sm text-dark">
                        <span className="w-1.5 h-1.5 bg-gold rounded-full inline-block flex-shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                  <p className="font-serif-tc text-4xl text-gold font-bold mb-2">{p.price}</p>
                  <p className="text-text-light text-xs leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <button onClick={next} className="absolute right-0 z-10 w-10 h-10 flex items-center justify-center text-gold text-2xl">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
        <div className="flex justify-center gap-3 mt-6">
          {packages.map((_, i) => (
            <button key={i} onClick={() => setActive(i)} className={`h-2.5 rounded-full transition-all ${i === active ? "bg-gold w-8" : "bg-gold-light w-2.5"}`} />
          ))}
        </div>
      </div>
      {/* Desktop grid */}
      <div className="hidden md:grid md:grid-cols-3 gap-8 mb-16">
        {packages.map((p) => (
          <div key={p.name} className={`bg-white p-10 card-hover border relative rounded-2xl text-center flex flex-col justify-between min-h-[420px] ${p.popular ? "border-gold shadow-lg" : "border-gold-light/20"}`}>
            {p.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-white text-xs px-5 py-1.5 tracking-wide rounded-full">人氣推薦</div>}
            <div>
              <p className="text-gold text-sm italic mb-2">{p.tier}</p>
              <h3 className="font-serif-tc text-2xl font-bold text-dark mb-2">{p.name}</h3>
              <p className="text-text-light text-sm mb-8">{p.subtitle}</p>
              <div className="space-y-3 mb-8 inline-block text-left">
                {p.items.map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm text-dark">
                    <span className="w-1.5 h-1.5 bg-gold rounded-full inline-block flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="font-serif-tc text-3xl text-gold font-bold mb-4">{p.price}</p>
              <p className="text-text-light text-sm leading-relaxed">{p.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function WhyUs() {
  return (
    <section id="why" className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-8 lg:px-12 text-center">
        <p className="text-gold text-sm tracking-[0.3em] uppercase mb-3">WHY JY BEAUTY</p>
        <h2 className="font-serif-tc text-3xl md:text-4xl font-bold text-dark mb-6">為什麼選擇我們</h2>
        <div className="section-divider mb-10" />
        <p className="text-text-light text-base md:text-lg leading-loose mb-10">
          我們選擇不開店，不是因為還沒準備好，而是我們相信——<br />
          <span className="font-medium text-dark font-serif-tc text-lg md:text-xl">最好的 SPA 空間，就是你最放鬆的地方。</span>
        </p>
        <div className="space-y-8 text-left max-w-2xl mx-auto">
          <div className="flex items-start gap-5">
            <span className="w-10 h-10 flex-shrink-0 border border-gold rounded-full flex items-center justify-center mt-0.5"><SvgIcon d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10" /></span>
            <div><h3 className="font-serif-tc text-lg font-semibold text-dark mb-1">到府服務</h3><p className="text-text-light text-sm leading-relaxed">不用出門、不用找停車位，在最放鬆的私人空間享受專業護理</p></div>
          </div>
          <div className="flex items-start gap-5">
            <span className="w-10 h-10 flex-shrink-0 border border-gold rounded-full flex items-center justify-center mt-0.5"><SvgIcon d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" /></span>
            <div><h3 className="font-serif-tc text-lg font-semibold text-dark mb-1">一對一專屬</h3><p className="text-text-light text-sm leading-relaxed">預約制服務，時間完全配合你，不趕場、不共用空間</p></div>
          </div>
          <div className="flex items-start gap-5">
            <span className="w-10 h-10 flex-shrink-0 border border-gold rounded-full flex items-center justify-center mt-0.5"><SvgIcon d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z" /></span>
            <div><h3 className="font-serif-tc text-lg font-semibold text-dark mb-1">專業品質</h3><p className="text-text-light text-sm leading-relaxed">使用高品質精油與專業設備，每一次療程都是頂級享受</p></div>
          </div>
          <div className="flex items-start gap-5">
            <span className="w-10 h-10 flex-shrink-0 border border-gold rounded-full flex items-center justify-center mt-0.5"><SvgIcon d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" /></span>
            <div><h3 className="font-serif-tc text-lg font-semibold text-dark mb-1">完整放鬆</h3><p className="text-text-light text-sm leading-relaxed">服務完直接在家休息，讓放鬆延續到入睡，不被通勤打斷</p></div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TargetAudience() {
  const tags = ["新手媽媽", "孕婦產後", "忙碌上班族", "準新娘", "孝親禮物", "居家工作者", "輪班工作者", "銀髮族"];
  return (
    <section className="py-24 bg-cream/50">
      <div className="max-w-3xl mx-auto px-8 lg:px-12 text-center">
        <p className="text-gold text-sm tracking-[0.3em] uppercase mb-3">FOR YOU</p>
        <h2 className="font-serif-tc text-3xl md:text-4xl font-bold text-dark mb-6">專為你設計的服務</h2>
        <div className="section-divider mb-10" />
        <p className="text-text-light text-base md:text-lg leading-loose mb-10">
          不方便出門的新手媽媽、需要孕期舒緩的準媽咪、<br className="hidden md:inline" />
          下班只想回家的上班族、婚前想密集保養的準新娘⋯⋯<br className="hidden md:inline" />
          <span className="font-medium text-dark">不管你是誰，放鬆這件事，我們帶到你身邊。</span>
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {tags.map((t) => (
            <span key={t} className="px-5 py-2.5 bg-white border border-gold-light/30 text-dark text-sm font-medium tracking-wide">{t}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

function SpecialOffers() {
  return (
    <section className="py-24 bg-dark text-white">
      <div className="max-w-6xl mx-auto px-10 md:px-12 lg:px-16">
        <div className="text-center mb-12">
          <p className="text-gold-light text-sm tracking-[0.3em] uppercase mb-3">SPECIAL OFFER</p>
          <h2 className="font-serif-tc text-3xl md:text-4xl font-bold mb-4">首次體驗優惠</h2>
          <div className="w-16 h-0.5 bg-gold mx-auto" />
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center p-8 border border-gold/30">
            <div className="mb-5"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="text-gold-light mx-auto"><path d="M20 12v10H4V12 M2 7h20v5H2z M12 22V7 M12 7H7.5a2.5 2.5 0 1 1 0-5C11 2 12 7 12 7z M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" /></svg></div>
            <h4 className="font-serif-tc text-lg font-semibold mb-2">首次來店禮</h4><p className="text-white/70 text-sm">首次預約任一主療程享 85 折優惠</p>
          </div>
          <div className="text-center p-8 border border-gold/30">
            <div className="mb-5"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="text-gold-light mx-auto"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg></div>
            <h4 className="font-serif-tc text-lg font-semibold mb-2">預約制服務</h4><p className="text-white/70 text-sm">給您專屬的寧靜時光，不趕場不等待</p>
          </div>
          <div className="text-center p-8 border border-gold/30">
            <div className="mb-5"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="text-gold-light mx-auto"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75" /></svg></div>
            <h4 className="font-serif-tc text-lg font-semibold mb-2">推薦好友</h4><p className="text-white/70 text-sm">雙方皆享一次加值項目免費升級</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-10 md:px-12 lg:px-16 grid md:grid-cols-2 gap-12 md:gap-16 items-center">
        <div>
          <p className="text-gold text-sm tracking-[0.3em] uppercase mb-3">BOOKING</p>
          <h2 className="font-serif-tc text-3xl md:text-4xl font-bold text-dark mb-6">預約你的放鬆時光</h2>
          <div className="section-divider mb-8 !ml-0" />
          <p className="text-text-light leading-relaxed mb-8">透過 LINE 預約，我們會在確認後與你聯繫，了解你的需求，為你安排最適合的療程。</p>
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-4"><span className="w-10 h-10 bg-cream flex items-center justify-center text-gold">📱</span><div><p className="text-sm text-text-light">LINE 預約</p><p className="font-medium text-dark">點擊下方按鈕加入好友</p></div></div>
            <div className="flex items-center gap-4"><span className="w-10 h-10 bg-cream flex items-center justify-center text-gold">⏰</span><div><p className="text-sm text-text-light">服務時間</p><p className="font-medium text-dark">預約制，配合您的時間</p></div></div>
            <div className="flex items-center gap-4"><span className="w-10 h-10 bg-cream flex items-center justify-center text-gold">📍</span><div><p className="text-sm text-text-light">服務方式</p><p className="font-medium text-dark">專業到府服務</p></div></div>
          </div>
          <a href="#" className="inline-block bg-gold text-white px-10 py-4 text-lg tracking-wide hover:bg-dark-light transition-colors">LINE 立即預約</a>
        </div>
        <div className="relative h-[350px] md:h-[500px]">
          <Image src="/hero-2.jpg" alt="JY Beauty 預約" fill className="object-cover object-top" />
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-dark text-white/60 py-12">
      <div className="max-w-6xl mx-auto px-10 md:px-12 lg:px-16 text-center">
        <p className="font-serif-tc text-2xl font-bold text-white mb-2"><span className="text-gold">JY</span> Beauty</p>
        <p className="text-sm mb-1">RELAX · RENEW · RADIATE</p>
        <p className="text-sm">美麗・放鬆・從 JY Beauty 開始</p>
        <div className="w-16 h-px bg-gold/30 mx-auto my-6" />
        <p className="text-xs">&copy; 2026 JY Beauty. All rights reserved.</p>
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
      <Services />
      <WhyUs />
      <TargetAudience />
      <SpecialOffers />
      <Contact />
      <Footer />
    </main>
  );
}
