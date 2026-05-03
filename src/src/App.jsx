import { useState } from "react";
 
const CLAUDE_API = "https://api.anthropic.com/v1/messages";
 
function toNum(n) {
  return parseInt(String(n).replace(/[^0-9]/g, "")) || 0;
}
function fmt(n) {
  const num = toNum(n);
  if (num === 0) return "—";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return num.toLocaleString();
}
 
function ScoreBadge({ score }) {
  const s = parseInt(score) || 0;
  const color = s >= 8 ? "success" : s >= 5 ? "warning" : "danger";
  return (
    <span style={{
      background: `var(--color-background-${color})`,
      color: `var(--color-text-${color})`,
      fontSize: 11, fontWeight: 500,
      padding: "2px 10px", borderRadius: 99, flexShrink: 0
    }}>バイラル {s}/10</span>
  );
}
 
function Tag({ children, color = "secondary" }) {
  return (
    <span style={{
      background: `var(--color-background-${color})`,
      color: `var(--color-text-${color})`,
      fontSize: 11, padding: "2px 8px", borderRadius: 99,
      whiteSpace: "nowrap", fontWeight: 500
    }}>{children}</span>
  );
}
 
function Section({ title, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {title}
      </div>
      <div style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.7 }}>
        {children}
      </div>
    </div>
  );
}
 
function UrlBox({ label, url }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setOpen(v => !v)} style={{
        fontSize: 11, padding: "3px 10px", cursor: "pointer",
        background: open ? "var(--color-background-info)" : "var(--color-background-secondary)",
        color: open ? "var(--color-text-info)" : "var(--color-text-secondary)",
        border: "0.5px solid var(--color-border-tertiary)",
        borderRadius: 99, whiteSpace: "nowrap"
      }}>
        {open ? "▲ 閉じる" : `${label} URLを表示`}
      </button>
      {open && (
        <div style={{
          marginTop: 6, padding: "8px 10px",
          background: "var(--color-background-secondary)",
          border: "0.5px solid var(--color-border-info)",
          borderRadius: "var(--border-radius-md)",
          fontSize: 12, wordBreak: "break-all",
          color: "var(--color-text-info)", lineHeight: 1.6, userSelect: "all"
        }}>
          {url}
          <div style={{ fontSize: 10, color: "var(--color-text-tertiary)", marginTop: 4, userSelect: "none" }}>
            ↑ 長押し or ダブルクリックで全選択 → コピーしてブラウザで開く
          </div>
        </div>
      )}
    </div>
  );
}
 
function VideoCard({ v, rank }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div style={{
      background: "var(--color-background-primary)",
      border: "0.5px solid var(--color-border-tertiary)",
      borderRadius: "var(--border-radius-lg)",
      padding: "1rem 1.25rem",
      display: "flex", flexDirection: "column", gap: 12
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <span style={{
          width: 24, height: 24, borderRadius: "50%", flexShrink: 0, marginTop: 1,
          background: rank === 1 ? "var(--color-background-warning)" : "var(--color-background-secondary)",
          color: rank === 1 ? "var(--color-text-warning)" : "var(--color-text-tertiary)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, fontWeight: 600
        }}>{rank}</span>
        <div style={{ flex: 1 }}>
          <p style={{ margin: "0 0 3px", fontSize: 14, fontWeight: 500, lineHeight: 1.4 }}>{v.title}</p>
          <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-tertiary)" }}>{v.channel}</p>
        </div>
        <ScoreBadge score={v.viral_score} />
      </div>
 
      {/* Tags row */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {v.country && <Tag color="info">🌍 {v.country}</Tag>}
        {v.format && <Tag color="secondary">{v.format === "long" ? "🎬 ロング" : v.format === "short" ? "⚡ ショート" : `📹 ${v.format}`}</Tag>}
        {v.upload_freq && <Tag color="secondary">📅 {v.upload_freq}</Tag>}
        {v.upload_day && <Tag color="secondary">📆 {v.upload_day}</Tag>}
        {v.upload_time_jst && <Tag color="secondary">🕐 {v.upload_time_jst}</Tag>}
      </div>
 
      {/* Stats */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6,
        padding: "10px 0",
        borderTop: "0.5px solid var(--color-border-tertiary)",
        borderBottom: "0.5px solid var(--color-border-tertiary)"
      }}>
        {[["再生数", fmt(v.views)], ["高評価", fmt(v.likes)], ["コメント", fmt(v.comments)]].map(([label, val]) => (
          <div key={label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginBottom: 2 }}>{label}</div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>{val}</div>
          </div>
        ))}
      </div>
 
      {/* Core analysis */}
      <Section title="バイラル理由">
        {v.analysis}
      </Section>
 
      {/* Expandable detail */}
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          background: "var(--color-background-secondary)",
          border: "none", borderRadius: "var(--border-radius-md)",
          padding: "8px 12px", fontSize: 12, cursor: "pointer",
          color: "var(--color-text-secondary)", textAlign: "left"
        }}
      >
        {expanded ? "▲ 詳細を閉じる" : "▼ サムネイル・競合攻略を見る"}
      </button>
 
      {expanded && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {v.thumbnail_style && (
            <Section title="サムネイルスタイル">
              {v.thumbnail_style}
            </Section>
          )}
          {v.competitive_advice && (
            <div style={{
              background: "var(--color-background-success)",
              borderRadius: "var(--border-radius-md)",
              padding: "10px 14px"
            }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-success)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                🏆 このチャンネルに勝つ方法
              </div>
              <div style={{ fontSize: 13, color: "var(--color-text-success)", lineHeight: 1.7 }}>
                {v.competitive_advice}
              </div>
            </div>
          )}
        </div>
      )}
 
      {/* URLs */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {v.url && v.url.includes("youtube") && <UrlBox label="動画" url={v.url} />}
        <UrlBox label="チャンネル" url={`https://www.youtube.com/@${v.channel.replace(/\s+/g, "")}`} />
      </div>
    </div>
  );
}
 
