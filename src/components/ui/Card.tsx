import { CSSProperties, ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: "blue" | "green" | "red" | "amber" | "purple" | null;
  style?: CSSProperties;
}

const glowBorders: Record<string, string> = {
  blue: "rgba(91,143,185,0.3)",
  green: "rgba(93,168,126,0.3)",
  red: "rgba(199,95,95,0.3)",
  amber: "rgba(201,168,76,0.3)",
  purple: "rgba(155,126,200,0.3)",
};

export default function Card({ children, className = "", hover = false, glow = null, style }: CardProps) {
  const cardStyle: CSSProperties = {
    backgroundColor: "#242220",
    border: `1px solid ${glow ? glowBorders[glow] : "#3d3935"}`,
    borderRadius: "16px",
    padding: "20px",
    transition: hover ? "all 0.3s ease" : undefined,
    cursor: hover ? "pointer" : undefined,
    ...style,
  };

  return (
    <div className={`${hover ? "card-hover" : ""} ${className}`} style={cardStyle}>
      {children}
    </div>
  );
}
