"use client";
import Image from "next/image";

const experiences = [
  {
    id: "exp1",
    tag: "首次體驗推薦",
    name: "精油舒壓按摩",
    time: "90 min",
    desc: "全身精油舒壓按摩，釋放一整天的疲勞",
    bonus: "贈筋膜放鬆 或 頭療（二擇一）",
    price: 1380,
  },
  {
    id: "exp2",
    tag: "深層放鬆推薦",
    name: "精油按摩＋熱石",
    time: "120 min",
    desc: "深層精油按摩搭配熱石舒緩，解除肌肉深層緊繃",
    bonus: "贈筋膜放鬆 或 頭療（二擇一）",
    price: 2300,
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
            <p className="text-gold-light text-xs tracking-[0.3em] uppercase mb-2">FIRST EXPERIENCE</p>
            <h1 className="font-serif-tc text-3xl font-bold text-white">立即體驗</h1>
            <p className="text-white/60 text-sm mt-2">第一次來，用最好的價格感受專業</p>
          </div>
        </div>
      </div>

      {/* 冠 #4459 2026-05-30: 不再用固定 420px，桌面用 max-w-2xl，pb 留空白避免堆底 */}
      <div className="w-full max-w-2xl mx-auto px-6 md:px-10 py-10 pb-20">
        {/* 冠 #4412 2026-05-30: 兩個體驗方案間距加大，獨立感更強 */}
        <div className="space-y-14">
          {experiences.map((p) => {
            const expDur = parseInt(p.time) || 90;
            const url = `/booking?exp=${encodeURIComponent(p.name)}&dur=${expDur}&price=${p.price}`;
            return (
              <div key={p.id} className="border-2 border-gold/40 rounded-2xl overflow-hidden shadow-xl shadow-black/30">
                <div className="bg-gold/10 px-4 py-3 text-center">
                  <span className="text-gold text-xs tracking-wider font-medium">{p.tag}</span>
                </div>
                <div className="px-5 py-6 text-center">
                  <h3 className="text-white font-serif-tc text-2xl font-bold mb-1">{p.name}</h3>
                  <p className="text-gold-light text-sm mb-3">{p.time}</p>
                  <div className="w-10 h-px bg-gold/40 mx-auto my-4" />
                  <p className="text-white/70 text-sm mb-4">{p.desc}</p>
                  <div className="bg-gold/5 rounded-xl py-3 px-4 mb-5">
                    <p className="text-gold text-sm font-medium">🎁 {p.bonus}</p>
                  </div>
                  <p className="text-white/40 text-xs mb-1">體驗價</p>
                  <p className="text-gold font-serif-tc text-4xl font-bold mb-5">${p.price.toLocaleString()}</p>
                  {/* 冠 #4412: 按進去直接跳「選時間」，不再選服務 */}
                  <a href={url}
                    className="block w-full bg-gold text-white py-4 rounded-2xl text-lg font-medium tracking-wide active:bg-dark-light transition-colors">
                    立即預約
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center space-y-3">
          <p className="text-white/30 text-xs">身體＋臉部組合享 85 折</p>
          <a href="https://lin.ee/PeB8CkE" target="_blank"
            className="inline-block border border-gold/30 text-gold px-10 py-3 rounded-full text-sm tracking-wide active:bg-gold active:text-white transition-colors">
            LINE 諮詢
          </a>
          <a href="/" className="block text-white/30 text-sm mt-4">回首頁</a>
        </div>
      </div>
    </div>
  );
}
