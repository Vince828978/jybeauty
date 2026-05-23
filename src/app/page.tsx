import Image from "next/image";

const BASE = "/jybeauty";

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-warm-bg/90 backdrop-blur-md border-b border-gold-light/30">
      <div className="max-w-6xl mx-auto px-8 lg:px-12 py-4 flex items-center justify-between">
        <a href="#" className="font-serif-tc text-2xl font-bold text-dark tracking-wider">
          <span className="text-gold">JY</span> Beauty
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
    <section className="relative min-h-screen flex items-center pt-20">
      <div className="hero-gradient absolute inset-0" />
      <div className="relative max-w-6xl mx-auto px-8 lg:px-12 grid md:grid-cols-2 gap-12 items-center">
        <div className="fade-in">
          <p className="text-gold text-sm tracking-[0.3em] uppercase mb-4">RELAX · RENEW · RADIATE</p>
          <h1 className="font-serif-tc text-4xl md:text-5xl lg:text-6xl font-bold text-dark leading-tight mb-6">
            美麗・放鬆<br /><span className="text-gold">從 JY Beauty 開始</span>
          </h1>
          <p className="text-text-light text-lg leading-relaxed mb-8 max-w-lg">
            不必出門，專業到家。我們把最好的 SPA 帶到你身邊，在你最放鬆的空間，享受專屬一對一的療癒時光。
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="#contact" className="bg-gold text-white px-8 py-3.5 text-center tracking-wide hover:bg-dark-light transition-colors">預約到府服務</a>
            <a href="#services" className="border border-gold text-gold px-8 py-3.5 text-center tracking-wide hover:bg-gold hover:text-white transition-colors">瀏覽療程</a>
          </div>
        </div>
        <div className="relative h-[500px] md:h-[600px]">
          <Image src={`${BASE}/hero-main.jpg`} alt="JY Beauty" fill className="object-cover object-top" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-warm-bg/30 to-transparent" />
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="about" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-8 lg:px-12 grid md:grid-cols-2 gap-16 items-center">
        <div className="relative h-[500px]">
          <Image src={`${BASE}/about.jpg`} alt="JY Beauty 美容師" fill className="object-cover object-top" />
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
      <div className="max-w-6xl mx-auto px-8 lg:px-12">
        <div className="text-center mb-16">
          <p className="text-gold text-sm tracking-[0.3em] uppercase mb-3">TREATMENTS</p>
          <h2 className="font-serif-tc text-3xl md:text-4xl font-bold text-dark mb-4">療癒時光・專屬於你</h2>
          <div className="section-divider mb-6" />
          <p className="text-text-light max-w-xl mx-auto">3 種精選套餐，打造最美的自己</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {packages.map((p) => (
            <div key={p.name} className={`bg-white p-8 card-hover border relative ${p.popular ? "border-gold shadow-lg" : "border-gold-light/20"}`}>
              {p.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-white text-xs px-4 py-1 tracking-wide">人氣推薦</div>}
              <p className="text-gold text-sm italic mb-1">{p.tier}</p>
              <h3 className="font-serif-tc text-xl font-bold text-dark mb-1">{p.name}</h3>
              <p className="text-text-light text-xs mb-6">{p.subtitle}</p>
              <div className="space-y-2 mb-6">
                {p.items.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-dark">
                    <span className="w-1.5 h-1.5 bg-gold rounded-full inline-block" />
                    {item}
                  </div>
                ))}
              </div>
              <p className="font-serif-tc text-3xl text-gold font-bold mb-3">{p.price}</p>
              <p className="text-text-light text-xs">{p.desc}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div>
            <h3 className="font-serif-tc text-lg text-dark mb-4 flex items-center gap-3"><span className="w-6 h-px bg-gold inline-block" />身體加項（任選）</h3>
            <div className="bg-white border border-gold-light/20 divide-y divide-gold-light/10">
              {bodyAddons.map((a) => (
                <div key={a.name} className="flex items-center justify-between px-6 py-4 hover:bg-cream/30 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gold rounded-full inline-block" />
                    <span className="text-dark text-sm">{a.name}</span>
                    {a.dur && <span className="text-text-light text-xs">{a.dur}</span>}
                  </div>
                  <span className="font-serif-tc text-gold font-semibold">{a.price}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-serif-tc text-lg text-dark mb-4 flex items-center gap-3"><span className="w-6 h-px bg-gold inline-block" />臉部加項（任選）</h3>
            <div className="bg-white border border-gold-light/20 divide-y divide-gold-light/10">
              {faceAddons.map((a) => (
                <div key={a.name} className="flex items-center justify-between px-6 py-4 hover:bg-cream/30 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gold rounded-full inline-block" />
                    <span className="text-dark text-sm">{a.name}</span>
                    {a.dur && <span className="text-text-light text-xs">{a.dur}</span>}
                  </div>
                  <span className="font-serif-tc text-gold font-semibold">{a.price}</span>
                </div>
              ))}
            </div>
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

function WhyUs() {
  const reasons = [
    { icon: "🏠", title: "到府服務", desc: "不用出門、不用找停車位，在最放鬆的私人空間享受專業護理" },
    { icon: "👩‍⚕️", title: "一對一專屬", desc: "預約制服務，時間完全配合你，不趕場、不共用空間" },
    { icon: "✨", title: "專業品質", desc: "使用高品質精油與專業設備，每一次療程都是頂級享受" },
    { icon: "💝", title: "完整放鬆", desc: "服務完直接在家休息，讓放鬆延續到入睡，不被通勤打斷" },
  ];
  return (
    <section id="why" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-8 lg:px-12">
        <div className="text-center mb-16">
          <p className="text-gold text-sm tracking-[0.3em] uppercase mb-3">WHY JY BEAUTY</p>
          <h2 className="font-serif-tc text-3xl md:text-4xl font-bold text-dark mb-4">為什麼選擇我們</h2>
          <div className="section-divider mb-6" />
          <p className="text-text-light max-w-xl mx-auto">我們選擇不開店，不是因為還沒準備好，而是我們相信——<br /><span className="font-medium text-dark">最好的 SPA 空間，就是你最放鬆的地方</span></p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {reasons.map((r) => (
            <div key={r.title} className="text-center p-8 bg-cream/30 card-hover border border-gold-light/10">
              <div className="text-4xl mb-4">{r.icon}</div>
              <h3 className="font-serif-tc text-lg font-semibold text-dark mb-3">{r.title}</h3>
              <p className="text-text-light text-sm leading-relaxed">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TargetAudience() {
  const audiences = [
    { icon: "👶", label: "新手媽媽", desc: "帶小孩不方便出門，在家就能享受放鬆" },
    { icon: "🤰", label: "孕婦產後", desc: "孕期舒緩、產後修復，不必舟車勞頓" },
    { icon: "💼", label: "忙碌上班族", desc: "下班回家就是 SPA，時間最高效利用" },
    { icon: "👰", label: "準新娘", desc: "婚前密集保養，在家輕鬆變美" },
    { icon: "👨‍👩‍👧", label: "孝親禮物", desc: "送給爸媽最貼心的到府按摩體驗" },
    { icon: "💻", label: "居家工作者", desc: "會議結束關螢幕，美容師已到門口" },
  ];
  return (
    <section className="py-24 bg-cream/50">
      <div className="max-w-6xl mx-auto px-8 lg:px-12">
        <div className="text-center mb-16">
          <p className="text-gold text-sm tracking-[0.3em] uppercase mb-3">FOR YOU</p>
          <h2 className="font-serif-tc text-3xl md:text-4xl font-bold text-dark mb-4">專為你設計的服務</h2>
          <div className="section-divider mb-6" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {audiences.map((a) => (
            <div key={a.label} className="bg-white p-6 text-center card-hover border border-gold-light/10">
              <div className="text-3xl mb-3">{a.icon}</div>
              <h4 className="font-serif-tc font-semibold text-dark mb-2">{a.label}</h4>
              <p className="text-text-light text-sm">{a.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SpecialOffers() {
  return (
    <section className="py-24 bg-dark text-white">
      <div className="max-w-6xl mx-auto px-8 lg:px-12">
        <div className="text-center mb-12">
          <p className="text-gold-light text-sm tracking-[0.3em] uppercase mb-3">SPECIAL OFFER</p>
          <h2 className="font-serif-tc text-3xl md:text-4xl font-bold mb-4">首次體驗優惠</h2>
          <div className="w-16 h-0.5 bg-gold mx-auto" />
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center p-8 border border-gold/30"><div className="text-3xl mb-4">🎁</div><h4 className="font-serif-tc text-lg font-semibold mb-2">首次來店禮</h4><p className="text-white/70 text-sm">首次預約任一主療程享 85 折優惠</p></div>
          <div className="text-center p-8 border border-gold/30"><div className="text-3xl mb-4">🕐</div><h4 className="font-serif-tc text-lg font-semibold mb-2">預約制服務</h4><p className="text-white/70 text-sm">給您專屬的寧靜時光，不趕場不等待</p></div>
          <div className="text-center p-8 border border-gold/30"><div className="text-3xl mb-4">💕</div><h4 className="font-serif-tc text-lg font-semibold mb-2">推薦好友</h4><p className="text-white/70 text-sm">雙方皆享一次加值項目免費升級</p></div>
        </div>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-8 lg:px-12 grid md:grid-cols-2 gap-16 items-center">
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
        <div className="relative h-[500px]">
          <Image src={`${BASE}/hero-2.jpg`} alt="JY Beauty 預約" fill className="object-cover object-top" />
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-dark text-white/60 py-12">
      <div className="max-w-6xl mx-auto px-8 lg:px-12 text-center">
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
