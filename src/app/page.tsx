"use client";
import Image from "next/image";
import { useState, useEffect } from "react";


function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-warm-bg/90 backdrop-blur-md border-b border-gold-light/30">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-center">
        <a href="#" className="flex items-center">
          <Image src="/logo.svg" alt="JY Beauty" width={160} height={80} className="h-14 w-auto" />
        </a>
      </div>
      <div className="hidden md:flex items-center justify-center gap-8 text-sm text-text-light pb-3">
        <a href="#about" className="hover:text-gold transition-colors">關於我們</a>
        <a href="#services" className="hover:text-gold transition-colors">療程服務</a>
        <a href="#why" className="hover:text-gold transition-colors">為什麼選擇我們</a>
        <a href="/booking" className="hover:text-gold transition-colors">聯繫預約</a>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-24 pb-12">
      <div className="hero-gradient absolute inset-0" />
      <div className="relative max-w-6xl mx-auto px-16 md:px-20 lg:px-24 grid md:grid-cols-2 gap-12 items-center">
        <div className="fade-in order-2 md:order-1">
          <p className="text-gold text-sm tracking-[0.3em] uppercase mb-4">RELAX · RENEW · RADIATE</p>
          <h1 className="font-serif-tc text-3xl md:text-5xl lg:text-6xl font-bold text-dark leading-tight mb-6">
            美麗・放鬆<br /><span className="text-gold">從 JY Beauty 開始</span>
          </h1>
          <p className="text-text-light text-base md:text-lg leading-relaxed mb-8 max-w-lg">
            不必出門，專業到家。我們把最好的 SPA 帶到你身邊，在你最放鬆的空間，享受專屬一對一的療癒時光。
          </p>
          <div className="flex flex-row gap-4">
            <a href="/booking" className="bg-gold text-white px-6 py-3.5 text-center text-sm tracking-wide hover:bg-dark-light transition-colors rounded-full">預約到府服務</a>
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
    <section id="about" className="bg-white">
      <div className="relative h-[350px] md:h-[500px]">
        <Image src="/about.jpg" alt="JY Beauty 美容師" fill className="object-cover object-top" />
      </div>
      <div className="max-w-md md:max-w-3xl mx-auto px-10 py-10">
        <div className="text-center mb-6">
          <p className="text-gold text-sm tracking-[0.3em] uppercase mb-2">ABOUT US</p>
          <h2 className="font-serif-tc text-2xl md:text-4xl font-bold text-dark">把 SPA 帶到你身邊</h2>
        </div>
        {/* Mobile: expandable / Desktop: always show */}
        <div className="md:hidden">
          <Expandable title="品牌故事">
            <div className="space-y-3 text-text-light leading-relaxed text-sm text-center">
              <p>做美容這些年，看過太多客人做完療程一出門，那份放鬆在回家路上就消失了一半。</p>
              <p className="font-medium text-dark">所以我決定，不開店，我去找你。</p>
              <p>專業設備帶在身上，到你家佈置一個專屬的 SPA 空間。這段時間，完全是你的。</p>
            </div>
          </Expandable>
          <Expandable title="專業資歷">
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm text-text-light text-center">
              <span>美容丙乙級證照</span>
              <span>美容 SPA 經驗 15 年</span>
              <span>資深美容顧問</span>
              <span>孕婦按摩培訓</span>
              <span>漂眉 / 韓式霧唇培訓</span>
              <span>手腳深層護理</span>
              <span>火罐 / 運動拉筋放鬆</span>
            </div>
          </Expandable>
        </div>
        <div className="hidden md:block text-center">
          <div className="section-divider mb-8" />
          <div className="space-y-4 text-text-light leading-relaxed">
            <p>做美容這些年，看過太多客人拖著疲憊的身體來到店裡，做完療程整個人放鬆了，結果一出門又要擠捷運、找車位，那份放鬆在回家路上就消失了一半。</p>
            <p>我一直在想，如果做完就能直接躺在自己的床上，蓋著自己最喜歡的被子，那才是真正完整的放鬆。</p>
            <p className="font-medium text-dark">所以我決定，不開店，我去找你。</p>
            <p>專業設備帶在身上——精油、美容床、毛巾、音樂，到你家佈置一個專屬的 SPA 空間。你不用出門、不用趕時間、不用跟別人共用空間。這段時間，完全是你的。</p>
          </div>
          <div className="mt-8 pt-8 border-t border-gold-light/30">
            <p className="text-gold text-sm tracking-wide mb-4 font-medium">專業資歷</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3 text-sm text-text-light">
              <span>美容丙乙級證照</span><span>美容 SPA 經驗 15 年</span><span>資深美容顧問</span><span>孕婦按摩培訓</span>
              <span>漂眉 / 韓式霧唇培訓</span><span>手腳深層護理</span><span>火罐 / 運動拉筋放鬆</span>
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
      <div className="max-w-6xl mx-auto px-16 md:px-20 lg:px-24">
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

      </div>
    </section>
  );
}

