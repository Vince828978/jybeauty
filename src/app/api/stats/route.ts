import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

function getDb() {
  const url = process.env.STORAGE_URL || process.env.DATABASE_URL || "";
  return neon(url);
}

export async function GET() {
  try {
    const sql = getDb();

    const today = new Date().toISOString().split("T")[0];
    const thisMonth = today.substring(0, 7);

    const todayRevenue = await sql`SELECT COALESCE(SUM(total), 0) as revenue, COUNT(*) as count FROM bookings WHERE date = ${today} AND status = 'confirmed'`;
    const monthRevenue = await sql`SELECT COALESCE(SUM(total), 0) as revenue, COUNT(*) as count FROM bookings WHERE date LIKE ${thisMonth + '%'} AND status = 'confirmed'`;
    const totalRevenue = await sql`SELECT COALESCE(SUM(total), 0) as revenue, COUNT(*) as count FROM bookings WHERE status = 'confirmed'`;
    const pendingCount = await sql`SELECT COUNT(*) as count FROM bookings WHERE status = 'pending'`;

    const popularPackage = await sql`SELECT package, COUNT(*) as count FROM bookings GROUP BY package ORDER BY count DESC LIMIT 1`;

    const recentCustomers = await sql`SELECT DISTINCT ON (phone) name, phone, date FROM bookings ORDER BY phone, created_at DESC`;
    const needFollowUp = recentCustomers.filter((c) => {
      const lastDate = new Date(String(c.date));
      const daysSince = (Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysSince > 30;
    });

    const monthlyData = await sql`SELECT
      TO_CHAR(TO_DATE(date, 'YYYY-MM-DD'), 'YYYY-MM') as month,
      COALESCE(SUM(total), 0) as revenue,
      COUNT(*) as count
      FROM bookings WHERE status = 'confirmed'
      GROUP BY month ORDER BY month DESC LIMIT 6`;

    return NextResponse.json({
      today: { revenue: Number(todayRevenue[0]?.revenue || 0), count: Number(todayRevenue[0]?.count || 0) },
      month: { revenue: Number(monthRevenue[0]?.revenue || 0), count: Number(monthRevenue[0]?.count || 0) },
      total: { revenue: Number(totalRevenue[0]?.revenue || 0), count: Number(totalRevenue[0]?.count || 0) },
      pending: Number(pendingCount[0]?.count || 0),
      popularPackage: popularPackage[0]?.package || "—",
      needFollowUp: needFollowUp.length,
      followUpList: needFollowUp,
      monthlyData,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
