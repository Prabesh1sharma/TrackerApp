"use client";

import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import Card from "@/components/ui/Card";
import ProgressRing from "@/components/ui/ProgressRing";
import Badge from "@/components/ui/Badge";
import { HiOutlineLightBulb, HiOutlineTrendingUp, HiOutlineTrendingDown, HiOutlineMinus } from "react-icons/hi";

interface HabitStat {
  id: string;
  name: string;
  emoji: string;
  rate: number;
  completedCount: number;
  totalCount: number;
  currentStreak: number;
  bestStreak: number;
  recent30Rate: number | null;
}

interface InsightsData {
  consistencyScore: number;
  consistencyContext: { doneDays: number; totalDays: number; missedDays: number; label: string };
  trend: string;
  trendDelta: number;
  monthlyRates: { month: string; rate: number; completed: number; total: number }[];
  habitBreakdown: HabitStat[];
  bestHabit: HabitStat | null;
  worstHabit: HabitStat | null;
  insights: string[];
  badges: { name: string; emoji: string; earned: boolean; description: string }[];
}

// ── Inline sparkline line chart ────────────────────────────────────────────────
function MonthlyLineChart({ data }: { data: { month: string; rate: number }[] }) {
  const W = 560, H = 160, PAD = { top: 16, right: 16, bottom: 32, left: 36 };
  const inner = { w: W - PAD.left - PAD.right, h: H - PAD.top - PAD.bottom };
  const maxVal = 100;
  const xStep = inner.w / Math.max(data.length - 1, 1);
  const pts = data.map((d, i) => ({
    x: PAD.left + i * xStep,
    y: PAD.top + inner.h - (d.rate / maxVal) * inner.h,
    ...d,
  }));

  const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const areaD = `${pathD} L ${pts[pts.length - 1].x.toFixed(1)} ${(PAD.top + inner.h).toFixed(1)} L ${pts[0].x.toFixed(1)} ${(PAD.top + inner.h).toFixed(1)} Z`;

  const yTicks = [0, 25, 50, 75, 100];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", overflow: "visible" }}>
      {/* Y gridlines */}
      {yTicks.map((t) => {
        const y = PAD.top + inner.h - (t / maxVal) * inner.h;
        return (
          <g key={t}>
            <line x1={PAD.left} y1={y} x2={PAD.left + inner.w} y2={y} stroke="rgba(128,122,118,0.15)" strokeWidth="1" />
            <text x={PAD.left - 6} y={y + 4} textAnchor="end" fontSize="11" fill="#6b6560">{t}%</text>
          </g>
        );
      })}

      {/* Area fill */}
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5b8fb9" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#5b8fb9" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#areaGrad)" />

      {/* Line */}
      <path d={pathD} fill="none" stroke="#5b8fb9" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

      {/* Points + labels */}
      {pts.map((p) => (
        <g key={p.month}>
          <circle cx={p.x} cy={p.y} r="4" fill="#5b8fb9" stroke="#1e1c1a" strokeWidth="2" />
          {/* X labels */}
          <text x={p.x} y={PAD.top + inner.h + 18} textAnchor="middle" fontSize="11" fill="#6b6560">{p.month}</text>
        </g>
      ))}
    </svg>
  );
}

// ── Rate pill color helper ─────────────────────────────────────────────────────
function ratePillStyle(rate: number): React.CSSProperties {
  if (rate >= 80) return { background: "rgba(93,168,126,0.15)", color: "#5da87e" };
  if (rate >= 60) return { background: "rgba(91,143,185,0.15)", color: "#5b8fb9" };
  if (rate >= 40) return { background: "rgba(201,168,76,0.15)", color: "#c9a84c" };
  return { background: "rgba(199,95,95,0.15)", color: "#c75f5f" };
}

