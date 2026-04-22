"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff, HiOutlineUser } from "react-icons/hi";
import { RiFireLine } from "react-icons/ri";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) { toast.error("Passwords do not match"); return; }
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Signup failed"); return; }
      toast.success("Account created! Please sign in.");
      router.push("/login");
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
    position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)",
    width: "20px", height: "20px", color: "var(--color-text-muted)",
  };

  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: "13px", fontWeight: 500,
    color: "var(--color-text-secondary)", marginBottom: "8px",
  };

  const focusHandler = (e: React.FocusEvent<HTMLInputElement>) => e.target.style.borderColor = "var(--color-accent-blue)";
  const blurHandler = (e: React.FocusEvent<HTMLInputElement>) => e.target.style.borderColor = "var(--color-border-default)";

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, backgroundColor: "var(--color-bg-primary)" }}>
        <div className="animate-float" style={{ position: "absolute", top: "33%", right: "25%", width: "384px", height: "384px", backgroundColor: "rgba(93,168,126,0.05)", borderRadius: "50%", filter: "blur(80px)" }} />
        <div className="animate-float" style={{ position: "absolute", bottom: "33%", left: "25%", width: "384px", height: "384px", backgroundColor: "rgba(91,143,185,0.05)", borderRadius: "50%", filter: "blur(80px)", animationDelay: "1.5s" }} />
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
          <p style={{ color: "var(--color-text-secondary)", fontSize: "14px" }}>Start building better habits today.</p>
        </div>

        {/* Form Card */}
        <div style={{ backgroundColor: "rgba(36,34,32,0.8)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: "1px solid var(--color-border-default)", borderRadius: "20px", padding: "32px" }}>
          <form onSubmit={handleSubmit}>
            {/* Name */}
            <div style={{ marginBottom: "20px" }}>
              <label htmlFor="signup-name" style={labelStyle}>Full Name</label>
              <div style={{ position: "relative" }}>
                <HiOutlineUser style={iconStyle} />
                <input id="signup-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="John Doe" style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} />
              </div>
            </div>

            {/* Email */}
            <div style={{ marginBottom: "20px" }}>
              <label htmlFor="signup-email" style={labelStyle}>Email</label>
              <div style={{ position: "relative" }}>
                <HiOutlineMail style={iconStyle} />
                <input id="signup-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: "20px" }}>
              <label htmlFor="signup-password" style={labelStyle}>Password</label>
              <div style={{ position: "relative" }}>
                <HiOutlineLockClosed style={iconStyle} />
                <input id="signup-password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Min. 6 characters" style={{ ...inputStyle, paddingRight: "44px" }} onFocus={focusHandler} onBlur={blurHandler} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", padding: 0 }}>
                  {showPassword ? <HiOutlineEyeOff style={{ width: "20px", height: "20px" }} /> : <HiOutlineEye style={{ width: "20px", height: "20px" }} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div style={{ marginBottom: "24px" }}>
              <label htmlFor="signup-confirm" style={labelStyle}>Confirm Password</label>
              <div style={{ position: "relative" }}>
                <HiOutlineLockClosed style={iconStyle} />
                <input id="signup-confirm" type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required placeholder="Re-enter password" style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} />
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} style={{ width: "100%", backgroundColor: "var(--color-accent-blue)", color: "white", fontWeight: 600, padding: "12px", borderRadius: "12px", border: "none", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.5 : 1, fontSize: "15px", transition: "all 0.2s" }}>
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <div style={{ marginTop: "24px", textAlign: "center" }}>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "14px" }}>
              Already have an account?{" "}
              <Link href="/login" style={{ color: "var(--color-accent-blue)", fontWeight: 500, textDecoration: "none" }}>Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
