"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success" | "warning";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  loading?: boolean;
}

const variantStyles: Record<string, React.CSSProperties> = {
  primary: { backgroundColor: "#5b8fb9", color: "white" },
  secondary: { backgroundColor: "#2e2b28", color: "#e8e0d8", border: "1px solid #3d3935" },
  ghost: { backgroundColor: "transparent", color: "#9c9490" },
  danger: { backgroundColor: "rgba(199,95,95,0.1)", color: "#c75f5f", border: "1px solid rgba(199,95,95,0.2)" },
  success: { backgroundColor: "rgba(93,168,126,0.1)", color: "#5da87e", border: "1px solid rgba(93,168,126,0.2)" },
  warning: { backgroundColor: "rgba(201,168,76,0.1)", color: "#c9a84c", border: "1px solid rgba(201,168,76,0.2)" },
};

const sizeStyles: Record<string, React.CSSProperties> = {
  sm: { padding: "6px 12px", fontSize: "12px", borderRadius: "8px" },
  md: { padding: "10px 16px", fontSize: "14px", borderRadius: "12px" },
  lg: { padding: "12px 24px", fontSize: "16px", borderRadius: "12px" },
};

export default function Button({
  variant = "primary",
  size = "md",
  children,
  loading,
  disabled,
  className = "",
  style,
  ...props
}: ButtonProps) {
  return (
    <button
      className={className}
      disabled={disabled || loading}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        fontWeight: 500,
        border: "none",
        cursor: disabled || loading ? "not-allowed" : "pointer",
        opacity: disabled || loading ? 0.5 : 1,
        transition: "all 0.2s",
        ...variantStyles[variant],
        ...sizeStyles[size],
        ...style,
      }}
      {...props}
    >
      {loading && (
        <svg className="animate-spin" style={{ width: "16px", height: "16px" }} viewBox="0 0 24 24">
          <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