function Expandable({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gold-light/20">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-5 text-left">
        <h3 className="font-serif-tc text-lg font-semibold text-dark">{title}</h3>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          className={`text-gold transition-transform duration-300 flex-shrink-0 ${open ? "rotate-180" : ""}`}>
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>
      <div className={`overflow-hidden transition-all duration-500 ${open ? "max-h-[2000px] opacity-100 pb-6" : "max-h-0 opacity-0"}`}>
        {children}
      </div>
    </div>
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
      <div className="md:hidden mb-12 mt-10">
        <div className="relative px-2">
          <div className="relative min-h-[280px]">
            {packages.map((p, i) => (
              <div
                key={p.name}
                className={`absolute inset-0 transition-all duration-500 ${i === active ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none"}`}
              >
                <div className={`bg-white px-6 py-6 rounded-2xl border text-center ${p.popular ? "border-gold shadow-lg" : "border-gold-light/20"}`}>
                  {p.popular && <div className="inline-block bg-gold text-white text-xs px-4 py-1 tracking-wide rounded-full mb-2">人氣推薦</div>}
                  <p className="text-gold text-sm italic mb-1">{p.tier}</p>
                  <h3 className="font-serif-tc text-xl font-bold text-dark mb-1">{p.name}</h3>
                  <p className="text-text-light text-xs mb-3">{p.subtitle}</p>
                  <div className="space-y-1.5 mb-3 inline-block text-left">
                    {p.items.map((item) => (
                      <div key={item} className="flex items-center gap-2 text-sm text-dark">
                        <span className="w-1.5 h-1.5 bg-gold rounded-full inline-block flex-shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                  <p className="font-serif-tc text-3xl text-gold font-bold mb-1">{p.price}</p>
                  <p className="text-text-light text-xs">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <button onClick={prev} className="absolute -left-1 top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center bg-white/80 rounded-full shadow-md border border-gold-light/30">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gold"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <button onClick={next} className="absolute -right-1 top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center bg-white/80 rounded-full shadow-md border border-gold-light/30">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gold"><path d="M9 18l6-6-6-6"/></svg>
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
          <div key={p.name} className={`bg-white p-10 card-hover border rounded-2xl text-center flex flex-col justify-between min-h-[420px] ${p.popular ? "border-gold shadow-lg" : "border-gold-light/20"}`}>
            <div>
              {p.popular && <div className="inline-block bg-gold text-white text-xs px-4 py-1 tracking-wide rounded-full mb-2">人氣推薦</div>}
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
  const items = [
    { title: "到府服務", desc: "不用出門、不用找停車位，在最放鬆的私人空間享受專業護理" },
    { title: "一對一專屬", desc: "預約制服務，時間完全配合你，不趕場、不共用空間" },
    { title: "專業品質", desc: "使用高品質精油與專業設備，每一次療程都是頂級享受" },
    { title: "完整放鬆", desc: "服務完直接在家休息，讓放鬆延續到入睡，不被通勤打斷" },
  ];
  return (
    <section id="why" className="py-16 md:py-24 bg-white">
      <div className="max-w-md md:max-w-3xl mx-auto px-10 lg:px-12 text-center">
        <p className="text-gold text-sm tracking-[0.3em] uppercase mb-3">WHY JY BEAUTY</p>
        <h2 className="font-serif-tc text-2xl md:text-4xl font-bold text-dark mb-4">為什麼選擇我們</h2>
        <p className="text-text-light text-sm md:text-base leading-relaxed mb-6">
          最好的 SPA 空間，就是你最放鬆的地方。
        </p>
        {/* Mobile: expandable items */}
        <div className="md:hidden text-left">
          {items.map((item) => (
            <Expandable key={item.title} title={item.title}>
              <p className="text-text-light text-sm leading-relaxed text-center">{item.desc}</p>
            </Expandable>
          ))}
        </div>
        {/* Desktop: show all */}
        <div className="hidden md:grid md:grid-cols-4 gap-8 mt-10">
          {items.map((item) => (
            <div key={item.title} className="text-center">
              <h3 className="font-serif-tc text-lg font-semibold text-dark mb-2">{item.title}</h3>
              <p className="text-text-light text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TargetAudience() {
  const tags = ["新手媽媽", "孕婦產後", "忙碌上班族", "準新娘", "孝親禮物", "居家工作者", "輪班工作者", "銀髮族"];
  return (
    <section className="py-24 bg-cream/50">
      <div className="max-w-md md:max-w-3xl mx-auto px-10 lg:px-12 text-center">
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
      <div className="max-w-6xl mx-auto px-16 md:px-20 lg:px-24">
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
      <div className="max-w-6xl mx-auto px-16 md:px-20 lg:px-24 grid md:grid-cols-2 gap-12 md:gap-16 items-center">
        <div className="text-center md:text-left">
          <p className="text-gold text-sm tracking-[0.3em] uppercase mb-3">BOOKING</p>
          <h2 className="font-serif-tc text-3xl md:text-4xl font-bold text-dark mb-6">預約你的放鬆時光</h2>
          <div className="section-divider mb-8" />
          <p className="text-text-light leading-relaxed mb-8">透過 LINE 預約，我們會在確認後與你聯繫，了解你的需求，為你安排最適合的療程。</p>
          <div className="space-y-5 mb-8">
            <div className="flex items-center gap-4"><span className="w-10 h-10 bg-cream flex items-center justify-center rounded-full flex-shrink-0"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gold"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></span><div><p className="text-sm text-text-light">LINE 預約</p><p className="font-medium text-dark">點擊下方按鈕加入好友</p></div></div>
            <div className="flex items-center gap-4"><span className="w-10 h-10 bg-cream flex items-center justify-center rounded-full flex-shrink-0"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gold"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg></span><div><p className="text-sm text-text-light">服務時間</p><p className="font-medium text-dark">預約制，配合您的時間</p></div></div>
            <div className="flex items-center gap-4"><span className="w-10 h-10 bg-cream flex items-center justify-center rounded-full flex-shrink-0"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gold"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></span><div><p className="text-sm text-text-light">服務方式</p><p className="font-medium text-dark">專業到府服務</p></div></div>
          </div>
          <a href="#" className="inline-block bg-gold text-white px-10 py-4 text-lg tracking-wide hover:bg-dark-light transition-colors">LINE 立即預約</a>
        </div>
        <div className="relative h-[450px] md:h-[500px]">
          <Image src="/hero-1.jpg" alt="JY Beauty 預約" fill className="object-cover object-top" />
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-dark text-white/60 py-12">
      <div className="max-w-6xl mx-auto px-16 md:px-20 lg:px-24 text-center">
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
