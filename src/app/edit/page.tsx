"use client";
import { useState, useEffect, useRef } from "react";

const ADMIN_PASS = "1234";

interface ContentItem {
  key: string;
  label: string;
  value: string;
}

const defaultContent: ContentItem[] = [
  { key: "hero_title", label: "首頁標題", value: "美麗・放鬆\n從 JY Beauty 開始" },
  { key: "hero_subtitle", label: "首頁副標", value: "私人到府 SPA，在你最放鬆的空間享受專屬療程" },
  { key: "about_title", label: "關於我們標題", value: "不開店，我去找你" },
  { key: "about_story_1", label: "品牌故事第1段", value: "做美容這些年，看過太多客人拖著疲憊的身體來到店裡，做完療程整個人放鬆了，結果一出門又要擠捷運、找車位，那份放鬆在回家路上就消失了一半。" },
  { key: "about_story_2", label: "品牌故事第2段", value: "我一直在想，如果做完就能直接躺在自己的床上，蓋著自己最喜歡的被子，那才是真正完整的放鬆。" },
  { key: "about_story_3", label: "品牌故事重點", value: "所以我決定，不開店，我去找你。" },
  { key: "about_story_4", label: "品牌故事第4段", value: "我把所有專業設備都帶在身上——精油、美容床、毛巾、音樂，到你家幫你佈置一個專屬的 SPA 空間。你不用出門、不用趕時間、不用跟別人共用空間。" },
  { key: "about_story_5", label: "品牌故事結語", value: "這段時間，完全是你的。" },
  { key: "services_title", label: "療程方案標題", value: "專為你設計的服務" },
  { key: "services_subtitle", label: "療程方案副標", value: "不管你是誰\n放鬆這件事，我們帶到你身邊" },
  { key: "contact_title", label: "聯繫標題", value: "聯繫我們" },
  { key: "contact_line", label: "LINE 帳號", value: "@jy.beauty" },
  { key: "booking_cta", label: "預約按鈕文字", value: "預約體驗" },
];

export default function EditPage() {
  const [authed, setAuthed] = useState(false);
  const [pass, setPass] = useState("");
  const [content, setContent] = useState<ContentItem[]>(defaultContent);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("jyb-admin") === "1") setAuthed(true);
  }, []);

  useEffect(() => {
    if (authed) {
      fetch("/api/content").then(r => r.json()).then(d => {
        if (d.content) {
          setContent(prev => prev.map(item => ({
            ...item,
            value: d.content[item.key] || item.value,
          })));
        }
      });
    }
  }, [authed]);

  const updateValue = (key: string, value: string) => {
    setContent(prev => prev.map(item => item.key === key ? { ...item, value } : item));
    setSaved(false);
  };

  const saveAll = async () => {
    setSaving(true);
    for (const item of content) {
      await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: item.key, value: item.value }),
      });
    }
    setSaving(false);
    setSaved(true);
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-warm-bg flex items-center justify-center px-8">
        <div className="max-w-sm w-full text-center">
          <p className="font-serif-tc text-2xl font-bold text-dark mb-2"><span className="text-gold">JY</span> Beauty</p>
          <p className="text-text-light text-lg mb-8">內容編輯</p>
          <input type="password" value={pass} onChange={(e) => setPass(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && pass === ADMIN_PASS) { sessionStorage.setItem("jyb-admin", "1"); setAuthed(true); } }}
            placeholder="請輸入管理密碼"
            className="w-full px-5 py-5 rounded-2xl border-2 border-gold-light/30 text-lg text-center focus:outline-none focus:border-gold mb-5" />
          <button onClick={() => { if (pass === ADMIN_PASS) { sessionStorage.setItem("jyb-admin", "1"); setAuthed(true); } }}
            className="w-full bg-gold text-white py-5 rounded-2xl text-lg font-medium">登入</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-bg">
      <div className="bg-white border-b border-gold-light/30 px-6 py-5 sticky top-0 z-50 text-center">
        <p className="font-serif-tc text-xl font-bold text-dark"><span className="text-gold">JY</span> Beauty 內容編輯</p>
        <p className="text-text-light text-sm mt-1">點擊文字即可修改，改完按儲存</p>
      </div>

      <div className="max-w-lg mx-auto px-5 py-6 space-y-5">
        {content.map((item) => (
          <div key={item.key} className="bg-white rounded-2xl p-5 border border-gold-light/20">
            <p className="text-gold text-sm font-medium mb-3">{item.label}</p>
            {editing === item.key ? (
              <textarea
                value={item.value}
                onChange={(e) => updateValue(item.key, e.target.value)}
                onBlur={() => setEditing(null)}
                autoFocus
                rows={Math.max(2, item.value.split("\n").length + 1)}
                className="w-full px-4 py-4 rounded-xl border-2 border-gold text-base text-center focus:outline-none resize-none bg-gold/5"
              />
            ) : (
              <button
                onClick={() => setEditing(item.key)}
                className="w-full text-center text-dark text-base leading-relaxed py-3 px-4 rounded-xl hover:bg-cream/50 active:bg-cream transition-colors whitespace-pre-wrap"
              >
                {item.value}
              </button>
            )}
          </div>
        ))}

        <button
          onClick={saveAll}
          disabled={saving}
          className={`w-full py-6 rounded-2xl text-xl font-medium transition-colors ${saving ? "bg-gray-300 text-gray-500" : saved ? "bg-green-500 text-white" : "bg-gold text-white active:bg-dark-light"}`}
        >
          {saving ? "儲存中..." : saved ? "✓ 已儲存" : "儲存所有修改"}
        </button>

        <a href="/" className="block text-center text-text-light text-base py-4">回首頁預覽</a>
        <a href="/admin" className="block text-center text-gold text-base py-4">回後台管理</a>
      </div>
    </div>
  );
}
