import Link from "next/link";
import { RiFireLine } from "react-icons/ri";
import { HiOutlineChartBar, HiOutlineCalendar, HiOutlineLightBulb, HiOutlineCheck, HiOutlineFire, HiOutlineViewGrid } from "react-icons/hi";

const features = [
  { icon: HiOutlineViewGrid, title: "Daily Dashboard", desc: "Mark activities as done, missed, or excused. Track your day at a glance." },
  { icon: HiOutlineFire, title: "Streak Tracking", desc: "Build momentum with streak counters. Excused days won't break your streak." },
  { icon: HiOutlineChartBar, title: "GitHub-style Heatmap", desc: "Visualize your consistency over the entire year with color-coded intensity." },
  { icon: HiOutlineCalendar, title: "Calendar View", desc: "Browse your history day by day. See exactly what you did and when." },
  { icon: HiOutlineLightBulb, title: "Smart Insights", desc: "Discover patterns in your behavior. Learn which days you perform best." },
  { icon: HiOutlineCheck, title: "Achievement Badges", desc: "Earn badges as you hit milestones. Stay motivated with gamification." },
];

export default function LandingPage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--color-bg-primary)" }}>
      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", maxWidth: "1152px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "36px", height: "36px", backgroundColor: "rgba(91,143,185,0.2)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <RiFireLine style={{ width: "20px", height: "20px", color: "var(--color-accent-blue)" }} />
          </div>
          <span className="gradient-text" style={{ fontSize: "20px", fontWeight: 700 }}>Stride</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link href="/login" style={{ padding: "8px 16px", fontSize: "14px", fontWeight: 500, color: "var(--color-text-secondary)", textDecoration: "none" }}>
            Sign In
          </Link>
          <Link href="/signup" style={{ padding: "10px 20px", fontSize: "14px", fontWeight: 600, backgroundColor: "var(--color-accent-blue)", color: "white", borderRadius: "12px", textDecoration: "none" }}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ position: "relative", overflow: "hidden" }}>
        {/* Background blobs */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <div className="animate-float" style={{ position: "absolute", top: "80px", left: "25%", width: "500px", height: "500px", backgroundColor: "rgba(91,143,185,0.05)", borderRadius: "50%", filter: "blur(80px)" }} />
          <div className="animate-float" style={{ position: "absolute", bottom: "80px", right: "25%", width: "400px", height: "400px", backgroundColor: "rgba(155,126,200,0.05)", borderRadius: "50%", filter: "blur(80px)", animationDelay: "2s" }} />
        </div>

        <div style={{ position: "relative", maxWidth: "896px", margin: "0 auto", padding: "80px 24px 112px", textAlign: "center" }}>
          {/* Badge */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "32px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 16px", backgroundColor: "rgba(91,143,185,0.1)", border: "1px solid rgba(91,143,185,0.2)", borderRadius: "9999px", fontSize: "12px", fontWeight: 500, color: "var(--color-accent-blue)" }}>
              <RiFireLine style={{ width: "14px", height: "14px" }} />
              Build habits that stick
            </div>
          </div>

          {/* Title */}
          <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 3.75rem)", fontWeight: 700, color: "var(--color-text-primary)", lineHeight: 1.1, marginBottom: "24px" }}>
            Track Your Daily<br />
            <span className="gradient-text">Activities &amp; Streaks</span>
          </h1>

          {/* Description */}
          <p style={{ fontSize: "18px", color: "var(--color-text-secondary)", maxWidth: "640px", margin: "0 auto 40px", lineHeight: 1.6 }}>
            Stay consistent with your habits. Track completions, build streaks,
            visualize progress with heatmaps, and unlock achievements — all in one
            beautiful app.
          </p>

          {/* CTA Buttons */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", flexWrap: "wrap" }}>
            <Link href="/signup" className="animate-pulse-glow" style={{ padding: "14px 32px", fontSize: "16px", fontWeight: 600, backgroundColor: "var(--color-accent-blue)", color: "white", borderRadius: "12px", textDecoration: "none", transition: "all 0.2s" }}>
              Start Tracking — Free
            </Link>
            <Link href="/login" style={{ padding: "14px 32px", fontSize: "16px", fontWeight: 500, backgroundColor: "var(--color-bg-secondary)", border: "1px solid var(--color-border-default)", color: "var(--color-text-primary)", borderRadius: "12px", textDecoration: "none", transition: "all 0.2s" }}>
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ maxWidth: "1152px", margin: "0 auto", padding: "0 24px 112px" }}>
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <h2 style={{ fontSize: "30px", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "16px" }}>
            Everything you need to stay on track
          </h2>
          <p style={{ color: "var(--color-text-secondary)", maxWidth: "560px", margin: "0 auto", lineHeight: 1.6 }}>
            Powerful features designed to help you build and maintain positive daily habits.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
          {features.map((f, i) => (
            <div key={i} className="card-hover" style={{ backgroundColor: "var(--color-bg-secondary)", border: "1px solid var(--color-border-default)", borderRadius: "16px", padding: "24px" }}>
              <div style={{ width: "48px", height: "48px", backgroundColor: "rgba(91,143,185,0.1)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                <f.icon style={{ width: "24px", height: "24px", color: "var(--color-accent-blue)" }} />
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 600, color: "var(--color-text-primary)", marginBottom: "8px" }}>{f.title}</h3>
              <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--color-border-default)", padding: "32px 0" }}>
        <div style={{ maxWidth: "1152px", margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <RiFireLine style={{ width: "16px", height: "16px", color: "var(--color-accent-blue)" }} />
            <span className="gradient-text" style={{ fontSize: "14px", fontWeight: 600 }}>Stride</span>
          </div>
          <p style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>© {new Date().getFullYear()} Stride. Built with consistency.</p>
        </div>
      </footer>
    </div>
  );
}
