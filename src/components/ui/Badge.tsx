interface BadgeProps {
  children: React.ReactNode;
  color?: "blue" | "green" | "red" | "amber" | "purple" | "default";
  size?: "sm" | "md";
}

const colorMap: Record<string, React.CSSProperties> = {
  blue: { backgroundColor: "rgba(91,143,185,0.1)", color: "#5b8fb9", borderColor: "rgba(91,143,185,0.2)" },
  green: { backgroundColor: "rgba(93,168,126,0.1)", color: "#5da87e", borderColor: "rgba(93,168,126,0.2)" },
  red: { backgroundColor: "rgba(199,95,95,0.1)", color: "#c75f5f", borderColor: "rgba(199,95,95,0.2)" },
  amber: { backgroundColor: "rgba(201,168,76,0.1)", color: "#c9a84c", borderColor: "rgba(201,168,76,0.2)" },
  purple: { backgroundColor: "rgba(155,126,200,0.1)", color: "#9b7ec8", borderColor: "rgba(155,126,200,0.2)" },
  default: { backgroundColor: "#2e2b28", color: "#9c9490", borderColor: "#3d3935" },
};

export default function Badge({ children, color = "default", size = "sm" }: BadgeProps) {
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "4px",
      fontWeight: 500,
      border: "1px solid",
      borderRadius: "9999px",
      padding: size === "sm" ? "2px 8px" : "4px 12px",
      fontSize: "12px",
      ...colorMap[color],
    }}>
      {children}
    </span>
  );
}
