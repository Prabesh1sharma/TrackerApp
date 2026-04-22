"use client";

import { ReactNode, useEffect } from "react";
import { HiOutlineX } from "react-icons/hi";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: string;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (isOpen) { document.addEventListener("keydown", h); return () => document.removeEventListener("keydown", h); }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} onClick={onClose} />
      <div className="animate-slide-up" style={{ position: "relative", width: "100%", maxWidth: "448px", backgroundColor: "rgba(36,34,32,0.95)", backdropFilter: "blur(12px)", border: "1px solid #3d3935", borderRadius: "20px", padding: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#e8e0d8" }}>{title}</h2>
          <button onClick={onClose} style={{ width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "8px", color: "#6b6560", background: "none", border: "none", cursor: "pointer" }}>
            <HiOutlineX style={{ width: "20px", height: "20px" }} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
