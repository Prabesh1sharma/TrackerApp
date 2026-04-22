"use client";

import { useState, useEffect, useCallback } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay } from "date-fns";
import toast from "react-hot-toast";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi";

interface Log { activityId: string; date: string; status: string; reason: string; remark: string; }
interface Activity { _id: string; title: string; category: string; }

export default function CalendarPage() {
  const [month, setMonth] = useState(new Date());
  const [logs, setLogs] = useState<Log[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const from = format(startOfWeek(startOfMonth(month)), "yyyy-MM-dd");
    const to = format(endOfWeek(endOfMonth(month)), "yyyy-MM-dd");
    try {
      const [lRes, aRes] = await Promise.all([fetch(`/api/logs?from=${from}&to=${to}`), fetch("/api/activities")]);
      setLogs(await lRes.json()); setActivities(await aRes.json());
    } catch { toast.error("Failed to load"); } finally { setLoading(false); }
  }, [month]);
  useEffect(() => { setLoading(true); load(); }, [load]);

  const getLogsForDate = (d: string) => logs.filter((l) => l.date.split("T")[0] === d);
  const getActivity = (id: string) => activities.find((a) => a._id === id);

  const mStart = startOfMonth(month);
  const mEnd = endOfMonth(month);
  const calStart = startOfWeek(mStart);
  const calEnd = endOfWeek(mEnd);
  const days: Date[] = [];
  let d = calStart;
  while (d <= calEnd) { days.push(d); d = addDays(d, 1); }
  const today = new Date();

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <div className="animate-spin" style={{ width: "32px", height: "32px", border: "2px solid rgba(91,143,185,0.3)", borderTopColor: "#5b8fb9", borderRadius: "50%" }} />
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#e8e0d8" }}>Calendar</h1>
          <p style={{ color: "#9c9490", fontSize: "14px", marginTop: "4px" }}>Browse your activity history</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Button variant="ghost" size="sm" onClick={() => setMonth(subMonths(month, 1))}><HiOutlineChevronLeft style={{ width: "16px", height: "16px" }} /></Button>
          <span style={{ fontSize: "14px", fontWeight: 600, color: "#e8e0d8", minWidth: "120px", textAlign: "center" }}>{format(month, "MMMM yyyy")}</span>
          <Button variant="ghost" size="sm" onClick={() => setMonth(addMonths(month, 1))}><HiOutlineChevronRight style={{ width: "16px", height: "16px" }} /></Button>
        </div>
      </div>

      <Card style={{ padding: "24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", marginBottom: "8px" }}>
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
            <div key={d} style={{ textAlign: "center", fontSize: "12px", fontWeight: 500, color: "#6b6560", padding: "8px 0" }}>{d}</div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
          {days.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const dayLogs = getLogsForDate(key);
            const inMonth = isSameMonth(day, month);
            const isToday = isSameDay(day, today);
            const isSelected = selectedDate === key;
            const completed = dayLogs.filter((l) => l.status === "completed").length;
            const excused = dayLogs.filter((l) => l.status === "excused").length;
            const missed = dayLogs.filter((l) => l.status === "missed").length;
            return (
              <button key={key} onClick={() => setSelectedDate(isSelected ? null : key)} style={{ position: "relative", padding: "8px", borderRadius: "12px", fontSize: "14px", minHeight: "60px", display: "flex", flexDirection: "column", alignItems: "center", border: isSelected ? "1px solid rgba(91,143,185,0.3)" : "1px solid transparent", backgroundColor: isSelected ? "rgba(91,143,185,0.1)" : "transparent", opacity: inMonth ? 1 : 0.3, cursor: "pointer", boxShadow: isToday ? "inset 0 0 0 1px rgba(91,143,185,0.5)" : undefined, transition: "all 0.2s" }}>
                <span style={{ fontSize: "12px", fontWeight: 500, color: isToday ? "#5b8fb9" : "#e8e0d8" }}>{format(day, "d")}</span>
                {dayLogs.length > 0 && (
                  <div style={{ display: "flex", gap: "2px", marginTop: "4px", flexWrap: "wrap", justifyContent: "center" }}>
                    {completed > 0 && <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#5da87e" }} />}
                    {excused > 0 && <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#c9a84c" }} />}
                    {missed > 0 && <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#c75f5f" }} />}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </Card>

      {selectedDate && (
        <Card style={{ marginTop: "24px" }}>
          <h3 style={{ fontWeight: 600, color: "#e8e0d8", marginBottom: "12px" }}>{format(new Date(selectedDate + "T00:00:00"), "EEEE, MMMM d, yyyy")}</h3>
          {getLogsForDate(selectedDate).length === 0 ? (
            <p style={{ fontSize: "14px", color: "#6b6560" }}>No activity logged for this day.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {getLogsForDate(selectedDate).map((log, i) => {
                const act = getActivity(log.activityId);
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", backgroundColor: "#2e2b28", borderRadius: "12px" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0, backgroundColor: log.status === "completed" ? "#5da87e" : log.status === "excused" ? "#c9a84c" : "#c75f5f" }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: "14px", fontWeight: 500, color: "#e8e0d8" }}>{act?.title || "Unknown"}</p>
                      {log.reason && <p style={{ fontSize: "12px", color: "#c9a84c", marginTop: "2px" }}>💬 {log.reason}</p>}
                      {log.remark && <p style={{ fontSize: "12px", color: "#6b6560", marginTop: "2px" }}>📝 {log.remark}</p>}
                    </div>
                    <Badge color={log.status === "completed" ? "green" : log.status === "excused" ? "amber" : "red"} size="sm">{log.status}</Badge>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
