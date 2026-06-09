"use client";
import { motion } from "framer-motion";
import {
  Bell,
  CreditCard,
  Calendar,
  ShoppingBag,
  Users,
  Gift,
  Heart,
  Lock,
  CalendarCheck,
  Home,
  Sparkles,
  MessageCircle,
  User,
  ChevronRight,
  Diamond,
} from "lucide-react";
import { cn } from "@/lib/utils";

// 冠 #5189/#5194: 升級設計工具鏈後的 JY Beauty 會員中心
// 用 shadcn 風格 + lucide-react + framer-motion

export default function MemberV2Page() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FBF8F1] via-[#F4ECDC] to-[#FBF8F1] pb-28 relative overflow-x-hidden">
      {/* 環境光暈 */}
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute top-20 -left-10 w-60 h-60 rounded-full bg-[#E3CFA0]/20 blur-3xl" />
        <div className="absolute top-1/3 -right-10 w-80 h-80 rounded-full bg-[#C9A961]/15 blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative pt-12 pb-4 px-6 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="font-serif text-3xl tracking-[2px] text-[#3A2E1E]">
            J<span className="text-[#9B7A3A]">Y</span> <span className="font-light">Beauty</span>
          </h1>
          <p className="text-xs tracking-[6px] text-[#6B5841] mt-1">會員中心</p>
        </motion.div>
        <button className="absolute right-6 top-12 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center shadow-sm relative">
          <Bell className="w-4 h-4 text-[#3A2E1E]" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#9B7A3A] ring-2 ring-white" />
        </button>
      </div>

      {/* 會員卡 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.1 }}
        className="mx-5 relative bg-white rounded-3xl overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.08)]"
      >
        {/* 角落光暈 */}
        <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-gradient-to-br from-[#E3CFA0]/30 to-[#C9A961]/15" />
        {/* 角落彩帶 - 會員等級 */}
        <div className="absolute right-0 top-3 bg-gradient-to-br from-[#E3CFA0] to-[#C9A961] text-white pl-5 pr-4 py-2 rounded-l-xl shadow-[0_4px_12px_rgba(155,122,58,0.25)]">
          <p className="text-[9px] tracking-[2px]">MEMBER TIER</p>
          <p className="font-serif text-sm tracking-[3px] my-0.5">尚未升級</p>
          <p className="text-[9px] tracking-[2px] opacity-80">2026 Q2</p>
        </div>

        <div className="p-6 flex items-center gap-5 relative">
          {/* JY 圓徽 */}
          <div className="w-[78px] h-[78px] rounded-full border-2 border-[#C9A961] bg-gradient-to-br from-[#FBF8F1] to-[#F4ECDC] flex items-center justify-center flex-shrink-0">
            <span className="font-serif text-3xl font-semibold text-[#9B7A3A] tracking-tighter">JY</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] tracking-[4px] text-[#9B7A3A] font-medium">MEMBER</p>
            <p className="font-serif text-2xl text-[#3A2E1E] tracking-wider mt-0.5">陳冠羽</p>
            <p className="text-sm text-[#9B7A3A] tracking-wider mt-1">0933 318 828</p>
            <p className="text-[11px] text-[#6B5841] mt-1.5 flex items-center gap-1">
              <span>📍</span>
              <span className="truncate">臺北市中正區重慶南路一段 122 號</span>
            </p>
          </div>
        </div>
      </motion.div>

      {/* 統計區 4 卡 + 中央圓 */}
      <div className="relative mx-5 mt-5 grid grid-cols-2 gap-2.5">
        <StatCard icon={CreditCard} label="卡片餘額" value="NT$ 0" delay={0.2} />
        <StatCard icon={Calendar} label="預約次數" value="0" suffix="次" delay={0.25} />
        <StatCard icon={ShoppingBag} label="累積消費" value="NT$ 0" delay={0.3} accent />
        <StatCard icon={Users} label="推薦好友" value="0" suffix="人" delay={0.35} />

        {/* 中央圓 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[130px] h-[130px] rounded-full bg-white shadow-[0_16px_40px_rgba(0,0,0,0.1)] flex flex-col items-center justify-center text-center z-10 border border-white"
        >
          <p className="text-[10px] tracking-[2px] text-[#6B5841] mb-0.5">本季消費</p>
          <p className="font-serif text-2xl text-[#3A2E1E] tracking-wide">NT$ 0</p>
          <p className="text-[10px] text-[#6B5841] mt-1 leading-tight">
            再消費 NT$ 5,000<br />
            <span className="text-[#9B7A3A] font-semibold">升級銀卡 🥈</span>
          </p>
        </motion.div>
      </div>

      {/* 推薦 banner */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mx-5 mt-5 relative rounded-3xl overflow-hidden cursor-pointer group"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#E3CFA0] via-[#C9A961] to-[#9B7A3A]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.4),transparent_60%)]" />
        <div className="absolute -right-3 -top-3 w-20 h-20 rounded-full bg-white/20" />
        <div className="relative p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
            <Diamond className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 text-white">
            <p className="font-medium tracking-wide">雙方皆享加項項目免費升級</p>
            <p className="text-xs opacity-85 mt-0.5">邀請好友，讓美麗更有價值</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center">
            <ChevronRight className="w-4 h-4 text-white" />
          </div>
        </div>
      </motion.div>

      {/* 4 個快速 action */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.55 }}
        className="mx-5 mt-4 grid grid-cols-4 gap-2.5"
      >
        <QuickAction icon={Gift} label="禮品卡兌換" href="/cards" />
        <QuickAction icon={Heart} label="推薦好友" />
        <QuickAction icon={Lock} label="修改密碼" />
        <QuickAction icon={CalendarCheck} label="我的預約" />
      </motion.div>

      {/* 底部 nav */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[440px] mx-auto h-20 bg-white/90 backdrop-blur-xl border-t border-[#C9A961]/15 grid grid-cols-5 pt-2.5">
        <NavItem icon={Home} label="首頁" />
        <NavItem icon={Sparkles} label="療程" />
        <NavCenter />
        <NavItem icon={MessageCircle} label="消息" />
        <NavItem icon={User} label="我的" active />
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  suffix,
  delay = 0,
  accent = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  suffix?: string;
  delay?: number;
  accent?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={cn(
        "relative rounded-3xl p-5 overflow-hidden",
        accent
          ? "bg-gradient-to-br from-[#E3CFA0] via-[#C9A961] to-[#9B7A3A] text-white shadow-[0_8px_24px_rgba(155,122,58,0.25)]"
          : "bg-white shadow-[0_8px_24px_rgba(155,122,58,0.12)]"
      )}
    >
      <Icon
        className={cn("w-6 h-6 mb-2.5", accent ? "text-white" : "text-[#C9A961]")}
      />
      <p
        className={cn(
          "text-[11px] tracking-[1px]",
          accent ? "text-white/85" : "text-[#6B5841]"
        )}
      >
        {label}
      </p>
      <p
        className={cn(
          "font-serif text-3xl mt-1 flex items-baseline gap-1",
          accent ? "text-white" : "text-[#3A2E1E]"
        )}
      >
        {value}
        {suffix && (
          <span
            className={cn(
              "text-sm font-sans",
              accent ? "text-white/80" : "text-[#6B5841]"
            )}
          >
            {suffix}
          </span>
        )}
      </p>
      <div
        className={cn(
          "absolute right-3.5 bottom-3.5 w-7 h-7 rounded-full flex items-center justify-center",
          accent ? "bg-white/25 text-white" : "bg-[#F4ECDC] text-[#9B7A3A]"
        )}
      >
        <ChevronRight className="w-4 h-4" />
      </div>
    </motion.div>
  );
}

function QuickAction({
  icon: Icon,
  label,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href?: string;
}) {
  const Tag = href ? "a" : "button";
  return (
    <Tag
      href={href}
      className="bg-white rounded-2xl p-3.5 text-center shadow-[0_4px_12px_rgba(155,122,58,0.08)] active:scale-95 transition-transform"
    >
      <div className="w-8 h-8 mx-auto mb-1.5 flex items-center justify-center text-[#9B7A3A]">
        <Icon className="w-6 h-6" />
      </div>
      <p className="text-[11px] text-[#3A2E1E] font-medium leading-tight">{label}</p>
    </Tag>
  );
}

function NavItem({
  icon: Icon,
  label,
  active = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      className={cn(
        "flex flex-col items-center justify-center gap-1 text-[10px]",
        active ? "text-[#9B7A3A] font-semibold" : "text-[#6B5841]"
      )}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );
}

function NavCenter() {
  return (
    <button className="relative flex flex-col items-center">
      <div className="absolute -top-7 w-16 h-16 rounded-full bg-gradient-to-br from-[#FBF8F1] via-[#F4ECDC] to-[#E3CFA0] border-[3px] border-white flex items-center justify-center shadow-[0_8px_24px_rgba(155,122,58,0.3)]">
        <span className="font-serif text-2xl font-semibold text-[#9B7A3A] tracking-tighter">
          JY
        </span>
      </div>
      <span className="mt-8 text-[10px] text-[#6B5841]">&nbsp;</span>
    </button>
  );
}
