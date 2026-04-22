"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";
import { RiFireLine } from "react-icons/ri";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) { toast.error(result.error); }
      else { toast.success("Welcome back!"); router.push("/dashboard"); router.refresh(); }
    } catch { toast.error("Something went wrong"); }
    finally { setLoading(false); }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    backgroundColor: "var(--color-bg-primary)",
    border: "1px solid var(--color-border-default)",
    borderRadius: "12px",
    padding: "12px 16px 12px 44px",
    color: "var(--color-text-primary)",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.2s",
  };

  const iconStyle: React.CSSProperties = {
    position: "absolute",
    left: "14px",
    top: "50%",
    transform: "translateY(-50%)",
    width: "20px",
    height: "20px",
    color: "var(--color-text-muted)",
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", position: "relative", overflow: "hidden" }}>
      {/* Background blobs */}
      <div style={{ position: "absolute", inset: 0, backgroundColor: "var(--color-bg-primary)" }}>
        <div className="animate-float" style={{ position: "absolute", top: "25%", left: "25%", width: "384px", height: "384px", backgroundColor: "rgba(91,143,185,0.05)", borderRadius: "50%", filter: "blur(80px)" }} />
        <div className="animate-float" style={{ position: "absolute", bottom: "25%", right: "25%", width: "384px", height: "384px", backgroundColor: "rgba(155,126,200,0.05)", borderRadius: "50%", filter: "blur(80px)", animationDelay: "1.5s" }} />
      </div>

      <div style={{ width: "100%", maxWidth: "420px", position: "relative", zIndex: 10 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <div style={{ width: "40px", height: "40px", backgroundColor: "rgba(91,143,185,0.2)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <RiFireLine style={{ width: "24px", height: "24px", color: "var(--color-accent-blue)" }} />
            </div>
            <span className="gradient-text" style={{ fontSize: "24px", fontWeight: 700 }}>Stride</span>
          </div>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "14px" }}>Welcome back. Let&apos;s keep the streak going.</p>
        </div>

        {/* Form Card */}
        <div style={{ backgroundColor: "rgba(36,34,32,0.8)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: "1px solid var(--color-border-default)", borderRadius: "20px", padding: "32px" }}>
          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: "20px" }}>
              <label htmlFor="login-email" style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: "8px" }}>
                Email
              </label>
              <div style={{ position: "relative" }}>
                <HiOutlineMail style={iconStyle} />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = "var(--color-accent-blue)"}
                  onBlur={(e) => e.target.style.borderColor = "var(--color-border-default)"}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: "24px" }}>
              <label htmlFor="login-password" style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: "8px" }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <HiOutlineLockClosed style={iconStyle} />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  style={{ ...inputStyle, paddingRight: "44px" }}
                  onFocus={(e) => e.target.style.borderColor = "var(--color-accent-blue)"}
                  onBlur={(e) => e.target.style.borderColor = "var(--color-border-default)"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", padding: 0 }}
                >
                  {showPassword ? <HiOutlineEyeOff style={{ width: "20px", height: "20px" }} /> : <HiOutlineEye style={{ width: "20px", height: "20px" }} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{ width: "100%", backgroundColor: "var(--color-accent-blue)", color: "white", fontWeight: 600, padding: "12px", borderRadius: "12px", border: "none", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.5 : 1, fontSize: "15px", transition: "all 0.2s" }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div style={{ marginTop: "24px", textAlign: "center" }}>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "14px" }}>
              Don&apos;t have an account?{" "}
              <Link href="/signup" style={{ color: "var(--color-accent-blue)", fontWeight: 500, textDecoration: "none" }}>
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
