"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Heatmap from "@/components/charts/Heatmap";
import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi";

interface HeatmapDay { date: string; score: number; completed: number; total: number; }

export default function HeatmapPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState<HeatmapDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/stats/heatmap?year=${year}`).then((r) => r.json()).then(setData).catch(() => toast.error("Failed to load")).finally(() => setLoading(false));
  }, [year]);

  const activeDays = data.filter((d) => d.score > 0).length;
  const perfectDays = data.filter((d) => d.score === 100).length;
  const avgScore = data.length > 0 ? Math.round(data.reduce((s, d) => s + d.score, 0) / data.length) : 0;

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <div className="animate-spin" style={{ width: "32px", height: "32px", border: "2px solid rgba(91,143,185,0.3)", borderTopColor: "#5b8fb9", borderRadius: "50%" }} />
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#e8e0d8" }}>Activity Heatmap</h1>
          <p style={{ color: "#9c9490", fontSize: "14px", marginTop: "4px" }}>Your consistency at a glance</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Button variant="ghost" size="sm" onClick={() => setYear(year - 1)}><HiOutlineChevronLeft style={{ width: "16px", height: "16px" }} /></Button>
          <span style={{ fontSize: "14px", fontWeight: 600, color: "#e8e0d8", minWidth: "50px", textAlign: "center" }}>{year}</span>
          <Button variant="ghost" size="sm" onClick={() => setYear(year + 1)} disabled={year >= new Date().getFullYear()}><HiOutlineChevronRight style={{ width: "16px", height: "16px" }} /></Button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
        <Card><p style={{ fontSize: "24px", fontWeight: 700, color: "#5b8fb9" }}>{activeDays}</p><p style={{ fontSize: "12px", color: "#6b6560" }}>Active Days</p></Card>
        <Card><p style={{ fontSize: "24px", fontWeight: 700, color: "#5da87e" }}>{perfectDays}</p><p style={{ fontSize: "12px", color: "#6b6560" }}>Perfect Days</p></Card>
        <Card><p style={{ fontSize: "24px", fontWeight: 700, color: "#c9a84c" }}>{avgScore}%</p><p style={{ fontSize: "12px", color: "#6b6560" }}>Avg Score</p></Card>
      </div>

      <Card style={{ padding: "24px" }}>
        <Heatmap data={data} year={year} />
      </Card>
    </div>
  );
}