function Spinner() {
  return (
    <span style={{
      display: "inline-block", width: 14, height: 14,
      border: "1.5px solid var(--color-border-tertiary)",
      borderTop: "1.5px solid var(--color-text-primary)",
      borderRadius: "50%", animation: "spin 0.6s linear infinite"
    }} />
  );
}
 
function extractVideos(text) {
  let clean = text.replace(/```json|```/g, "").trim();
  try {
    const p = JSON.parse(clean);
    if (p.videos) return p.videos;
  } catch (_) {}
 
  const videos = [];
  const objRegex = /\{[^{}]*"title"[^{}]*\}/gs;
  const matches = clean.match(objRegex) || [];
  for (const m of matches) {
    try {
      const obj = JSON.parse(m.replace(/,\s*([}\]])/g, "$1"));
      if (obj.title) videos.push(obj);
    } catch (_) {
      const get = (key) => { const r = new RegExp(`"${key}"\\s*:\\s*"([^"]*)"`, "i"); const match = m.match(r); return match ? match[1] : ""; };
      const getNum = (key) => { const r = new RegExp(`"${key}"\\s*:\\s*([0-9]+)`, "i"); const match = m.match(r); return match ? match[1] : "0"; };
      const title = get("title");
      if (title) videos.push({
        title, channel: get("channel"), url: get("url"),
        views: getNum("views"), likes: getNum("likes"), comments: getNum("comments"),
        viral_score: getNum("viral_score") || "5",
        country: get("country"), format: get("format"), upload_freq: get("upload_freq"), upload_day: get("upload_day"), upload_time_jst: get("upload_time_jst"),
        analysis: get("analysis"), thumbnail_style: get("thumbnail_style"), competitive_advice: get("competitive_advice"),
      });
    }
  }
  return videos;
}
 
