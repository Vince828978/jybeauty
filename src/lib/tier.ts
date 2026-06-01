// 肉包 #5092 2026-06-01: 會員等級系統 (黑/金/銀)
// 季度消費門檻 + 折扣 + 生日免費加項
//
// 等級判定：以「本季 confirmed 預約 total 加總」決定
// 季度：自然季 (1-3, 4-6, 7-9, 10-12)

export type Tier = "black" | "gold" | "silver" | null;

export const TIER_CONFIG: Record<NonNullable<Tier>, {
  label: string;
  emoji: string;
  threshold: number;
  discount: number;        // 0.8 = 8 折
  freeAddonsPerCycle: number;  // 季度免費加項數
  freeAddonsCycle: "month" | "quarter";  // 月計 or 季計
  perks: string[];
}> = {
  black: {
    label: "黑卡",
    emoji: "🖤",
    threshold: 30000,
    discount: 0.8,
    freeAddonsPerCycle: 1,
    freeAddonsCycle: "month",
    perks: ["8 折優惠", "每月 1 次免費加項", "專屬時段", "預約優先", "生日加項 free"],
  },
  gold: {
    label: "金卡",
    emoji: "🥇",
    threshold: 15000,
    discount: 0.95,
    freeAddonsPerCycle: 1,
    freeAddonsCycle: "quarter",
    perks: ["95 折優惠", "季 1 次免費加項", "預約優先", "生日加項 free"],
  },
  silver: {
    label: "銀卡",
    emoji: "🥈",
    threshold: 5000,
    discount: 1.0,
    freeAddonsPerCycle: 0,
    freeAddonsCycle: "quarter",
    perks: ["預約優先", "生日加項 free"],
  },
};

export function computeTier(quarterSpent: number): Tier {
  if (quarterSpent >= TIER_CONFIG.black.threshold) return "black";
  if (quarterSpent >= TIER_CONFIG.gold.threshold) return "gold";
  if (quarterSpent >= TIER_CONFIG.silver.threshold) return "silver";
  return null;
}

export function currentQuarterRange(d: Date = new Date()): { start: string; end: string; label: string } {
  const year = d.getFullYear();
  const month = d.getMonth(); // 0-11
  const q = Math.floor(month / 3) + 1;       // 1-4
  const qStartMonth = (q - 1) * 3;
  const qEndMonth = qStartMonth + 2;
  const start = `${year}-${String(qStartMonth + 1).padStart(2, "0")}-01`;
  const lastDay = new Date(year, qEndMonth + 1, 0).getDate();
  const end = `${year}-${String(qEndMonth + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return { start, end, label: `${year} Q${q}` };
}

export function nextTierProgress(quarterSpent: number): {
  current: Tier;
  next: Tier;
  remaining: number;
} {
  const current = computeTier(quarterSpent);
  if (current === "black") {
    return { current, next: null, remaining: 0 };
  }
  const nextLevel: NonNullable<Tier> = current === "gold" ? "black" : current === "silver" ? "gold" : "silver";
  const remaining = TIER_CONFIG[nextLevel].threshold - quarterSpent;
  return { current, next: nextLevel, remaining };
}
