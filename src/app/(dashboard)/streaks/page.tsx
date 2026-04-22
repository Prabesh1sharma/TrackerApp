"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { HiOutlineFire, HiOutlineStar, HiOutlineCheck, HiOutlineExclamation } from "react-icons/hi";

interface Streak { activityId: string; title: string; category: string; currentStreak: number; longestStreak: number; totalCompleted: number; totalExcused: number; }

export default function StreaksPage() {
  const [streaks, setStreaks] = useState<Streak[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/streaks").then((r) => r.json()).then(setStreaks).catch(() => toast.error("Failed to load")).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <div className="animate-spin" style={{ width: "32px", height: "32px", border: "2px solid rgba(91,143,185,0.3)", borderTopColor: "#5b8fb9", borderRadius: "50%" }} />
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#e8e0d8" }}>Streaks</h1>
        <p style={{ color: "#9c9490", fontSize: "14px", marginTop: "4px" }}>Track your consistency</p>
      </div>

      {streaks.length === 0 ? (
        <Card style={{ textAlign: "center", padding: "48px 20px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#e8e0d8", marginBottom: "8px" }}>No streaks yet</h3>
          <p style={{ fontSize: "14px", color: "#9c9490" }}>Complete activities to build streaks.</p>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {streaks.map((s, i) => (
            <Card key={s.activityId} style={{ borderColor: s.currentStreak >= 7 ? "rgba(201,168,76,0.3)" : undefined }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "18px", flexShrink: 0, backgroundColor: i === 0 ? "rgba(201,168,76,0.15)" : i === 1 ? "rgba(156,148,144,0.15)" : i === 2 ? "rgba(199,95,95,0.1)" : "#2e2b28", color: i === 0 ? "#c9a84c" : i === 1 ? "#9c9490" : i === 2 ? "#c75f5f" : "#6b6560" }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontWeight: 600, color: "#e8e0d8" }}>{s.title}</h3>
                  <Badge color="default" size="sm">{s.category}</Badge>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "24px", flexShrink: 0 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <HiOutlineFire style={{ width: "20px", height: "20px", color: s.currentStreak > 0 ? "#c9a84c" : "#6b6560" }} />
                      <span style={{ fontSize: "24px", fontWeight: 700, color: "#e8e0d8" }}>{s.currentStreak}</span>
                    </div>
                    <p style={{ fontSize: "12px", color: "#6b6560" }}>Current</p>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <HiOutlineStar style={{ width: "20px", height: "20px", color: "#5b8fb9" }} />
                      <span style={{ fontSize: "24px", fontWeight: 700, color: "#e8e0d8" }}>{s.longestStreak}</span>
                    </div>
                    <p style={{ fontSize: "12px", color: "#6b6560" }}>Best</p>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <HiOutlineCheck style={{ width: "16px", height: "16px", color: "#5da87e" }} />
                      <span style={{ fontSize: "18px", fontWeight: 600, color: "#9c9490" }}>{s.totalCompleted}</span>
                    </div>
                    <p style={{ fontSize: "12px", color: "#6b6560" }}>Done</p>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <HiOutlineExclamation style={{ width: "16px", height: "16px", color: "#c9a84c" }} />
                      <span style={{ fontSize: "18px", fontWeight: 600, color: "#9c9490" }}>{s.totalExcused}</span>
                    </div>
                    <p style={{ fontSize: "12px", color: "#6b6560" }}>Excused</p>
                  </div>
                </div>
              </div>
              {s.currentStreak >= 3 && (
                <div style={{ display: "flex", gap: "8px", marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #3d3935" }}>
                  {s.currentStreak >= 3 && <Badge color="amber">🔥 3-day</Badge>}
                  {s.currentStreak >= 7 && <Badge color="amber">⭐ 7-day</Badge>}
                  {s.currentStreak >= 30 && <Badge color="purple">🏆 30-day</Badge>}
                  {s.currentStreak >= 100 && <Badge color="blue">💎 100-day</Badge>}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
