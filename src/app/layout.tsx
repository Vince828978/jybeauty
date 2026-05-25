import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "JY Beauty | 私人到府 SPA・到府按摩・臉部保養",
  description: "JY Beauty 私人到府 SPA，15年專業美容師到你家。精油按摩、臉部保養、深層護理，在最舒適的空間享受一對一專屬療程。到府服務或就近工作室，預約制不趕場。",
  keywords: "到府按摩, 到府SPA, 私人SPA, 精油按摩, 臉部保養, JY Beauty, 到府美容, 到府服務, 居家SPA, 孕婦按摩, 產後保養",
  icons: {
    icon: "/icon-192.png",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "JY Beauty | 私人到府 SPA",
    description: "最好的 SPA，不在華麗的會館裡，而在你最自在的地方。專業美容師到府服務，15年經驗，預約制一對一。",
    url: "https://jybeauty.tw",
    siteName: "JY Beauty",
    locale: "zh_TW",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-TW" className={`${geistSans.variable} h-full antialiased`}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@300;400;500;700&family=Noto+Serif+TC:wght@400;600;700&display=swap" rel="stylesheet" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BeautySalon",
          "name": "JY Beauty",
          "description": "私人到府 SPA・精油按摩・臉部保養，15年專業美容師一對一到府服務",
          "url": "https://jybeauty.tw",
          "telephone": "+886",
          "priceRange": "$1,380 - $4,280",
          "openingHoursSpecification": {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
            "opens": "10:00",
            "closes": "20:00"
          },
          "areaServed": { "@type": "Country", "name": "Taiwan" },
          "serviceType": ["到府按摩", "臉部保養", "精油SPA", "深層護理"],
          "sameAs": ["https://www.instagram.com/jaryun_wang", "https://lin.ee/PeB8CkE"]
        })}} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
