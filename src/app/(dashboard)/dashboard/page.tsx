"use client";

import { useState, useEffect, useCallback } from "react";
import { format, subDays, addDays } from "date-fns";
import toast from "react-hot-toast";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
import ProgressRing from "@/components/ui/ProgressRing";
import { HiOutlineCheck, HiOutlineX, HiOutlineExclamation, HiOutlinePencilAlt, HiOutlineChevronLeft, HiOutlineChevronRight, HiOutlineFire } from "react-icons/hi";

interface Activity { _id: string; title: string; description: string; category: string; }
interface Log { _id: string; activityId: string; status: string; reason: string; remark: string; }

const inputStyle: React.CSSProperties = {
  width: "100%", backgroundColor: "#1a1816", border: "1px solid #3d3935", borderRadius: "12px",
  padding: "12px 16px", color: "#e8e0d8", fontSize: "14px", outline: "none", resize: "none",
};

export default function DashboardPage() {
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [activities, setActivities] = useState<Activity[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [excuseModal, setExcuseModal] = useState<string | null>(null);
  const [remarkModal, setRemarkModal] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [remark, setRemark] = useState("");

  const load = useCallback(async () => {
    try {
      const [aRes, lRes] = await Promise.all([fetch("/api/activities"), fetch(`/api/logs?from=${date}&to=${date}`)]);
      setActivities(await aRes.json());
      setLogs(await lRes.json());
    } catch { toast.error("Failed to load"); }
    finally { setLoading(false); }
  }, [date]);

  useEffect(() => { setLoading(true); load(); }, [load]);

  const getLog = (actId: string) => logs.find((l) => l.activityId === actId);

  const logAction = async (actId: string, status: string, extra: Record<string, string> = {}) => {
    try {
      const res = await fetch("/api/logs", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activityId: actId, date, status, ...extra }),
      });
      if (!res.ok) { const d = await res.json(); toast.error(d.error || "Failed"); return; }
      toast.success(status === "completed" ? "✅ Done!" : status === "excused" ? "⚠️ Excused" : "Logged");
      load();
    } catch { toast.error("Failed"); }
  };

  const handleExcuse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!excuseModal || !reason.trim()) return;
    await logAction(excuseModal, "excused", { reason });
    setExcuseModal(null); setReason("");
  };

  const handleRemark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!remarkModal) return;
    const log = getLog(remarkModal);
    if (log) {
      await fetch(`/api/logs/${log._id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ remark }) });
    } else {
      await logAction(remarkModal, "completed", { remark });
    }
    toast.success("Remark saved"); setRemarkModal(null); setRemark(""); load();
  };

  const completed = logs.filter((l) => l.status === "completed" || l.status === "excused").length;
  const total = activities.length;
  const pct = total > 0 ? (completed / total) * 100 : 0;
  const isToday = date === format(new Date(), "yyyy-MM-dd");

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <div className="animate-spin" style={{ width: "32px", height: "32px", border: "2px solid rgba(91,143,185,0.3)", borderTopColor: "#5b8fb9", borderRadius: "50%" }} />
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "16px", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#e8e0d8" }}>Dashboard</h1>
          <p style={{ color: "#9c9490", fontSize: "14px", marginTop: "4px" }}>{isToday ? "Today" : format(new Date(date + "T00:00:00"), "EEEE, MMM d, yyyy")}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Button variant="ghost" size="sm" onClick={() => setDate(format(subDays(new Date(date + "T00:00:00"), 1), "yyyy-MM-dd"))}><HiOutlineChevronLeft style={{ width: "16px", height: "16px" }} /></Button>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ backgroundColor: "#242220", border: "1px solid #3d3935", borderRadius: "12px", padding: "8px 12px", fontSize: "14px", color: "#e8e0d8" }} />
          <Button variant="ghost" size="sm" onClick={() => setDate(format(addDays(new Date(date + "T00:00:00"), 1), "yyyy-MM-dd"))}><HiOutlineChevronRight style={{ width: "16px", height: "16px" }} /></Button>
          {!isToday && <Button variant="secondary" size="sm" onClick={() => setDate(format(new Date(), "yyyy-MM-dd"))}>Today</Button>}
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <Card style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <ProgressRing progress={pct} size={64} strokeWidth={6} showLabel={false} goalMet={pct >= 80} />
          <div>
            <p style={{ fontSize: "24px", fontWeight: 700, color: "#e8e0d8" }}>{Math.round(pct)}%</p>
            <p style={{ fontSize: "12px", color: "#6b6560" }}>Completed</p>
          </div>
        </Card>
        <Card>
          <p style={{ fontSize: "24px", fontWeight: 700, color: "#5da87e" }}>{logs.filter(l => l.status === "completed").length}</p>
          <p style={{ fontSize: "12px", color: "#6b6560" }}>Done</p>
        </Card>
        <Card>
          <p style={{ fontSize: "24px", fontWeight: 700, color: "#c9a84c" }}>{logs.filter(l => l.status === "excused").length}</p>
          <p style={{ fontSize: "12px", color: "#6b6560" }}>Excused</p>
        </Card>
        <Card>
          <p style={{ fontSize: "24px", fontWeight: 700, color: "#c75f5f" }}>{total - completed}</p>
          <p style={{ fontSize: "12px", color: "#6b6560" }}>Remaining</p>
        </Card>
      </div>

      {/* Activity Cards */}
      {!isToday && activities.length > 0 && (
        <div style={{ padding: "10px 16px", marginBottom: "16px", backgroundColor: "rgba(91,143,185,0.1)", border: "1px solid rgba(91,143,185,0.2)", borderRadius: "12px", fontSize: "13px", color: "#5b8fb9", textAlign: "center" }}>
          📅 Viewing {format(new Date(date + "T00:00:00"), "MMM d, yyyy")} — You can only log activities for today
        </div>
      )}

      {activities.length === 0 ? (
        <Card style={{ textAlign: "center", padding: "48px 20px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#e8e0d8", marginBottom: "8px" }}>No activities</h3>
          <p style={{ fontSize: "14px", color: "#9c9490" }}>Create activities first in the Activities page.</p>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {activities.map((a) => {
            const log = getLog(a._id);
            const st = log?.status;
            const borderColor = st === "completed" ? "rgba(93,168,126,0.3)" : st === "excused" ? "rgba(201,168,76,0.3)" : st === "missed" ? "rgba(199,95,95,0.3)" : "#3d3935";
            return (
              <Card key={a._id} style={{ borderColor }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  {/* Status indicator */}
                  <div style={{ width: "40px", height: "40px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, backgroundColor: st === "completed" ? "rgba(93,168,126,0.15)" : st === "excused" ? "rgba(201,168,76,0.15)" : st === "missed" ? "rgba(199,95,95,0.15)" : "#2e2b28", color: st === "completed" ? "#5da87e" : st === "excused" ? "#c9a84c" : st === "missed" ? "#c75f5f" : "#6b6560" }}>
                    {st === "completed" ? <HiOutlineCheck style={{ width: "20px", height: "20px" }} /> : st === "excused" ? <HiOutlineExclamation style={{ width: "20px", height: "20px" }} /> : st === "missed" ? <HiOutlineX style={{ width: "20px", height: "20px" }} /> : <HiOutlineFire style={{ width: "20px", height: "20px" }} />}
                  </div>
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontWeight: 500, color: "#e8e0d8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.title}</h3>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px", flexWrap: "wrap" }}>
                      <Badge color="default" size="sm">{a.category}</Badge>
                      {log?.remark && <span style={{ fontSize: "12px", color: "#6b6560" }}>📝 {log.remark}</span>}
                      {log?.reason && <span style={{ fontSize: "12px", color: "#c9a84c" }}>💬 {log.reason}</span>}
                    </div>
                  </div>
                  {/* Actions — only enabled for today */}
                  {isToday ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                      {[
                        { status: "completed", icon: HiOutlineCheck, activeBg: "#5da87e" },
                        { status: "missed", icon: HiOutlineX, activeBg: "#c75f5f" },
                      ].map((btn) => (
                        <button key={btn.status} onClick={() => logAction(a._id, btn.status)} title={btn.status} style={{ width: "36px", height: "36px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer", transition: "all 0.2s", backgroundColor: st === btn.status ? btn.activeBg : "#2e2b28", color: st === btn.status ? "white" : "#6b6560" }}>
                          <btn.icon style={{ width: "16px", height: "16px" }} />
                        </button>
                      ))}
                      <button onClick={() => { setExcuseModal(a._id); setReason(log?.reason || ""); }} title="Can't today" style={{ width: "36px", height: "36px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer", transition: "all 0.2s", backgroundColor: st === "excused" ? "#c9a84c" : "#2e2b28", color: st === "excused" ? "white" : "#6b6560" }}>
                        <HiOutlineExclamation style={{ width: "16px", height: "16px" }} />
                      </button>
                      <button onClick={() => { setRemarkModal(a._id); setRemark(log?.remark || ""); }} title="Add remark" style={{ width: "36px", height: "36px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer", transition: "all 0.2s", backgroundColor: "#2e2b28", color: "#6b6560" }}>
                        <HiOutlinePencilAlt style={{ width: "16px", height: "16px" }} />
                      </button>
                    </div>
                  ) : (
                    <div style={{ fontSize: "12px", color: "#6b6560", flexShrink: 0 }}>
                      {st ? <Badge color={st === "completed" ? "green" : st === "excused" ? "amber" : "red"} size="sm">{st}</Badge> : <span style={{ opacity: 0.5 }}>No log</span>}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Excuse Modal */}
      <Modal isOpen={!!excuseModal} onClose={() => setExcuseModal(null)} title="Can't complete today">
        <form onSubmit={handleExcuse} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <p style={{ fontSize: "14px", color: "#9c9490" }}>Provide a valid reason. Your streak will be preserved.</p>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} required placeholder="Why can't you complete this today?" rows={3} style={inputStyle} />
          <div style={{ display: "flex", gap: "12px" }}>
            <Button type="button" variant="secondary" onClick={() => setExcuseModal(null)} style={{ flex: 1 }}>Cancel</Button>
            <Button type="submit" variant="warning" style={{ flex: 1 }}>Submit Reason</Button>
          </div>
        </form>
      </Modal>

      {/* Remark Modal */}
      <Modal isOpen={!!remarkModal} onClose={() => setRemarkModal(null)} title="Add Remark">
        <form onSubmit={handleRemark} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <textarea value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="Notes for today..." rows={3} style={inputStyle} />
          <div style={{ display: "flex", gap: "12px" }}>
            <Button type="button" variant="secondary" onClick={() => setRemarkModal(null)} style={{ flex: 1 }}>Cancel</Button>
            <Button type="submit" style={{ flex: 1 }}>Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
