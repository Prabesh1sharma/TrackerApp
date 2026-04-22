"use client";

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  label?: string;
  goalMet?: boolean;
}

export default function ProgressRing({ progress, size = 120, strokeWidth = 8, showLabel = true, label, goalMet = false }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.min(progress, 100) / 100) * circumference;
  const color = goalMet ? "#c9a84c" : "#5b8fb9";

  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#3d3935" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: "all 0.7s ease-out", filter: goalMet ? "drop-shadow(0 0 6px #c9a84c)" : undefined }} />
      </svg>
      {showLabel && (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: "24px", fontWeight: 700, color: "#e8e0d8" }}>{Math.round(progress)}%</span>
          {label && <span style={{ fontSize: "12px", color: "#6b6560", marginTop: "2px" }}>{label}</span>}
        </div>
      )}
    </div>
  );
}