function RateBar({ rate }: { rate: number }) {
  const color = rate >= 80 ? "#5da87e" : rate >= 60 ? "#5b8fb9" : rate >= 40 ? "#c9a84c" : "#c75f5f";
  return (
    <div style={{ width: "80px", height: "6px", background: "#2e2b28", borderRadius: "9999px", overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${rate}%`, background: color, borderRadius: "9999px", transition: "width 0.6s ease" }} />
    </div>
  );
}

export default function InsightsPage() {
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats/insights")
      .then((r) => r.json())
      .then(setData)
      .catch(() => toast.error("Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <div className="animate-spin" style={{ width: "32px", height: "32px", border: "2px solid rgba(91,143,185,0.3)", borderTopColor: "#5b8fb9", borderRadius: "50%" }} />
    </div>
  );
  if (!data) return null;

  const TrendIcon = data.trend === "improving"
    ? <HiOutlineTrendingUp style={{ width: "16px", height: "16px" }} />
    : data.trend === "declining"
      ? <HiOutlineTrendingDown style={{ width: "16px", height: "16px" }} />
      : <HiOutlineMinus style={{ width: "16px", height: "16px" }} />;

  const trendColor = data.trend === "improving" ? "#5da87e" : data.trend === "declining" ? "#c75f5f" : "#9c9490";
  const trendSign = data.trendDelta > 0 ? "+" : "";

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#e8e0d8" }}>Insights</h1>
        <p style={{ color: "#9c9490", fontSize: "14px", marginTop: "4px" }}>Understand your patterns</p>
      </div>

      {/* ── Top stats row ──────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "24px" }}>

        {/* Consistency score with context */}
        <Card style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "24px", gap: "10px" }}>
          <ProgressRing progress={data.consistencyScore} size={90} strokeWidth={7} goalMet={data.consistencyScore >= 80} />
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "13px", fontWeight: 600, color: "#e8e0d8" }}>{data.consistencyContext.label}</p>
            <p style={{ fontSize: "12px", color: "#6b6560", marginTop: "4px" }}>
              {data.consistencyContext.doneDays} active · {data.consistencyContext.missedDays} missed
            </p>
          </div>
        </Card>

        {/* Trend with delta */}
        <Card style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", gap: "6px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: trendColor }}>
            {TrendIcon}
            <span style={{ fontSize: "20px", fontWeight: 700, textTransform: "capitalize" }}>{data.trend}</span>
          </div>
          <p style={{ fontSize: "13px", color: trendColor, fontWeight: 600 }}>
            {trendSign}{data.trendDelta}% vs prior 4 weeks
          </p>
          <p style={{ fontSize: "11px", color: "#6b6560" }}>4-week comparison</p>
        </Card>

        {/* Best habit */}
        {data.bestHabit && (
          <Card style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", gap: "6px" }}>
            <span style={{ fontSize: "28px" }}>{data.bestHabit.emoji}</span>
            <p style={{ fontSize: "13px", fontWeight: 600, color: "#e8e0d8", textAlign: "center" }}>{data.bestHabit.name}</p>
            <div style={{ ...ratePillStyle(data.bestHabit.rate), borderRadius: "9999px", padding: "2px 10px", fontSize: "12px", fontWeight: 600 }}>
              {data.bestHabit.rate}% rate
            </div>
            <p style={{ fontSize: "11px", color: "#6b6560" }}>strongest habit</p>
          </Card>
        )}

        {/* Worst habit */}
        {data.worstHabit && (
          <Card style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", gap: "6px" }}>
            <span style={{ fontSize: "28px" }}>{data.worstHabit.emoji}</span>
            <p style={{ fontSize: "13px", fontWeight: 600, color: "#e8e0d8", textAlign: "center" }}>{data.worstHabit.name}</p>
            <div style={{ ...ratePillStyle(data.worstHabit.rate), borderRadius: "9999px", padding: "2px 10px", fontSize: "12px", fontWeight: 600 }}>
              {data.worstHabit.rate}% rate
            </div>
            <p style={{ fontSize: "11px", color: "#6b6560" }}>needs attention</p>
          </Card>
        )}
      </div>

      {/* ── Monthly line chart ─────────────────────────────────────────────── */}
      <Card style={{ marginBottom: "24px" }}>
        <h3 style={{ fontWeight: 600, color: "#e8e0d8", marginBottom: "4px" }}>Monthly completion rate</h3>
        <p style={{ fontSize: "12px", color: "#6b6560", marginBottom: "16px" }}>Last 6 months — % of logged activities completed</p>
        <MonthlyLineChart data={data.monthlyRates} />
        {/* Month summaries row */}
        <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
          {data.monthlyRates.map((m) => (
            <div key={m.month} style={{ flex: "1 0 60px", textAlign: "center", background: "#2e2b28", borderRadius: "10px", padding: "8px 6px" }}>
              <p style={{ fontSize: "11px", color: "#6b6560" }}>{m.month}</p>
              <p style={{ fontSize: "14px", fontWeight: 700, color: "#e8e0d8" }}>{m.rate}%</p>
              <p style={{ fontSize: "10px", color: "#6b6560" }}>{m.completed}/{m.total}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Per-habit breakdown table ──────────────────────────────────────── */}
      <Card style={{ marginBottom: "24px" }}>
        <h3 style={{ fontWeight: 600, color: "#e8e0d8", marginBottom: "4px" }}>Habit breakdown</h3>
        <p style={{ fontSize: "12px", color: "#6b6560", marginBottom: "16px" }}>All-time stats per activity, sorted by completion rate</p>

        {/* Header */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 90px 80px 70px 70px", gap: "8px", paddingBottom: "10px", borderBottom: "1px solid #2e2b28", marginBottom: "4px" }}>
          {["Habit", "Rate", "Streak", "Best", "Last 30d"].map((h) => (
            <span key={h} style={{ fontSize: "11px", color: "#6b6560", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", textAlign: h === "Habit" ? "left" : "center" }}>{h}</span>
          ))}
        </div>

        {data.habitBreakdown.map((h, i) => (
          <div
            key={h.id}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 90px 80px 70px 70px",
              gap: "8px",
              alignItems: "center",
              padding: "12px 0",
              borderBottom: i < data.habitBreakdown.length - 1 ? "1px solid #2e2b28" : "none",
            }}
          >
            {/* Name */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
              <span style={{ fontSize: "18px", flexShrink: 0 }}>{h.emoji}</span>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: "14px", color: "#e8e0d8", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.name}</p>
                <p style={{ fontSize: "11px", color: "#6b6560" }}>{h.completedCount} of {h.totalCount} logged</p>
              </div>
            </div>

            {/* Rate */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "5px" }}>
              <span style={{ fontSize: "14px", fontWeight: 700, color: "#e8e0d8" }}>{h.rate}%</span>
              <RateBar rate={h.rate} />
            </div>

            {/* Current streak */}
            <div style={{ textAlign: "center" }}>
              <span style={{ fontSize: "14px", fontWeight: 600, color: h.currentStreak >= 7 ? "#5da87e" : "#e8e0d8" }}>{h.currentStreak}d</span>
              {h.currentStreak >= 7 && <p style={{ fontSize: "10px", color: "#5da87e" }}>on fire</p>}
            </div>

            {/* Best streak */}
            <div style={{ textAlign: "center" }}>
              <span style={{ fontSize: "14px", color: "#9c9490" }}>{h.bestStreak}d</span>
            </div>

            {/* Last 30d */}
            <div style={{ textAlign: "center" }}>
              {h.recent30Rate !== null ? (
                <span style={{ ...ratePillStyle(h.recent30Rate), borderRadius: "9999px", padding: "2px 8px", fontSize: "12px", fontWeight: 600 }}>
                  {h.recent30Rate}%
                </span>
              ) : (
                <span style={{ fontSize: "12px", color: "#6b6560" }}>—</span>
              )}
            </div>
          </div>
        ))}
      </Card>

      {/* ── Smart insights ─────────────────────────────────────────────────── */}
      {data.insights.length > 0 && (
        <Card style={{ marginBottom: "24px" }}>
          <h3 style={{ fontWeight: 600, color: "#e8e0d8", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <HiOutlineLightBulb style={{ width: "18px", height: "18px", color: "#c9a84c" }} />
            Observations
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {data.insights.map((insight, i) => (
              <div key={i} style={{ display: "flex", gap: "12px", padding: "11px 12px", borderRadius: "10px", background: i % 2 === 0 ? "#2e2b28" : "transparent" }}>
                <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#c9a84c", flexShrink: 0, marginTop: "6px" }} />
                <span style={{ fontSize: "14px", color: "#e8e0d8", lineHeight: 1.6 }}>{insight}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── Achievements ───────────────────────────────────────────────────── */}
      <Card>
        <h3 style={{ fontWeight: 600, color: "#e8e0d8", marginBottom: "16px" }}>Achievements</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "12px" }}>
          {data.badges.map((b) => (
            <div
              key={b.name}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "16px",
                borderRadius: "12px",
                border: "1px solid",
                transition: "all 0.2s",
                backgroundColor: b.earned ? "rgba(91,143,185,0.05)" : "#2e2b28",
                borderColor: b.earned ? "rgba(91,143,185,0.2)" : "#3d3935",
                opacity: b.earned ? 1 : 0.4,
              }}
            >
              <span style={{ fontSize: "30px", marginBottom: "8px" }}>{b.emoji}</span>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "#e8e0d8", textAlign: "center" }}>{b.name}</span>
              <span style={{ fontSize: "10px", color: "#6b6560", textAlign: "center", marginTop: "4px" }}>{b.description}</span>
              {b.earned && <div style={{ marginTop: "8px" }}><Badge color="green" size="sm">Earned</Badge></div>}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}