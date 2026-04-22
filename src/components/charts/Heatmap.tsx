"use client";

import { useMemo } from "react";

interface HeatmapDay {
  date: string;
  score: number;
  completed: number;
  total: number;
}

interface HeatmapProps {
  data: HeatmapDay[];
  year: number;
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const CELL_SIZE = 13;
const GAP = 3;
const COL_WIDTH = CELL_SIZE + GAP;
const LEFT_PADDING = 36; // space for day labels

function getColor(score: number): string {
  if (score === 0) return "#2e2b28";
  if (score <= 25) return "#2a4a62";
  if (score <= 50) return "#3a6a8a";
  if (score <= 75) return "#4a8ab2";
  return "#5b8fb9";
}

function localDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function Heatmap({ data, year }: HeatmapProps) {
  const { weeks, monthLabels } = useMemo(() => {
    const start = new Date(year, 0, 1);
    const startDay = start.getDay(); // 0=Sun
    const end = new Date(year, 11, 31);
    const dayMap = new Map(data.map((d) => [d.date, d]));

    // Build weeks array (each week = array of 7 day slots)
    const weeks: (HeatmapDay | null)[][] = [];
    let currentWeek: (HeatmapDay | null)[] = [];

    // Pad first week with nulls for days before Jan 1
    for (let i = 0; i < startDay; i++) currentWeek.push(null);

    const d = new Date(start);
    while (d <= end) {
      const key = localDateStr(d);
      currentWeek.push(dayMap.get(key) || { date: key, score: 0, completed: 0, total: 0 });
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      d.setDate(d.getDate() + 1);
    }
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) currentWeek.push(null);
      weeks.push(currentWeek);
    }

    // Compute month labels: find the first week index where each month starts
    const monthLabels: { label: string; weekIndex: number }[] = [];
    let lastMonth = -1;
    weeks.forEach((week, wi) => {
      for (const day of week) {
        if (day) {
          // Parse the local date string directly to get the month
          const m = parseInt(day.date.split("-")[1], 10) - 1;
          if (m !== lastMonth) {
            monthLabels.push({ label: MONTHS[m], weekIndex: wi });
            lastMonth = m;
          }
          break;
        }
      }
    });

    return { weeks, monthLabels };
  }, [data, year]);

  const totalWidth = LEFT_PADDING + weeks.length * COL_WIDTH;

  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ minWidth: `${totalWidth}px` }}>
        {/* Month labels row */}
        <div style={{ position: "relative", height: "20px", marginBottom: "4px" }}>
          {monthLabels.map((m, i) => (
            <span
              key={i}
              style={{
                position: "absolute",
                left: `${LEFT_PADDING + m.weekIndex * COL_WIDTH}px`,
                fontSize: "11px",
                color: "#6b6560",
                userSelect: "none",
              }}
            >
              {m.label}
            </span>
          ))}
        </div>

        {/* Grid area: day labels + cells */}
        <div style={{ display: "flex", gap: `${GAP}px` }}>
          {/* Day-of-week labels */}
          <div style={{ display: "flex", flexDirection: "column", gap: `${GAP}px`, width: `${LEFT_PADDING - GAP}px`, flexShrink: 0 }}>
            {["","Mon","","Wed","","Fri",""].map((label, i) => (
              <div key={i} style={{ height: `${CELL_SIZE}px`, display: "flex", alignItems: "center", fontSize: "11px", color: "#6b6560" }}>
                {label}
              </div>
            ))}
          </div>

          {/* Week columns */}
          {weeks.map((week, wi) => (
            <div key={wi} style={{ display: "flex", flexDirection: "column", gap: `${GAP}px` }}>
              {week.map((day, di) => (
                <div key={di} style={{ position: "relative" }} className="heatmap-cell">
                  <div
                    style={{
                      width: `${CELL_SIZE}px`,
                      height: `${CELL_SIZE}px`,
                      borderRadius: "2px",
                      backgroundColor: day ? getColor(day.score) : "transparent",
                      transition: "all 0.15s",
                    }}
                  />
                  {day && (
                    <div style={{
                      position: "absolute",
                      bottom: "100%",
                      left: "50%",
                      transform: "translateX(-50%)",
                      marginBottom: "6px",
                      padding: "4px 8px",
                      backgroundColor: "#242220",
                      border: "1px solid #3d3935",
                      borderRadius: "8px",
                      fontSize: "11px",
                      color: "#e8e0d8",
                      whiteSpace: "nowrap",
                      opacity: 0,
                      pointerEvents: "none",
                      zIndex: 10,
                      transition: "opacity 0.15s",
                    }} className="heatmap-tooltip">
                      <div style={{ fontWeight: 500 }}>{day.date}</div>
                      <div style={{ color: "#6b6560" }}>{day.completed}/{day.total} · {day.score}%</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "12px", paddingLeft: `${LEFT_PADDING}px` }}>
          <span style={{ fontSize: "11px", color: "#6b6560" }}>Less</span>
          {[0, 25, 50, 75, 100].map((s) => (
            <div key={s} style={{ width: `${CELL_SIZE}px`, height: `${CELL_SIZE}px`, borderRadius: "2px", backgroundColor: getColor(s) }} />
          ))}
          <span style={{ fontSize: "11px", color: "#6b6560" }}>More</span>
        </div>
      </div>
    </div>
  );
}
