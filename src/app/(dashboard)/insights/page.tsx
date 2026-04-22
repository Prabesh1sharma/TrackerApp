"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Card from "@/components/ui/Card";
import ProgressRing from "@/components/ui/ProgressRing";
import Badge from "@/components/ui/Badge";
import { HiOutlineLightBulb, HiOutlineTrendingUp, HiOutlineTrendingDown } from "react-icons/hi";

interface InsightsData {
  weeklyRates: { week: string; rate: number }[];
  dayOfWeek: { day: string; rate: number }[];
  consistencyScore: number;
  trend: string;
  insights: string[];
  badges: { name: string; emoji: string; earned: boolean; description: string }[];
}

export default function InsightsPage() {
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats/insights").then((r) => r.json()).then(setData).catch(() => toast.error("Failed to load")).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <div className="animate-spin" style={{ width: "32px", height: "32px", border: "2px solid rgba(91,143,185,0.3)", borderTopColor: "#5b8fb9", borderRadius: "50%" }} />
    </div>
  );
  if (!data) return null;

  const maxRate = Math.max(...data.weeklyRates.map((w) => w.rate), 1);

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#e8e0d8" }}>Insights</h1>
        <p style={{ color: "#9c9490", fontSize: "14px", marginTop: "4px" }}>Understand your patterns</p>
      </div>

      {/* Top stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <Card style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "24px" }}>
          <ProgressRing progress={data.consistencyScore} size={100} strokeWidth={8} goalMet={data.consistencyScore >= 80} />
          <p style={{ fontSize: "14px", color: "#6b6560", marginTop: "12px" }}>Consistency Score</p>
        </Card>
        <Card style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {data.trend === "improving" ? <HiOutlineTrendingUp style={{ width: "32px", height: "32px", color: "#5da87e" }} /> : data.trend === "declining" ? <HiOutlineTrendingDown style={{ width: "32px", height: "32px", color: "#c75f5f" }} /> : <span style={{ fontSize: "32px", color: "#5b8fb9" }}>→</span>}
            <span style={{ fontSize: "20px", fontWeight: 700, color: "#e8e0d8", textTransform: "capitalize" }}>{data.trend}</span>
          </div>
          <p style={{ fontSize: "14px", color: "#6b6560", marginTop: "8px" }}>Current Trend</p>
        </Card>
        <Card style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 500, color: "#9c9490", marginBottom: "12px", textAlign: "center" }}>Best Day</h3>
          {(() => {
            if (data.dayOfWeek.length === 0) return <p style={{ fontSize: "14px", color: "#6b6560" }}>No data yet</p>;
            const best = data.dayOfWeek.reduce((a, b) => (a.rate > b.rate ? a : b));
            return (
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: "24px", fontWeight: 700, color: "#5b8fb9" }}>{best.day}</p>
                <p style={{ fontSize: "14px", color: "#6b6560" }}>{best.rate}% completion</p>
              </div>
            );
          })()}
        </Card>
      </div>

      {/* Weekly Chart */}
      <Card style={{ marginBottom: "24px" }}>
        <h3 style={{ fontWeight: 600, color: "#e8e0d8", marginBottom: "16px" }}>Weekly Completion Rate</h3>
        <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "160px" }}>
          {data.weeklyRates.map((w) => (
            <div key={w.week} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
              <span style={{ fontSize: "12px", color: "#6b6560" }}>{w.rate}%</span>
              <div style={{ width: "100%", borderRadius: "6px 6px 0 0", transition: "all 0.5s", height: `${Math.max((w.rate / maxRate) * 100, 4)}%`, backgroundColor: w.rate >= 80 ? "#5da87e" : w.rate >= 50 ? "#5b8fb9" : "#c75f5f" }} />
              <span style={{ fontSize: "10px", color: "#6b6560" }}>{w.week}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Day of Week */}
      <Card style={{ marginBottom: "24px" }}>
        <h3 style={{ fontWeight: 600, color: "#e8e0d8", marginBottom: "16px" }}>Performance by Day</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {data.dayOfWeek.map((d) => (
            <div key={d.day} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "14px", color: "#9c9490", width: "80px", flexShrink: 0 }}>{d.day}</span>
              <div style={{ flex: 1, backgroundColor: "#2e2b28", borderRadius: "9999px", height: "12px", overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: "9999px", transition: "all 0.7s", width: `${d.rate}%`, backgroundColor: d.rate >= 80 ? "#5da87e" : d.rate >= 50 ? "#5b8fb9" : d.rate > 0 ? "#c9a84c" : "#2e2b28" }} />
              </div>
              <span style={{ fontSize: "14px", fontWeight: 500, color: "#e8e0d8", width: "48px", textAlign: "right" }}>{d.rate}%</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Smart Insights */}
      {data.insights.length > 0 && (
        <Card style={{ marginBottom: "24px" }}>
          <h3 style={{ fontWeight: 600, color: "#e8e0d8", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}><HiOutlineLightBulb style={{ width: "20px", height: "20px", color: "#c9a84c" }} />Smart Insights</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {data.insights.map((insight, i) => (
              <div key={i} style={{ padding: "12px", backgroundColor: "#2e2b28", borderRadius: "12px" }}>
                <span style={{ fontSize: "14px", color: "#e8e0d8" }}>{insight}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Badges */}
      <Card>
        <h3 style={{ fontWeight: 600, color: "#e8e0d8", marginBottom: "16px" }}>Achievements</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "12px" }}>
          {data.badges.map((b) => (
            <div key={b.name} style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "16px", borderRadius: "12px", border: "1px solid", transition: "all 0.2s", backgroundColor: b.earned ? "rgba(91,143,185,0.05)" : "#2e2b28", borderColor: b.earned ? "rgba(91,143,185,0.2)" : "#3d3935", opacity: b.earned ? 1 : 0.4 }}>
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
