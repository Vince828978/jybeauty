"use client";
import Image from "next/image";

const packages = [
  {
    id: "daily",
    tag: "輕享放鬆",
    name: "Daily Relax",
    desc: "適合忙碌生活中的短暫充電",
    items: ["精油按摩 90 分鐘", "快速補水護理"],
    label: "優惠價",
    price: 1880,
  },
  {
    id: "relax",
    tag: "放鬆舒壓",
    name: "沉浸式放鬆",
    desc: "",
    items: ["全身精油按摩 120 分鐘", "熱石深層舒壓", "頭部釋壓療程"],
    label: "優惠價",
    price: 2880,
  },
  {
    id: "body",
    tag: "纖體瘦身",
    name: "Body Line",
    desc: "線條感與輕盈感同步提升",
    items: ["循環代謝按摩", "筋膜放鬆", "小臉拉提護理"],
    label: "優惠價",
    price: 3280,
  },
  {
    id: "luxury",
    tag: "頂級奢華",
    name: "Luxury Glow",
    desc: "專屬放鬆儀式感",
    items: ["頂級精油按摩 120 分鐘", "臉部亮白嫩膚課程", "熱石＋頭療雙重享受"],
    label: "尊寵價",
    price: 4280,
  },
];

export default function ExperiencePage() {
  return (
    <div className="min-h-screen bg-dark">
      <div className="relative h-[35vh]">
        <Image src="/hero-main.jpg" alt="JY Beauty 體驗" fill className="object-cover object-top" />
        <div className="absolute inset-0 bg-dark/50" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gold-light text-xs tracking-[0.3em] uppercase mb-2">EXPERIENCE</p>
            <h1 className="font-serif-tc text-3xl font-bold text-white">體驗方案</h1>
          </div>
        </div>
      </div>

      <div className="max-w-sm md:max-w-3xl mx-auto px-6 py-8">
        <div className="space-y-6 md:grid md:grid-cols-2 md:gap-6 md:space-y-0">
          {packages.map((p) => (
            <div key={p.id} className="border border-gold/30 rounded-2xl p-6 text-center">
              <p className="text-gold text-xs tracking-wider mb-1">{p.tag}</p>
              <h3 className="text-white font-serif-tc text-xl font-bold mb-2">{p.name}</h3>
              {p.desc && <p className="text-white/50 text-xs mb-4">{p.desc}</p>}
              <div className="w-10 h-px bg-gold/40 mx-auto my-4" />
              <div className="space-y-2 mb-5">
                {p.items.map((item) => (
                  <p key={item} className="text-white/70 text-sm">▸ {item}</p>
                ))}
              </div>
              <p className="text-white/50 text-xs mb-1">{p.label}</p>
              <p className="text-gold font-serif-tc text-3xl font-bold">${p.price.toLocaleString()}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <a href="https://lin.ee/PeB8CkE" target="_blank"
            className="inline-block bg-gold text-white px-12 py-5 text-lg tracking-wide rounded-2xl font-medium active:bg-dark-light transition-colors">
            立即預約體驗
          </a>
          <p className="text-white/30 text-xs mt-4">LINE 預約 ｜ @jy.beauty</p>
          <a href="/" className="block text-white/30 text-sm mt-6">回首頁</a>
        </div>
      </div>
    </div>
  );
}
