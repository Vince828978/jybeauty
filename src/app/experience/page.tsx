import Image from "next/image";

export default function ExperiencePage() {
  return (
    <div className="min-h-screen bg-dark">
      <div className="relative h-[40vh]">
        <Image src="/hero-main.jpg" alt="JY Beauty 體驗" fill className="object-cover object-top" />
        <div className="absolute inset-0 bg-dark/40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gold-light text-xs tracking-[0.3em] uppercase mb-3">FIRST EXPERIENCE</p>
            <h1 className="font-serif-tc text-3xl font-bold text-white">首次體驗方案</h1>
          </div>
        </div>
      </div>
      <div className="max-w-sm mx-auto px-8 py-10 text-center">
        <p className="text-white/60 text-sm mb-10">專屬體驗優惠，即將推出</p>

        <div className="border border-gold/30 rounded-2xl p-8 mb-8">
          <p className="text-gold text-sm mb-2">敬請期待</p>
          <p className="text-white/80 text-base leading-relaxed">
            體驗方案準備中，<br />
            歡迎先加 LINE 詢問！
          </p>
        </div>

        <a href="https://line.me/R/ti/p/@jy.beauty" target="_blank"
          className="inline-block bg-gold text-white px-12 py-5 text-lg tracking-wide rounded-2xl font-medium active:bg-dark-light transition-colors mb-6">
          加 LINE 詢問
        </a>
        <br />
        <a href="/" className="text-white/40 text-sm">回首頁</a>
      </div>
    </div>
  );
}
