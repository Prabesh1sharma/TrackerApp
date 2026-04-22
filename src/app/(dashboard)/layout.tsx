import Sidebar from "@/components/layout/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main className="dashboard-main" style={{ flex: 1, paddingBottom: "80px" }}>
        <div style={{ maxWidth: "1152px", margin: "0 auto", padding: "24px 16px" }}>
          {children}
        </div>
      </main>
    </div>
  );
}
