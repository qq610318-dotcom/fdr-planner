import { useState, useEffect } from “react”;
import { db } from “./firebase”;
import {
doc, getDoc, setDoc, onSnapshot, collection
} from “firebase/firestore”;

const B = {
rose: “#c9a49a”, roseLight: “#e8cfc9”, roseDark: “#a07870”,
bg: “#1a1210”, card: “#1e1612”, card2: “#221814”,
};

const DEFAULT_SCHEDULE = [
{ day: “週一”, title: “自己的心得”, icon: “🍳”, phase: “播種期”, phaseColor: “#c9a49a”, tip: “重點是引發共鳴！讓粉絲覺得「我也有一樣的問題」，不要直接推銷”, materials: [“生活吃播影片”, “為什麼開始使用的故事”, “是否有相同困擾的互動貼紙”], checklist: [“拍攝生活吃播日常”, “分享開始使用的原因故事”, “加入互動貼紙”, “語氣輕鬆像朋友聊天”, “排程發布”] },
{ day: “週二”, title: “自己的見證＋產品介紹”, icon: “✨”, phase: “升溫期 I”, phaseColor: “#b8956e”, tip: “先說自己的真實改變，再自然帶出產品是關鍵。真實感 > 完美度”, materials: [“Before/After 對比照”, “15秒真心心得影音”, “產品細節特寫”], checklist: [“整理 Before/After 素材”, “錄製15秒真心心得”, “拍攝產品細節”, “結合見證帶出亮點”, “排程發布”] },
{ day: “週三”, title: “客人詢問＋產品優勢”, icon: “🙋”, phase: “升溫期 II”, phaseColor: “#9e8fa8”, tip: “把客人的真實疑問搬上來，用你的回答幫所有潛在買家解惑”, materials: [“客人真實詢問截圖”, “常見 Q&A”, “產品優勢對比圖”], checklist: [“整理最常見客人詢問”, “準備產品優勢說明”, “截圖真實提問”, “用對話形式回答”, “排程發布”] },
{ day: “週四”, title: “客人收單＋解決問題”, icon: “💪”, phase: “收割期 I”, phaseColor: “#c9906a”, tip: “讓猶豫中的人看到：別人已經解決了這個問題，你還在等什麼？”, materials: [“客人下單截圖”, “產品解決問題說明”, “客人改變故事”, “倒數計時貼紙”], checklist: [“展示客人下單截圖”, “說明產品能解決什麼”, “分享客人改變”, “加入緊迫感”, “排程發布”] },
{ day: “週五”, title: “熱銷詢問＋出貨”, icon: “📦”, phase: “收割期 II”, phaseColor: “#b87878”, tip: “出貨畫面是最強的社群證明！滿滿的貨箱讓人相信真的熱銷”, materials: [“熱銷詢問訊息截圖”, “滿滿出貨箱照片”, “打包過程影片”, “倒數計時器貼紙”], checklist: [“截圖大量詢問展示熱度”, “拍攝出貨箱”, “錄製打包過程”, “加倒數計時器”, “排程發布”] },
{ day: “週六”, title: “熱銷＋客人反饋＋B&A”, icon: “🏆”, phase: “強化收割”, phaseColor: “#a07890”, tip: “週六是最後衝刺！用客人反饋＋B&A讓還在猶豫的人做最終決定”, materials: [“最新詢問截圖”, “客人反饋影音”, “Before/After 對比照”, “感謝訊息截圖”], checklist: [“匯集最新詢問截圖”, “整理客人反饋”, “製作 B&A 對比”, “加感謝文案”, “最後緊迫感收尾”, “排程發布”] },
{ day: “週日”, title: “純生活限動”, icon: “🌿”, phase: “留白期”, phaseColor: “#b0a090”, tip: “週日不賣東西。讓粉絲看見真實的你，感情才能長久”, materials: [“家庭時間”, “放鬆時刻”, “非銷售日常”], checklist: [“拍攝生活日常（完全不提產品）”, “分享真實的自己”, “讓粉絲看見你的生活面”, “輕鬆發布”] },
];

const DAY_LABELS = [“週日”,“週一”,“週二”,“週三”,“週四”,“週五”,“週六”];
const LEADER_PW = “FDR2024”;

function getWeekDates(offset = 0) {
const today = new Date();
const dow = today.getDay();
return Array.from({ length: 7 }, (_, i) => {
const d = new Date(today);
d.setDate(today.getDate() - dow + i + offset * 7);
return d;
});
}

function FDRLogo({ size = 44 }) {
return (
<svg width={size} height={size} viewBox="0 0 120 100" fill="none">
<defs><linearGradient id="rg" x1="0" y1="0" x2="120" y2="100" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#e8cfc9"/><stop offset="50%" stopColor="#c9a49a"/><stop offset="100%" stopColor="#a07870"/></linearGradient></defs>
<text x="4" y="68" fontFamily="Georgia,serif" fontSize="52" fontWeight="bold" fill="url(#rg)" letterSpacing="-1">FDR</text>
<path d="M60 14 L61.5 18 L65 19.5 L61.5 21 L60 25 L58.5 21 L55 19.5 L58.5 18Z" fill="#c9a49a" opacity=".9"/>
<path d="M105 34 L106 37 L109 38 L106 39 L105 42 L104 39 L101 38 L104 37Z" fill="#c9a49a" opacity=".6"/>
<line x1="4" y1="74" x2="116" y2="74" stroke="url(#rg)" strokeWidth="1" opacity=".4"/>
</svg>
);
}

function Avatar({ name, size = 32 }) {
const colors = [”#c9a49a”,”#b8956e”,”#9e8fa8”,”#c9906a”,”#b87878”,”#a07890”,”#b0a090”];
const color = colors[(name.charCodeAt(0) || 0) % colors.length];
return (
<div style={{ width: size, height: size, borderRadius: “50%”, background: `${color}30`, border: `1.5px solid ${color}60`, display: “flex”, alignItems: “center”, justifyContent: “center”, fontSize: size * 0.38, fontWeight: 700, color, flexShrink: 0 }}>
{name.slice(0,1)}
</div>
);
}

export default function App() {
const [screen, setScreen] = useState(“login”);
const [myName, setMyName] = useState(””);
const [nameInput, setNameInput] = useState(””);
const [isLeader, setIsLeader] = useState(false);
const [leaderPwInput, setLeaderPwInput] = useState(””);
const [loginError, setLoginError] = useState(””);
const [loading, setLoading] = useState(false);

const [teamSchedule, setTeamSchedule] = useState(DEFAULT_SCHEDULE);
const [membersData, setMembersData] = useState({});

const [tab, setTab] = useState(“week”);
const [weekOffset, setWeekOffset] = useState(0);
const [selected, setSelected] = useState(null);
const [editing, setEditing] = useState(false);
const [editForm, setEditForm] = useState({});
const [editDayIdx, setEditDayIdx] = useState(null);

// Listen to team schedule from Firestore
useEffect(() => {
const unsub = onSnapshot(doc(db, “config”, “schedule”), (snap) => {
if (snap.exists()) {
setTeamSchedule(snap.data().days || DEFAULT_SCHEDULE);
}
});
return unsub;
}, []);

// Listen to all members progress
useEffect(() => {
if (!myName) return;
const unsub = onSnapshot(collection(db, “members”), (snap) => {
const data = {};
snap.forEach(d => { data[d.id] = d.data(); });
setMembersData(data);
});
return unsub;
}, [myName]);

const handleLogin = async () => {
const n = nameInput.trim();
if (!n) { setLoginError(“請輸入你的名字”); return; }
if (isLeader && leaderPwInput !== LEADER_PW) { setLoginError(“密碼錯誤”); return; }
setLoading(true);
try {
// Register member in Firestore if not exists
if (!isLeader) {
const ref = doc(db, “members”, n);
const snap = await getDoc(ref);
if (!snap.exists()) {
await setDoc(ref, { joinedAt: new Date().toISOString() });
}
}
setMyName(n);
setScreen(isLeader ? “leader” : “partner”);
setLoginError(””);
} catch (e) {
setLoginError(“連線失敗，請檢查網路”);
}
setLoading(false);
};

const myProgress = membersData[myName] || {};

const getChecks = (day) => {
const sched = teamSchedule.find(s => s.day === day);
if (!sched) return [];
return myProgress[day] || sched.checklist.map(() => false);
};

const getProgressPct = (day, progressObj) => {
const sched = teamSchedule.find(s => s.day === day);
if (!sched) return 0;
const p = progressObj || myProgress;
const c = p[day] || sched.checklist.map(() => false);
if (!c.length) return 0;
return Math.round((c.filter(Boolean).length / c.length) * 100);
};

const toggleCheck = async (day, i) => {
const sched = teamSchedule.find(s => s.day === day);
if (!sched) return;
const arr = […getChecks(day)];
arr[i] = !arr[i];
const updated = { …myProgress, [day]: arr };
try {
await setDoc(doc(db, “members”, myName), updated, { merge: true });
} catch (e) { console.error(e); }
};

const saveTeamSchedule = async (sched) => {
try {
await setDoc(doc(db, “config”, “schedule”), { days: sched });
setTeamSchedule(sched);
} catch (e) { console.error(e); }
};

const openEdit = (idx) => {
const s = teamSchedule[idx];
setEditForm({ title: s.title, icon: s.icon, tip: s.tip, phase: s.phase, materials: s.materials.join(”\n”), checklist: s.checklist.join(”\n”) });
setEditDayIdx(idx);
setEditing(true);
};

const saveEdit = async () => {
const updated = teamSchedule.map((s, i) => i !== editDayIdx ? s : {
…s, title: editForm.title, icon: editForm.icon, tip: editForm.tip, phase: editForm.phase,
materials: editForm.materials.split(”\n”).map(x => x.trim()).filter(Boolean),
checklist: editForm.checklist.split(”\n”).map(x => x.trim()).filter(Boolean),
});
await saveTeamSchedule(updated);
setEditing(false);
};

const totalMyDone = DAY_LABELS.filter(d => getProgressPct(d) === 100).length;
const weekDates = getWeekDates(weekOffset);
const today = new Date();

const inp = (extra = {}) => ({
background: “rgba(255,255,255,.05)”, border: “1px solid rgba(201,164,154,.2)”,
borderRadius: 8, padding: “9px 12px”, color: “#f0e4e0”, fontSize: 13,
width: “100%”, boxSizing: “border-box”, outline: “none”, fontFamily: “inherit”, …extra,
});

// ── LOGIN ──
if (screen === “login”) return (
<div style={{ minHeight: “100vh”, background: B.bg, display: “flex”, flexDirection: “column”, alignItems: “center”, justifyContent: “center”, padding: 24 }}>
<div style={{ position: “fixed”, inset: 0, background: “radial-gradient(ellipse at 50% 30%,rgba(201,164,154,.12) 0%,transparent 65%)”, pointerEvents: “none” }} />
<div style={{ position: “relative”, zIndex: 1, width: “100%”, maxWidth: 340 }}>
<div style={{ textAlign: “center”, marginBottom: 32 }}>
<FDRLogo size={64} />
<div style={{ fontSize: 18, fontWeight: 900, letterSpacing: 2, color: B.roseLight, textTransform: “uppercase”, marginTop: 10 }}>Fashion Diva Rich</div>
<div style={{ fontSize: 12, color: B.roseDark, marginTop: 4, letterSpacing: 1 }}>夥伴週計劃系統</div>
</div>
<div style={{ background: B.card, borderRadius: 18, padding: 24, border: `1px solid ${B.rose}20` }}>
<div style={{ fontSize: 13, color: “#9a8580”, marginBottom: 8, fontWeight: 600 }}>你的名字</div>
<input value={nameInput} onChange={e => setNameInput(e.target.value)} onKeyDown={e => e.key === “Enter” && handleLogin()} placeholder=“輸入名字登入…” style={{ …inp(), marginBottom: 16 }} />
<div onClick={() => setIsLeader(v => !v)} style={{ display: “flex”, alignItems: “center”, gap: 10, marginBottom: isLeader ? 12 : 20, cursor: “pointer”, userSelect: “none” }}>
<div style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${isLeader ? B.rose : "#3a2a28"}`, background: isLeader ? B.rose : “transparent”, display: “flex”, alignItems: “center”, justifyContent: “center”, transition: “all .2s” }}>
{isLeader && <span style={{ fontSize: 12, color: “#fff”, fontWeight: 900 }}>✓</span>}
</div>
<span style={{ fontSize: 13, color: “#9a8580” }}>我是團隊長</span>
</div>
{isLeader && <input value={leaderPwInput} onChange={e => setLeaderPwInput(e.target.value)} onKeyDown={e => e.key === “Enter” && handleLogin()} type=“password” placeholder=“團隊長密碼…” style={{ …inp(), marginBottom: 20 }} />}
{loginError && <div style={{ fontSize: 12, color: “#b87878”, marginBottom: 12, textAlign: “center” }}>{loginError}</div>}
<button onClick={handleLogin} disabled={loading} style={{ width: “100%”, background: `linear-gradient(135deg,${B.roseDark},${B.rose})`, border: “none”, borderRadius: 12, padding: “13px”, color: “#fff”, fontWeight: 700, fontSize: 15, cursor: “pointer”, opacity: loading ? 0.7 : 1 }}>
{loading ? “連線中…” : “進入 ✨”}
</button>
</div>
<div style={{ textAlign: “center”, fontSize: 11, color: “#4a3a38”, marginTop: 16 }}>進度資料會同步給團隊長查看</div>
</div>
</div>
);

// ── LEADER ──
if (screen === “leader”) {
const memberNames = Object.keys(membersData).filter(n => n !== myName);
return (
<div style={{ minHeight: “100vh”, background: B.bg, color: “#f5ede8”, fontFamily: “inherit”, maxWidth: 480, margin: “0 auto” }}>
<div style={{ position: “fixed”, inset: 0, maxWidth: 480, margin: “0 auto”, background: “radial-gradient(ellipse at 50% 0%,rgba(201,164,154,.10) 0%,transparent 60%)”, pointerEvents: “none”, zIndex: 0 }} />
<div style={{ position: “relative”, zIndex: 1, padding: “22px 20px 0” }}>
<div style={{ display: “flex”, alignItems: “center”, justifyContent: “space-between”, marginBottom: 14 }}>
<div style={{ display: “flex”, alignItems: “center”, gap: 11 }}>
<FDRLogo size={46} />
<div>
<div style={{ fontSize: 13, fontWeight: 800, letterSpacing: 1.5, color: B.roseLight }}>LEADER 後台</div>
<div style={{ fontSize: 11, color: B.roseDark, marginTop: 1 }}>歡迎，{myName} 👑</div>
</div>
</div>
<button onClick={() => { setScreen(“login”); setMyName(””); }} style={{ background: “rgba(255,255,255,.04)”, border: “1px solid rgba(255,255,255,.08)”, borderRadius: 8, padding: “5px 12px”, color: “#6b5a56”, fontSize: 11, cursor: “pointer” }}>登出</button>
</div>
<div style={{ height: 1, background: `linear-gradient(90deg,transparent,${B.rose}38,transparent)` }} />
</div>
<div style={{ position: “relative”, zIndex: 1, display: “flex”, gap: 4, padding: “13px 20px 0” }}>
{[[“week”,“📋”,“排程管理”],[“team”,“👥”,“夥伴進度”]].map(([v, icon, label]) => (
<button key={v} onClick={() => setTab(v)} style={{ flex: 1, background: tab === v ? `${B.rose}18` : “rgba(255,255,255,.03)”, border: tab === v ? `1px solid ${B.rose}50` : “1px solid rgba(255,255,255,.06)”, borderRadius: 10, padding: “8px 0”, color: tab === v ? B.roseLight : “#7a6560”, fontWeight: tab === v ? 700 : 400, fontSize: 12, cursor: “pointer” }}>
{icon} {label}
</button>
))}
</div>
<div style={{ position: “relative”, zIndex: 1, padding: “14px 20px 100px” }}>
{tab === “week” && (
<div>
<div style={{ fontSize: 12, color: “#6b5a56”, marginBottom: 14 }}>修改後所有夥伴即時看到更新 ✨</div>
{teamSchedule.map((s, i) => (
<div key={s.day} style={{ background: `${s.phaseColor}0d`, border: `1px solid ${s.phaseColor}25`, borderRadius: 14, padding: “13px 14px”, marginBottom: 10, display: “flex”, alignItems: “center”, gap: 12 }}>
<div style={{ fontSize: 26 }}>{s.icon}</div>
<div style={{ flex: 1, minWidth: 0 }}>
<div style={{ fontSize: 10, color: s.phaseColor, fontWeight: 600, marginBottom: 2 }}>{s.day} · {s.phase}</div>
<div style={{ fontSize: 13, fontWeight: 700, color: “#f0e4e0”, whiteSpace: “nowrap”, overflow: “hidden”, textOverflow: “ellipsis” }}>{s.title}</div>
<div style={{ fontSize: 10, color: “#6b5a56”, marginTop: 2 }}>{s.checklist.length} 項清單</div>
</div>
<button onClick={() => openEdit(i)} style={{ background: `${B.rose}15`, border: `1px solid ${B.rose}30`, borderRadius: 8, padding: “6px 12px”, color: B.rose, fontSize: 12, cursor: “pointer”, fontWeight: 600, flexShrink: 0 }}>✏️ 編輯</button>
</div>
))}
</div>
)}
{tab === “team” && (
<div>
{memberNames.length === 0 ? (
<div style={{ textAlign: “center”, padding: “50px 0”, color: “#6b5a56” }}>
<div style={{ fontSize: 32, marginBottom: 12 }}>👥</div>
<div style={{ fontSize: 14 }}>還沒有夥伴登入</div>
<div style={{ fontSize: 12, marginTop: 6 }}>夥伴用手機打開網址登入後就會出現這裡</div>
</div>
) : (
<>
<div style={{ display: “grid”, gridTemplateColumns: “1fr 1fr”, gap: 10, marginBottom: 16 }}>
<div style={{ background: `${B.rose}0d`, border: `1px solid ${B.rose}20`, borderRadius: 12, padding: “14px”, textAlign: “center” }}>
<div style={{ fontSize: 26, fontWeight: 900, color: B.rose }}>{memberNames.length}</div>
<div style={{ fontSize: 11, color: “#6b5a56” }}>活躍夥伴</div>
</div>
<div style={{ background: “rgba(168,213,176,.06)”, border: “1px solid rgba(168,213,176,.15)”, borderRadius: 12, padding: “14px”, textAlign: “center” }}>
<div style={{ fontSize: 26, fontWeight: 900, color: “#a8d5b0” }}>
{memberNames.filter(n => DAY_LABELS.filter(d => getProgressPct(d, membersData[n]) === 100).length >= 6).length}
</div>
<div style={{ fontSize: 11, color: “#6b5a56” }}>進度優秀</div>
</div>
</div>
{memberNames.map(name => {
const prog = membersData[name] || {};
const doneDays = DAY_LABELS.filter(d => getProgressPct(d, prog) === 100).length;
const overallPct = Math.round(DAY_LABELS.reduce((s, d) => s + getProgressPct(d, prog), 0) / DAY_LABELS.length);
return (
<div key={name} style={{ background: B.card2, border: “1px solid rgba(255,255,255,.06)”, borderRadius: 14, padding: “14px 16px”, marginBottom: 12 }}>
<div style={{ display: “flex”, alignItems: “center”, gap: 11, marginBottom: 12 }}>
<Avatar name={name} size={36} />
<div style={{ flex: 1 }}>
<div style={{ fontWeight: 700, fontSize: 14 }}>{name}</div>
<div style={{ fontSize: 11, color: “#6b5a56”, marginTop: 1 }}>{doneDays}/7 天完成 · 整體 {overallPct}%</div>
</div>
<div style={{ fontSize: 20, fontWeight: 900, color: overallPct >= 80 ? “#a8d5b0” : B.rose }}>{overallPct}%</div>
</div>
<div style={{ display: “grid”, gridTemplateColumns: “repeat(7,1fr)”, gap: 4, marginBottom: 10 }}>
{DAY_LABELS.map(d => {
const pct = getProgressPct(d, prog);
const sched = teamSchedule.find(s => s.day === d);
return (
<div key={d} style={{ textAlign: “center” }}>
<div style={{ width: “100%”, aspectRatio: “1”, borderRadius: 8, background: pct === 100 ? “rgba(168,213,176,.2)” : pct > 0 ? `${B.rose}20` : “rgba(255,255,255,.04)”, border: pct === 100 ? “1px solid rgba(168,213,176,.35)” : pct > 0 ? `1px solid ${B.rose}35` : “1px solid rgba(255,255,255,.06)”, display: “flex”, alignItems: “center”, justifyContent: “center”, fontSize: 13 }}>
{pct === 100 ? “✅” : pct > 0 ? <span style={{ fontSize: 8, color: B.rose, fontWeight: 700 }}>{pct}%</span> : <span style={{ fontSize: 11, opacity: 0.4 }}>{sched?.icon || “·”}</span>}
</div>
<div style={{ fontSize: 9, color: “#4a3a38”, marginTop: 2 }}>{d.slice(1)}</div>
</div>
);
})}
</div>
{DAY_LABELS.map(d => {
const pct = getProgressPct(d, prog);
const sched = teamSchedule.find(s => s.day === d);
if (pct === 0) return null;
return (
<div key={d} style={{ display: “flex”, alignItems: “center”, gap: 8, marginBottom: 5 }}>
<div style={{ fontSize: 11, color: “#6b5a56”, width: 22, flexShrink: 0 }}>{d.slice(1)}</div>
<div style={{ flex: 1, height: 4, background: “rgba(255,255,255,.05)”, borderRadius: 2 }}>
<div style={{ height: “100%”, width: `${pct}%`, background: pct === 100 ? “#a8d5b0” : sched?.phaseColor || B.rose, borderRadius: 2, transition: “width .4s” }} />
</div>
<div style={{ fontSize: 10, color: pct === 100 ? “#a8d5b0” : B.rose, width: 28, textAlign: “right”, fontWeight: 600 }}>{pct === 100 ? “✅” : `${pct}%`}</div>
</div>
);
})}
</div>
);
})}
</>
)}
</div>
)}
</div>

```
    {editing && editDayIdx !== null && (
      <div style={{ position: "fixed", inset: 0, background: "rgba(10,6,5,.85)", zIndex: 100, display: "flex", alignItems: "flex-end", maxWidth: 480, margin: "0 auto" }} onClick={() => setEditing(false)}>
        <div style={{ width: "100%", background: B.card, borderRadius: "22px 22px 0 0", padding: "20px 20px 36px", maxHeight: "90vh", overflowY: "auto", borderTop: `1px solid ${B.rose}30` }} onClick={e => e.stopPropagation()}>
          <div style={{ width: 36, height: 3, background: `${B.rose}38`, borderRadius: 2, margin: "0 auto 18px" }} />
          <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 2 }}>✏️ 編輯 {teamSchedule[editDayIdx]?.day}</div>
          <div style={{ fontSize: 12, color: "#6b5a56", marginBottom: 18 }}>儲存後所有夥伴立即看到更新</div>
          {[["標題","title","input"],["Emoji","icon","input"],["階段名稱","phase","input"],["策略提示","tip","ta3"]].map(([label,key,type]) => (
            <div key={key} style={{ marginBottom: 13 }}>
              <div style={{ fontSize: 12, color: "#9a8580", marginBottom: 5, fontWeight: 600 }}>{label}</div>
              {type === "input" ? <input value={editForm[key]||""} onChange={e => setEditForm(f=>({...f,[key]:e.target.value}))} style={inp()} /> : <textarea value={editForm[key]||""} onChange={e => setEditForm(f=>({...f,[key]:e.target.value}))} rows={3} style={{...inp(),resize:"vertical"}} />}
            </div>
          ))}
          <div style={{ marginBottom: 13 }}>
            <div style={{ fontSize: 12, color: "#9a8580", marginBottom: 5, fontWeight: 600 }}>建議素材 <span style={{ fontWeight: 400, color: "#6b5a56" }}>(每行一項)</span></div>
            <textarea value={editForm.materials||""} onChange={e => setEditForm(f=>({...f,materials:e.target.value}))} rows={4} style={{...inp(),resize:"vertical"}} />
          </div>
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 12, color: "#9a8580", marginBottom: 5, fontWeight: 600 }}>執行清單 <span style={{ fontWeight: 400, color: "#6b5a56" }}>(每行一項)</span></div>
            <textarea value={editForm.checklist||""} onChange={e => setEditForm(f=>({...f,checklist:e.target.value}))} rows={5} style={{...inp(),resize:"vertical"}} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setEditing(false)} style={{ flex: 1, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 12, padding: "13px", color: "#9a8580", fontSize: 14, cursor: "pointer" }}>取消</button>
            <button onClick={saveEdit} style={{ flex: 2, background: `linear-gradient(135deg,${B.roseDark},${B.rose})`, border: "none", borderRadius: 12, padding: "13px", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>💾 儲存並推送</button>
          </div>
        </div>
      </div>
    )}
  </div>
);
```

}

// ── PARTNER ──
return (
<div style={{ minHeight: “100vh”, background: B.bg, color: “#f5ede8”, fontFamily: “inherit”, maxWidth: 480, margin: “0 auto” }}>
<div style={{ position: “fixed”, inset: 0, maxWidth: 480, margin: “0 auto”, background: “radial-gradient(ellipse at 50% 0%,rgba(201,164,154,.10) 0%,transparent 60%),radial-gradient(ellipse at 80% 90%,rgba(160,120,144,.06) 0%,transparent 55%)”, pointerEvents: “none”, zIndex: 0 }} />
<div style={{ position: “relative”, zIndex: 1, padding: “22px 20px 0” }}>
<div style={{ display: “flex”, alignItems: “center”, justifyContent: “space-between”, marginBottom: 14 }}>
<div style={{ display: “flex”, alignItems: “center”, gap: 11 }}>
<FDRLogo size={46} />
<div>
<div style={{ fontSize: 13, fontWeight: 800, letterSpacing: 1.5, color: B.roseLight, textTransform: “uppercase” }}>Fashion Diva Rich</div>
<div style={{ fontSize: 11, color: B.roseDark, marginTop: 1 }}>Hi，{myName} 🌹</div>
</div>
</div>
<div style={{ textAlign: “right” }}>
<div style={{ fontSize: 26, fontWeight: 900, color: B.rose, lineHeight: 1 }}>{totalMyDone}<span style={{ fontSize: 11, color: “#6b5a56”, fontWeight: 400 }}>/{DAY_LABELS.length}</span></div>
<div style={{ fontSize: 10, color: “#6b5a56”, marginBottom: 4 }}>本週完成</div>
<div style={{ width: 56, height: 3, background: “rgba(201,164,154,.12)”, borderRadius: 2, marginLeft: “auto” }}>
<div style={{ height: “100%”, width: `${(totalMyDone/DAY_LABELS.length)*100}%`, background: `linear-gradient(90deg,${B.roseDark},${B.roseLight})`, borderRadius: 2, transition: “width .5s” }} />
</div>
</div>
</div>
<div style={{ height: 1, background: `linear-gradient(90deg,transparent,${B.rose}38,transparent)` }} />
</div>
<div style={{ position: “relative”, zIndex: 1, display: “flex”, gap: 4, padding: “13px 20px 0” }}>
{[[“week”,“📅”,“週計劃”],[“progress”,“✅”,“進度”],[“guide”,“📖”,“攻略”]].map(([v, icon, label]) => (
<button key={v} onClick={() => setTab(v)} style={{ flex: 1, background: tab === v ? `${B.rose}18` : “rgba(255,255,255,.03)”, border: tab === v ? `1px solid ${B.rose}50` : “1px solid rgba(255,255,255,.06)”, borderRadius: 10, padding: “8px 0”, color: tab === v ? B.roseLight : “#7a6560”, fontWeight: tab === v ? 700 : 400, fontSize: 12, cursor: “pointer” }}>
{icon} {label}
</button>
))}
</div>
<div style={{ position: “relative”, zIndex: 1, padding: “14px 20px 100px” }}>
{tab === “week” && (
<div>
<div style={{ display: “flex”, alignItems: “center”, justifyContent: “space-between”, marginBottom: 14 }}>
<button onClick={() => setWeekOffset(o=>o-1)} style={{ background: “none”, border: “none”, color: “#7a6560”, fontSize: 22, cursor: “pointer”, padding: “0 8px” }}>‹</button>
<span style={{ fontSize: 12, color: “#9a8580” }}>
{weekOffset === 0 ? “本週” : weekOffset > 0 ? `+${weekOffset} 週` : `${weekOffset} 週`}
<span style={{ color: “#4a3a38”, fontSize: 11, marginLeft: 6 }}>
{weekDates[0].getMonth()+1}/{weekDates[0].getDate()} – {weekDates[6].getMonth()+1}/{weekDates[6].getDate()}
</span>
</span>
<button onClick={() => setWeekOffset(o=>o+1)} style={{ background: “none”, border: “none”, color: “#7a6560”, fontSize: 22, cursor: “pointer”, padding: “0 8px” }}>›</button>
</div>
<div style={{ display: “flex”, flexDirection: “column”, gap: 8 }}>
{DAY_LABELS.map((dayLabel, i) => {
const sched = teamSchedule.find(s => s.day === dayLabel);
const d = weekDates[i];
const isToday = weekOffset === 0 && d.getDate() === today.getDate() && d.getMonth() === today.getMonth();
const prog = sched ? getProgressPct(dayLabel) : 0;
return (
<div key={dayLabel} style={{ background: isToday ? `${B.rose}10` : “rgba(255,255,255,.02)”, border: isToday ? `1px solid ${B.rose}38` : “1px solid rgba(255,255,255,.05)”, borderRadius: 14, overflow: “hidden” }}>
<div style={{ display: “flex”, alignItems: “center”, padding: “11px 14px”, gap: 11 }}>
<div style={{ textAlign: “center”, minWidth: 32 }}>
<div style={{ fontSize: 18, fontWeight: 900, color: isToday ? B.roseLight : “#d4c0bc”, lineHeight: 1 }}>{d.getDate()}</div>
<div style={{ fontSize: 10, color: isToday ? B.rose : “#6b5a56”, marginTop: 1 }}>{dayLabel}</div>
</div>
{sched ? (
<div style={{ flex: 1, minWidth: 0 }}>
<div style={{ display: “flex”, alignItems: “center”, gap: 5, marginBottom: 2 }}>
<span style={{ fontSize: 10, color: sched.phaseColor, fontWeight: 600 }}>{sched.phase}</span>
{isToday && <span style={{ fontSize: 9, background: `${B.rose}22`, color: B.roseLight, borderRadius: 4, padding: “1px 5px”, fontWeight: 700 }}>TODAY</span>}
</div>
<div style={{ fontSize: 13, fontWeight: 700, color: “#f0e4e0”, whiteSpace: “nowrap”, overflow: “hidden”, textOverflow: “ellipsis” }}>{sched.icon} {sched.title}</div>
</div>
) : <div style={{ flex: 1, fontSize: 12, color: “#4a3a38” }}>休息日</div>}
{sched && (
<div style={{ display: “flex”, flexDirection: “column”, alignItems: “flex-end”, gap: 5, flexShrink: 0 }}>
<span style={{ fontSize: 12, fontWeight: 700, color: prog === 100 ? “#a8d5b0” : “#6b5a56” }}>{prog === 100 ? “✅” : prog > 0 ? `${prog}%` : “”}</span>
<button onClick={() => setSelected(dayLabel)} style={{ background: `${B.rose}18`, border: `1px solid ${B.rose}35`, borderRadius: 7, padding: “4px 10px”, color: B.rose, fontSize: 11, cursor: “pointer”, fontWeight: 600 }}>開始</button>
</div>
)}
</div>
{sched && prog > 0 && (
<div style={{ height: 2, background: “rgba(255,255,255,.04)” }}>
<div style={{ height: “100%”, width: `${prog}%`, background: `linear-gradient(90deg,${sched.phaseColor}66,${sched.phaseColor})`, transition: “width .4s” }} />
</div>
)}
</div>
);
})}
</div>
</div>
)}
{tab === “progress” && (
<div>
<div style={{ fontSize: 12, color: “#6b5a56”, marginBottom: 14 }}>點擊卡片更新執行清單 ✨</div>
{teamSchedule.map(sched => {
const prog = getProgressPct(sched.day);
const checks = getChecks(sched.day);
return (
<div key={sched.day} onClick={() => setSelected(sched.day)} style={{ background: `${sched.phaseColor}0f`, border: `1px solid ${sched.phaseColor}25`, borderRadius: 14, padding: “13px 16px”, marginBottom: 10, cursor: “pointer”, display: “flex”, gap: 13, alignItems: “center” }}>
<div style={{ fontSize: 28 }}>{sched.icon}</div>
<div style={{ flex: 1, minWidth: 0 }}>
<div style={{ display: “flex”, gap: 6, alignItems: “center”, marginBottom: 3 }}>
<span style={{ fontSize: 10, color: “#6b5a56” }}>{sched.day}</span>
<span style={{ fontSize: 10, color: sched.phaseColor, fontWeight: 600 }}>{sched.phase}</span>
</div>
<div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6, whiteSpace: “nowrap”, overflow: “hidden”, textOverflow: “ellipsis”, color: “#f0e4e0” }}>{sched.title}</div>
<div style={{ height: 4, background: “rgba(255,255,255,.07)”, borderRadius: 2 }}>
<div style={{ height: “100%”, width: `${prog}%`, background: `linear-gradient(90deg,${sched.phaseColor}88,${sched.phaseColor})`, borderRadius: 2, transition: “width .4s” }} />
</div>
<div style={{ display: “flex”, justifyContent: “space-between”, marginTop: 4 }}>
<span style={{ fontSize: 10, color: “#6b5a56” }}>{checks.filter(Boolean).length}/{sched.checklist.length} 項</span>
<span style={{ fontSize: 10, fontWeight: 700, color: prog === 100 ? “#a8d5b0” : sched.phaseColor }}>{prog === 100 ? “完成 ✅” : prog > 0 ? `${prog}%` : “未開始”}</span>
</div>
</div>
</div>
);
})}
</div>
)}
{tab === “guide” && (
<div>
<div style={{ background: `${B.rose}0f`, border: `1px solid ${B.rose}28`, borderRadius: 16, padding: “16px”, marginBottom: 16, display: “flex”, gap: 12, alignItems: “center” }}>
<FDRLogo size={48} />
<div>
<div style={{ fontWeight: 900, fontSize: 13, color: B.roseLight, letterSpacing: 1, marginBottom: 4 }}>Fashion Diva Rich</div>
<div style={{ fontSize: 11, color: “#9a8580”, lineHeight: 1.9 }}>週一播種 → 週二升溫 → 週三建信任<br/>週四推決策 → 週五收割 → 週六強化 → 週日留白</div>
</div>
</div>
{teamSchedule.map(sched => (
<div key={sched.day} style={{ background: `${sched.phaseColor}0f`, border: `1px solid ${sched.phaseColor}25`, borderRadius: 14, padding: “14px 16px”, marginBottom: 12 }}>
<div style={{ display: “flex”, alignItems: “center”, gap: 10, marginBottom: 10 }}>
<span style={{ fontSize: 22 }}>{sched.icon}</span>
<div>
<div style={{ fontWeight: 800, fontSize: 14, color: sched.phaseColor }}>{sched.day}｜{sched.title}</div>
<div style={{ fontSize: 10, color: “#6b5a56”, marginTop: 1 }}>{sched.phase}</div>
</div>
</div>
{sched.tip && (
<div style={{ background: “rgba(0,0,0,.22)”, borderRadius: 10, padding: “10px 12px”, marginBottom: 8, borderLeft: `2px solid ${sched.phaseColor}` }}>
<div style={{ fontSize: 10, color: “#6b5a56”, marginBottom: 3 }}>💡 策略提示</div>
<div style={{ fontSize: 12, color: “#c8b0aa”, lineHeight: 1.7 }}>{sched.tip}</div>
</div>
)}
<div style={{ fontSize: 11, color: “#6b5a56” }}><span style={{ color: “#9a8580”, fontWeight: 600 }}>素材：</span>{sched.materials.join(” · “)}</div>
</div>
))}
</div>
)}
</div>

```
  {selected && (() => {
    const sched = teamSchedule.find(s => s.day === selected);
    if (!sched) return null;
    const checks = getChecks(selected);
    const prog = getProgressPct(selected);
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(10,6,5,.82)", zIndex: 100, display: "flex", alignItems: "flex-end", maxWidth: 480, margin: "0 auto" }} onClick={() => setSelected(null)}>
        <div style={{ width: "100%", background: B.card, borderRadius: "22px 22px 0 0", padding: "20px 20px 36px", maxHeight: "90vh", overflowY: "auto", borderTop: `1px solid ${B.rose}28` }} onClick={e => e.stopPropagation()}>
          <div style={{ width: 36, height: 3, background: `${B.rose}38`, borderRadius: 2, margin: "0 auto 18px" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 14, opacity: .45 }}>
            <FDRLogo size={20} /><span style={{ fontSize: 10, color: B.rose, letterSpacing: 1.5 }}>FASHION DIVA RICH</span>
          </div>
          <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
            <div style={{ fontSize: 36 }}>{sched.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: "#f5ede8", lineHeight: 1.2, marginBottom: 5 }}>{sched.title}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <span style={{ fontSize: 11, color: sched.phaseColor, background: `${sched.phaseColor}18`, borderRadius: 6, padding: "2px 8px" }}>{sched.phase}</span>
                <span style={{ fontSize: 11, color: "#6b5a56", background: "rgba(255,255,255,.04)", borderRadius: 6, padding: "2px 8px" }}>📅 {selected}</span>
              </div>
            </div>
            <div style={{ fontSize: 18, fontWeight: 900, color: prog === 100 ? "#a8d5b0" : sched.phaseColor }}>{prog === 100 ? "✅" : `${prog}%`}</div>
          </div>
          {sched.tip && (
            <div style={{ background: "rgba(0,0,0,.28)", borderRadius: 12, padding: "12px 14px", marginBottom: 14, borderLeft: `3px solid ${sched.phaseColor}` }}>
              <div style={{ fontSize: 10, color: "#6b5a56", marginBottom: 4 }}>💡 今日策略提示</div>
              <div style={{ fontSize: 13, color: "#c8b0aa", lineHeight: 1.7 }}>{sched.tip}</div>
            </div>
          )}
          {sched.materials.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#9a8580", marginBottom: 8 }}>📸 建議素材</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {sched.materials.map((m,i) => <span key={i} style={{ fontSize: 11, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 8, padding: "4px 10px", color: "#9a8580" }}>{m}</span>)}
              </div>
            </div>
          )}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#9a8580" }}>✅ 執行清單</div>
              <span style={{ fontSize: 11, color: sched.phaseColor }}>{checks.filter(Boolean).length}/{checks.length} 完成</span>
            </div>
            <div style={{ height: 3, background: "rgba(255,255,255,.06)", borderRadius: 2, marginBottom: 12 }}>
              <div style={{ height: "100%", width: `${prog}%`, background: `linear-gradient(90deg,${sched.phaseColor}77,${sched.phaseColor})`, borderRadius: 2, transition: "width .3s" }} />
            </div>
            {sched.checklist.map((item, i) => (
              <div key={i} onClick={() => toggleCheck(selected, i)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderBottom: "1px solid rgba(255,255,255,.04)", cursor: "pointer" }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${checks[i] ? sched.phaseColor : "#3a2a28"}`, background: checks[i] ? sched.phaseColor : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .2s" }}>
                  {checks[i] && <span style={{ fontSize: 13, color: "#fff", fontWeight: 900 }}>✓</span>}
                </div>
                <span style={{ fontSize: 14, color: checks[i] ? "#4a3a38" : "#e8d8d4", textDecoration: checks[i] ? "line-through" : "none" }}>{item}</span>
              </div>
            ))}
          </div>
          {prog === 100 && (
            <div style={{ background: `${B.rose}0e`, border: `1px solid ${B.rose}28`, borderRadius: 14, padding: "16px", textAlign: "center", marginBottom: 14 }}>
              <div style={{ fontSize: 22, marginBottom: 5 }}>✨</div>
              <div style={{ fontSize: 14, color: B.roseLight, fontWeight: 700, marginBottom: 2 }}>今日任務完成！</div>
              <div style={{ fontSize: 11, color: B.roseDark }}>Fashion Diva Rich 為妳驕傲 🌹</div>
            </div>
          )}
          <button onClick={() => setSelected(null)} style={{ width: "100%", background: `${B.rose}12`, border: `1px solid ${B.rose}25`, borderRadius: 12, padding: "14px", color: B.rose, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>關閉</button>
        </div>
      </div>
    );
  })()}
</div>
```

);
}
