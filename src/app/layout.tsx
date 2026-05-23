import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "JY Beauty | 私人到府 SPA",
  description: "美麗・放鬆・從 JY Beauty 開始。私人到府 SPA 服務，專業精油按摩、臉部保養，在最舒適的空間享受專屬療程。",
  keywords: "到府按摩, 到府SPA, 私人SPA, 精油按摩, 臉部保養, JY Beauty, 到府美容",
  icons: {
    icon: "/icon-192.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-TW" className={`${geistSans.variable} h-full antialiased`}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@300;400;500;700&family=Noto+Serif+TC:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
