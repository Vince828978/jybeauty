"use client";
import { useState, useEffect } from "react";

interface Booking {
  id: string;
  package: string;
  packageTier: string;
  date: string;
  time: string;
  name: string;
  phone: string;
  total: number;
  addons: string[];
  createdAt: string;
  status: string;
}

export default function AdminPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    const res = await fetch("/api/bookings");
    const data = await res.json();
    setBookings(data.bookings || []);
    setLoading(false);
  };

  useEffect(() => { fetchBookings(); }, []);

  return (
    <div className="min-h-screen bg-warm-bg">
      <div className="bg-white border-b border-gold-light/30 px-6 py-5 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="font-serif-tc text-xl font-bold text-dark"><span className="text-gold">JY</span> Beauty 後台</h1>
          <button onClick={fetchBookings} className="text-gold text-sm border border-gold px-4 py-1.5 rounded-full hover:bg-gold hover:text-white transition-colors">
            重新整理
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif-tc text-lg text-dark font-semibold">預約列表</h2>
          <span className="text-text-light text-sm">{bookings.length} 筆預約</span>
        </div>

        {loading ? (
          <p className="text-text-light text-center py-20">載入中...</p>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-text-light text-lg mb-2">目前沒有預約</p>
            <p className="text-text-light text-sm">客人預約後會顯示在這裡</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.slice().reverse().map((b) => (
              <div key={b.id} className="bg-white rounded-2xl p-6 border border-gold-light/20 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-dark text-lg">{b.name}</p>
                    <p className="text-text-light text-sm">{b.phone}</p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full ${b.status === "pending" ? "bg-gold/10 text-gold" : "bg-green-100 text-green-700"}`}>
                    {b.status === "pending" ? "待確認" : "已確認"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div>
                    <p className="text-text-light text-xs">套餐</p>
                    <p className="text-dark font-medium">{b.package}</p>
                  </div>
                  <div>
                    <p className="text-text-light text-xs">金額</p>
                    <p className="text-gold font-bold font-serif-tc text-lg">${b.total?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-text-light text-xs">日期</p>
                    <p className="text-dark font-medium">{b.date}</p>
                  </div>
                  <div>
                    <p className="text-text-light text-xs">時段</p>
                    <p className="text-dark font-medium">{b.time}</p>
                  </div>
                </div>
                <p className="text-text-light text-xs">
                  預約時間：{new Date(b.createdAt).toLocaleString("zh-TW")}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
