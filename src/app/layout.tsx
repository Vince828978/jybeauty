import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "JY Beauty 到府SPA｜私人到府按摩・精油SPA・臉部保養｜台北桃園新北到府服務",
  description: "JY Beauty 私人到府 SPA 預約制，15年專業美容師一對一到你家。精油按摩、深層臉部保養、熱石舒壓、刮痧筋膜放鬆，在你最舒適的空間享受專屬療程。台北、新北、桃園到府服務，也可預約工作室。線上即時預約，週一至週六 10:00-20:00。",
  keywords: "到府按摩, 到府SPA, 私人SPA, 精油按摩, 臉部保養, JY Beauty, 到府美容, 到府服務, 居家SPA, 孕婦按摩, 產後保養, 台北到府按摩, 桃園到府SPA, 新北到府按摩, 私人按摩師, 到府精油按摩, 一對一SPA, 到府臉部保養, 熱石按摩, 深層護理, 到府美體, 居家按摩預約, 私人美容師, SPA預約, 放鬆按摩, 舒壓SPA, 到府護膚, 工作室SPA, 美容到府, 按摩預約",
  icons: {
    icon: "/icon-192.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "JY Beauty",
    statusBarStyle: "default",
  },
  alternates: {
    canonical: "https://jybeauty.tw",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    title: "JY Beauty｜私人到府 SPA・精油按摩・臉部保養",
    description: "最好的 SPA 不在華麗的會館裡，而在你最自在的地方。15年專業美容師到府服務，預約制一對一。台北桃園新北到府，線上即時預約。",
    url: "https://jybeauty.tw",
    siteName: "JY Beauty 私人到府SPA",
    locale: "zh_TW",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JY Beauty｜私人到府 SPA",
    description: "15年專業美容師到你家，精油按摩・臉部保養・深層護理。台北桃園新北到府服務，線上預約。",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-TW" className={`${geistSans.variable} h-full antialiased`}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@300;400;500;700&family=Noto+Serif+TC:wght@400;600;700&display=swap" rel="stylesheet" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([
          {
            "@context": "https://schema.org",
            "@type": "BeautySalon",
            "name": "JY Beauty 私人到府SPA",
            "alternateName": "嘉韻美容",
            "description": "私人到府 SPA・精油按摩・臉部保養，15年專業美容師一對一到府服務。台北、新北、桃園地區。",
            "url": "https://jybeauty.tw",
            "telephone": "+886",
            "priceRange": "NT$1,380 - NT$4,280",
            "currenciesAccepted": "TWD",
            "paymentAccepted": "Cash, LINE Pay",
            "openingHoursSpecification": {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
              "opens": "10:00",
              "closes": "20:00"
            },
            "areaServed": [
              { "@type": "City", "name": "台北市" },
              { "@type": "City", "name": "新北市" },
              { "@type": "City", "name": "桃園市" }
            ],
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "SPA 療程",
              "itemListElement": [
                { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "精油按摩 90min", "description": "全身精油舒壓按摩，到府服務" }, "price": "1380", "priceCurrency": "TWD" },
                { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "沉浸式放鬆 120min+熱石", "description": "深層精油按摩加熱石舒壓" }, "price": "2300", "priceCurrency": "TWD" },
                { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "身體+臉部全方位", "description": "身體精油按摩加臉部深層保養" }, "price": "3280", "priceCurrency": "TWD" }
              ]
            },
            "sameAs": ["https://www.instagram.com/jaryun_wang", "https://lin.ee/PeB8CkE"]
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              { "@type": "Question", "name": "JY Beauty 提供到府服務嗎？", "acceptedAnswer": { "@type": "Answer", "text": "是的，JY Beauty 提供台北、新北、桃園地區的到府 SPA 服務，專業美容師直接到您家。也可預約工作室服務。" }},
              { "@type": "Question", "name": "預約需要多久前預訂？", "acceptedAnswer": { "@type": "Answer", "text": "建議提前 1-3 天線上預約。營業時間為週一至週六 10:00-20:00，週日公休。" }},
              { "@type": "Question", "name": "一次療程大概多久？", "acceptedAnswer": { "@type": "Answer", "text": "基礎療程 90 分鐘起，含熱石的深層療程約 120 分鐘，身體加臉部全方位約 150 分鐘。" }},
              { "@type": "Question", "name": "費用怎麼算？", "acceptedAnswer": { "@type": "Answer", "text": "療程從 NT$1,380 起，依套餐和加項不同。可在官網查看完整價目表並線上預約。" }}
            ]
          }
        ])}} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