export default function App() {
  const [keyword, setKeyword] = useState("");
  const [videos, setVideos] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
 
  async function analyze() {
    if (!keyword.trim() || loading) return;
    setLoading(true);
    setVideos(null);
    setError("");
    setStatus("YouTubeを検索中...");
 
    const prompt = `Search YouTube for the keyword: ${keyword}
 
Research 5 real popular YouTube videos. Search for each channel to find accurate details including upload schedule and timing.
Return ONLY valid JSON with no markdown, no code blocks, no apostrophes in values.
 
Use this exact format:
{"videos":[{"title":"exact video title","channel":"channel name","url":"https://youtube.com/watch?v=VIDEOID","views":52000000,"likes":980000,"comments":42000,"viral_score":9,"country":"Country name in Japanese (e.g. アメリカ, 日本, イギリス)","format":"long or short or mixed","upload_freq":"upload frequency in Japanese (e.g. 週1回, 週3回, 月2回, 毎日)","upload_day":"day of week in Japanese (e.g. 毎週月曜日, 火金曜日, 不定期, 不明)","upload_time_jst":"upload time in Japan Standard Time (e.g. 午前8時JST, 午後6時JST, 不明)","analysis":"2 sentences in Japanese: why this video went viral and what the key success factor is","thumbnail_style":"2 sentences in Japanese describing the visual style of thumbnails - colors, text, face or not, mood","competitive_advice":"3 sentences in Japanese: specific actionable advice on how a new creator can beat or differentiate from this channel"}]}
 
Research all 5 videos carefully and return valid JSON only.`;
 
    try {
      const res = await fetch(CLAUDE_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4000,
          tools: [{ type: "web_search_20250305", name: "web_search" }],
          messages: [{ role: "user", content: prompt }]
        })
      });
 
      const data = await res.json();
      setStatus("データを解析中...");
 
      const textBlock = data.content?.find(b => b.type === "text");
      if (!textBlock?.text) throw new Error("レスポンスが空でした");
 
      const extracted = extractVideos(textBlock.text);
      if (extracted.length === 0) throw new Error("動画データを取得できませんでした。もう一度お試しください。");
 
      const sorted = extracted.sort((a, b) => toNum(b.views) - toNum(a.views));
      setVideos(sorted);
    } catch (e) {
      setError(e.message || "エラーが発生しました。もう一度お試しください。");
    } finally {
      setLoading(false);
      setStatus("");
    }
  }
 
  const totalViews = videos?.reduce((s, v) => s + toNum(v.views), 0) || 0;
  const avgScore = videos?.length
    ? Math.round(videos.reduce((s, v) => s + (parseInt(v.viral_score) || 0), 0) / videos.length) : 0;
 
  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ padding: "1.5rem 0", maxWidth: 680 }}>
        <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 500 }}>YouTube バイラル分析</h2>
        <p style={{ margin: "0 0 1.5rem", fontSize: 14, color: "var(--color-text-secondary)" }}>
          再生数・サムネイル・投稿頻度・国・競合攻略までAIが詳細分析
        </p>
 
        <div style={{
          background: "var(--color-background-primary)",
          border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: "var(--border-radius-lg)",
          padding: "1rem 1.25rem", marginBottom: "1rem",
          display: "flex", gap: 10, alignItems: "center"
        }}>
          <input
            type="text"
            placeholder="例: jazz playlist / インテリア / 作曲 / lo-fi"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && analyze()}
            style={{ flex: 1, fontSize: 14 }}
          />
          <button
            onClick={analyze}
            disabled={loading || !keyword.trim()}
            style={{
              padding: "8px 18px", fontSize: 13, fontWeight: 500, flexShrink: 0,
              opacity: loading || !keyword.trim() ? 0.45 : 1,
              cursor: loading || !keyword.trim() ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", gap: 6
            }}
          >
            {loading && <Spinner />}
            {loading ? "分析中..." : "分析する"}
          </button>
        </div>
 
        {status && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Spinner /><span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>{status}</span>
          </div>
        )}
 
        {error && (
          <div style={{
            background: "var(--color-background-danger)", color: "var(--color-text-danger)",
            borderRadius: "var(--border-radius-md)", padding: "10px 14px", fontSize: 13, marginBottom: "1rem"
          }}>{error}</div>
        )}
 
        {videos && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: "1.25rem" }}>
              {[
                { label: "取得動画数", value: `${videos.length}本` },
                { label: "合計再生数", value: fmt(totalViews) },
                { label: "平均バイラル度", value: `${avgScore}/10` }
              ].map(m => (
                <div key={m.label} style={{
                  background: "var(--color-background-secondary)",
                  borderRadius: "var(--border-radius-md)", padding: "12px 14px"
                }}>
                  <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginBottom: 4 }}>{m.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 500 }}>{m.value}</div>
                </div>
              ))}
            </div>
 
            <div style={{ fontSize: 12, color: "var(--color-text-tertiary)", marginBottom: 10 }}>
              再生数の多い順 ／ 各カードの「▼ サムネイル・競合攻略を見る」で詳細表示
            </div>
 
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {videos.map((v, i) => <VideoCard key={i} v={v} rank={i + 1} />)}
            </div>
          </>
        )}
      </div>
    </>
  );
}
