"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { HiOutlineViewGrid, HiOutlineClipboardList, HiOutlineFire, HiOutlineChartBar, HiOutlineCalendar, HiOutlineLightBulb, HiOutlineLogout } from "react-icons/hi";
import { RiFireLine } from "react-icons/ri";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: HiOutlineViewGrid },
  { href: "/activities", label: "Activities", icon: HiOutlineClipboardList },
  { href: "/streaks", label: "Streaks", icon: HiOutlineFire },
  { href: "/heatmap", label: "Heatmap", icon: HiOutlineChartBar },
  { href: "/calendar", label: "Calendar", icon: HiOutlineCalendar },
  { href: "/insights", label: "Insights", icon: HiOutlineLightBulb },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const initials = session?.user?.name
    ?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) ?? "?";

  return (
    <>
      {/* Desktop Sidebar */}
      <aside style={{ display: "none", position: "fixed", left: 0, top: 0, bottom: 0, width: "256px", backgroundColor: "#242220", borderRight: "1px solid #3d3935", zIndex: 40, flexDirection: "column" }} className="sidebar-desktop">
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "20px 24px", borderBottom: "1px solid #3d3935" }}>
          <div style={{ width: "36px", height: "36px", backgroundColor: "rgba(91,143,185,0.2)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <RiFireLine style={{ width: "20px", height: "20px", color: "#5b8fb9" }} />
          </div>
          <span className="gradient-text" style={{ fontSize: "20px", fontWeight: 700 }}>Stride</span>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: "4px" }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 16px", borderRadius: "12px", fontSize: "14px", fontWeight: 500, textDecoration: "none", transition: "all 0.2s", backgroundColor: isActive ? "rgba(91,143,185,0.1)" : "transparent", color: isActive ? "#5b8fb9" : "#9c9490" }}>
                <item.icon style={{ width: "20px", height: "20px" }} />
                {item.label}
                {isActive && <div style={{ marginLeft: "auto", width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#5b8fb9" }} />}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div style={{ padding: "16px 12px", borderTop: "1px solid #3d3935" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "8px 16px", marginBottom: "8px" }}>
            <div style={{ width: "36px", height: "36px", backgroundColor: "rgba(91,143,185,0.2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 600, color: "#5b8fb9", flexShrink: 0 }}>
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: "14px", fontWeight: 500, color: "#e8e0d8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{session?.user?.name}</p>
              <p style={{ fontSize: "12px", color: "#6b6560", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{session?.user?.email}</p>
            </div>
          </div>
          <button onClick={() => signOut({ callbackUrl: "/" })} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 16px", borderRadius: "12px", fontSize: "14px", fontWeight: 500, color: "#9c9490", width: "100%", border: "none", background: "none", cursor: "pointer", transition: "all 0.2s" }}>
            <HiOutlineLogout style={{ width: "20px", height: "20px" }} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 40, backgroundColor: "rgba(36,34,32,0.95)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderTop: "1px solid #3d3935", display: "none" }} className="sidebar-mobile">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", padding: "8px" }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", padding: "6px 12px", borderRadius: "12px", fontSize: "10px", textDecoration: "none", color: isActive ? "#5b8fb9" : "#6b6560", transition: "all 0.2s" }}>
                <item.icon style={{ width: "20px", height: "20px" }} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
