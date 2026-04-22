"use client";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineArchive, HiOutlineTag } from "react-icons/hi";

interface Activity { _id: string; title: string; description: string; category: string; archived: boolean; createdAt: string; }

const CATEGORIES = ["General","Health","Fitness","Learning","Work","Creative","Mindfulness","Social","Finance"];
const CAT_COLORS: Record<string, "blue"|"green"|"red"|"amber"|"purple"|"default"> = {
  General:"default",Health:"green",Fitness:"red",Learning:"blue",Work:"amber",Creative:"purple",Mindfulness:"green",Social:"blue",Finance:"amber",
};

const inputStyle: React.CSSProperties = {
  width: "100%", backgroundColor: "#1a1816", border: "1px solid #3d3935", borderRadius: "12px",
  padding: "12px 16px", color: "#e8e0d8", fontSize: "14px", outline: "none",
};

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [archived, setArchived] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"add"|"edit"|null>(null);
  const [editAct, setEditAct] = useState<Activity|null>(null);
  const [showArch, setShowArch] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [cat, setCat] = useState("General");

  const load = useCallback(async () => {
    try {
      const [a, b] = await Promise.all([fetch("/api/activities"), fetch("/api/activities?archived=true")]);
      setActivities(await a.json()); setArchived(await b.json());
    } catch { toast.error("Failed to load"); } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const reset = () => { setTitle(""); setDesc(""); setCat("General"); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); if (!title.trim()) return;
    const isEdit = modal === "edit" && editAct;
    try {
      const res = await fetch(isEdit ? `/api/activities/${editAct._id}` : "/api/activities", {
        method: isEdit ? "PUT" : "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description: desc, category: cat }),
      });
      if (!res.ok) throw new Error();
      toast.success(isEdit ? "Updated!" : "Created!"); setModal(null); reset(); load();
    } catch { toast.error("Failed to save"); }
  };

  const handleArchive = async (id: string, isArchived: boolean) => {
    try {
      const res = await fetch(`/api/activities/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ archived: !isArchived }) });
      if (!res.ok) throw new Error();
      toast.success(isArchived ? "Restored!" : "Archived!"); load();
    } catch { toast.error("Failed"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this activity and all its logs?")) return;
    try { const res = await fetch(`/api/activities/${id}`, { method: "DELETE" }); if (!res.ok) throw new Error(); toast.success("Deleted"); load(); } catch { toast.error("Failed"); }
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <div className="animate-spin" style={{ width: "32px", height: "32px", border: "2px solid rgba(91,143,185,0.3)", borderTopColor: "#5b8fb9", borderRadius: "50%" }} />
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#e8e0d8" }}>Activities</h1>
          <p style={{ color: "#9c9490", fontSize: "14px", marginTop: "4px" }}>Manage your daily habits</p>
        </div>
        <Button onClick={() => { reset(); setModal("add"); }}><HiOutlinePlus style={{ width: "16px", height: "16px" }} />Add Activity</Button>
      </div>

      {activities.length === 0 ? (
        <Card style={{ textAlign: "center", padding: "48px 20px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#e8e0d8", marginBottom: "8px" }}>No activities yet</h3>
          <p style={{ fontSize: "14px", color: "#9c9490", marginBottom: "16px" }}>Create your first activity to start tracking.</p>
          <Button onClick={() => { reset(); setModal("add"); }}><HiOutlinePlus style={{ width: "16px", height: "16px" }} />Create Activity</Button>
        </Card>
      ) : (
        <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
          {activities.map((a) => (
            <Card key={a._id} hover>
              <h3 style={{ fontWeight: 600, color: "#e8e0d8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.title}</h3>
              {a.description && <p style={{ fontSize: "14px", color: "#9c9490", marginTop: "4px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{a.description}</p>}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "12px 0 16px" }}>
                <Badge color={CAT_COLORS[a.category] || "default"}><HiOutlineTag style={{ width: "12px", height: "12px" }} />{a.category}</Badge>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingTop: "12px", borderTop: "1px solid #3d3935" }}>
                <Button variant="ghost" size="sm" onClick={() => { setEditAct(a); setTitle(a.title); setDesc(a.description); setCat(a.category); setModal("edit"); }}><HiOutlinePencil style={{ width: "14px", height: "14px" }} />Edit</Button>
                <Button variant="ghost" size="sm" onClick={() => handleArchive(a._id, false)}><HiOutlineArchive style={{ width: "14px", height: "14px" }} />Archive</Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(a._id)} style={{ marginLeft: "auto", color: "#c75f5f" }}><HiOutlineTrash style={{ width: "14px", height: "14px" }} /></Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {archived.length > 0 && (
        <div style={{ marginTop: "24px" }}>
          <button onClick={() => setShowArch(!showArch)} style={{ fontSize: "14px", color: "#6b6560", background: "none", border: "none", cursor: "pointer", marginBottom: "12px" }}>
            {showArch ? "▼" : "▶"} Archived ({archived.length})
          </button>
          {showArch && (
            <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
              {archived.map((a) => (
                <Card key={a._id} style={{ opacity: 0.6 }}>
                  <h3 style={{ fontWeight: 600, color: "#e8e0d8", marginBottom: "8px" }}>{a.title}</h3>
                  <Badge color="default">Archived</Badge>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #3d3935" }}>
                    <Button variant="ghost" size="sm" onClick={() => handleArchive(a._id, true)}>Restore</Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(a._id)} style={{ marginLeft: "auto", color: "#c75f5f" }}><HiOutlineTrash style={{ width: "14px", height: "14px" }} /></Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      <Modal isOpen={modal !== null} onClose={() => setModal(null)} title={modal === "edit" ? "Edit Activity" : "New Activity"}>
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#9c9490", marginBottom: "8px" }}>Title *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g., Morning Run" style={inputStyle} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#9c9490", marginBottom: "8px" }}>Description</label>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Optional..." rows={3} style={{ ...inputStyle, resize: "none" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#9c9490", marginBottom: "8px" }}>Category</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {CATEGORIES.map((c) => (
                <button key={c} type="button" onClick={() => setCat(c)} style={{ padding: "6px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: 500, border: "1px solid", cursor: "pointer", transition: "all 0.2s", backgroundColor: cat === c ? "rgba(91,143,185,0.1)" : "#2e2b28", borderColor: cat === c ? "rgba(91,143,185,0.3)" : "#3d3935", color: cat === c ? "#5b8fb9" : "#9c9490" }}>{c}</button>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: "12px", paddingTop: "8px" }}>
            <Button type="button" variant="secondary" onClick={() => setModal(null)} style={{ flex: 1 }}>Cancel</Button>
            <Button type="submit" style={{ flex: 1 }}>{modal === "edit" ? "Save" : "Create"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
