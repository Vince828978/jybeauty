"use client";
import Image from "next/image";

// 肉包 #5036 2026-06-01: 「給辛苦的妳」品牌頁面 — 給每天努力的女性客戶
export default function DearYouPage() {
  return (
    <div className="min-h-screen bg-warm-bg">
      {/* Hero */}
      <div className="relative h-[55vh]">
        <Image
          src="/hero-main.jpg"
          alt="給辛苦的妳"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-dark/40 via-dark/30 to-warm-bg" />
        <div className="absolute inset-0 flex items-center justify-center px-6">
          <div className="text-center">
            <p className="text-gold-light text-xs tracking-[0.4em] uppercase mb-3">FOR YOU</p>
            <h1 className="font-serif-tc text-4xl sm:text-5xl text-white mb-4">給辛苦的妳</h1>
            <p className="text-white/80 text-base sm:text-lg leading-relaxed max-w-md mx-auto">
              妳已經為太多人努力了<br />
              是時候 對自己 溫柔一點
            </p>
          </div>
        </div>
      </div>

      {/* 共鳴段落 */}
      <section className="max-w-2xl mx-auto px-6 py-12">
        <div className="space-y-8">
          <div className="text-center">
            <p className="font-serif-tc text-2xl text-gold-dark leading-relaxed">
              清晨 6 點起床的妳<br />
              半夜還在回 LINE 的妳
            </p>
            <p className="text-warm-text/70 text-sm mt-4 leading-loose">
              是別人的女兒、太太、媽媽、同事<br />
              卻常常忘了 — 也是 <span className="text-gold-dark font-medium">妳自己</span>
            </p>
          </div>

          <div className="border-t border-gold-light/30 pt-8 text-center">
            <p className="font-serif-tc text-xl text-warm-text leading-relaxed">
              JY Beauty 為妳準備的<br />
              是 90 分鐘的「<span className="text-gold-dark">只屬於妳</span>」
            </p>
            <p className="text-warm-text/60 text-sm mt-4 leading-loose">
              手機關掉、孩子交給家人<br />
              這段時間 沒有人需要妳<br />
              只有妳 需要被好好對待
            </p>
          </div>
        </div>
      </section>

      {/* 三個感性切角 */}
      <section className="max-w-3xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
            <div className="text-3xl mb-3">🌸</div>
            <h3 className="font-serif-tc text-lg text-gold-dark mb-2">為妳卸下疲憊</h3>
            <p className="text-warm-text/70 text-sm leading-relaxed">
              不只是臉的疲憊<br />
              是肩、是腰、是心
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
            <div className="text-3xl mb-3">🕯️</div>
            <h3 className="font-serif-tc text-lg text-gold-dark mb-2">為妳安靜留白</h3>
            <p className="text-warm-text/70 text-sm leading-relaxed">
              不被打擾的 90 分鐘<br />
              不用想任何事
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
            <div className="text-3xl mb-3">💛</div>
            <h3 className="font-serif-tc text-lg text-gold-dark mb-2">為妳記得溫柔</h3>
            <p className="text-warm-text/70 text-sm leading-relaxed">
              妳每天對別人溫柔<br />
              這次換我們對妳溫柔
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-b from-warm-bg to-pink-50 py-16 px-6">
        <div className="max-w-md mx-auto text-center">
          <p className="font-serif-tc text-xl text-warm-text mb-2">妳，準備好了嗎？</p>
          <p className="text-warm-text/60 text-sm mb-8">第一次來，用最好的價格 感受被疼愛</p>
          <a
            href="/experience"
            className="inline-block bg-gold text-white px-12 py-4 text-lg tracking-wide rounded-2xl font-medium active:bg-gold-light transition-colors shadow-md"
          >
            立即預約 →
          </a>
          <div className="mt-6">
            <a href="/member" className="text-gold-dark text-sm underline">
              先加入會員，了解更多
            </a>
          </div>
        </div>
      </section>

      {/* 結尾 signature */}
      <section className="py-12 px-6 text-center">
        <p className="font-serif-tc text-warm-text/60 text-sm tracking-[0.2em]">
          — JY Beauty —
        </p>
        <p className="text-warm-text/50 text-xs mt-2">
          給每天努力的妳
        </p>
      </section>
    </div>
  );
}
