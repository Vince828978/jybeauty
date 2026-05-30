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
        {/* 冠 #4505 2026-05-30: 兩方案中間插「── 或 ──」明顯分隔 + 卡片加深底色 */}
        <div>
          {experiences.map((p, idx) => {
            const expDur = parseInt(p.time) || 90;
            const url = `/booking?exp=${encodeURIComponent(p.name)}&dur=${expDur}&price=${p.price}`;
            return (
              <div key={p.id}>
                {idx > 0 && (
                  <div className="flex items-center gap-4 my-16 px-2">
                    <div className="flex-1 h-px bg-gold/30"></div>
                    <span className="text-gold/60 text-sm tracking-[0.3em] uppercase">OR</span>
                    <div className="flex-1 h-px bg-gold/30"></div>
                  </div>
                )}
                <div className="border-2 border-gold/50 rounded-2xl overflow-hidden shadow-2xl shadow-black/50 bg-black/40">
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
              </div>
            );
          })}
        </div>

        {/* 冠 #4492 2026-05-30: LINE 諮詢 + 回首頁 兩按鈕加大、拉開、好按 */}
        <div className="mt-16 text-center space-y-8">
          <p className="text-white/40 text-sm">身體＋臉部組合享 85 折</p>
          <a href="https://lin.ee/PeB8CkE" target="_blank"
            className="inline-block border-2 border-gold/40 text-gold px-14 py-5 rounded-full text-base font-medium tracking-wide active:bg-gold active:text-white transition-colors">
            💬 LINE 諮詢
          </a>
          {/* 冠 #4511: 回首頁拉成跟卡片同寬，不留右邊空白 */}
          <a href="/" className="block w-full border border-white/20 text-white/60 py-5 rounded-2xl text-base tracking-wide active:bg-white/10 transition-colors">
            ← 回首頁
          </a>
        </div>
      </div>
    </div>
  );
}
