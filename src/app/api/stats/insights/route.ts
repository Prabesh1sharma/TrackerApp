import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import Activity from "@/models/Activity";
import ActivityLog from "@/models/ActivityLog";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const activities = await Activity.find({ userId: session.user.id, archived: false });
    const logs = await ActivityLog.find({ userId: session.user.id });
    const total = activities.length;

    if (total === 0) return NextResponse.json({ weeklyRates: [], dayOfWeek: [], consistencyScore: 0, trend: "stable", insights: [], badges: [] });

    // Day-of-week analysis
    const dayStats = Array.from({ length: 7 }, () => ({ completed: 0, total: 0 }));
    const dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

    for (const log of logs) {
      const dow = new Date(log.date).getDay();
      dayStats[dow].total++;
      if (log.status === "completed" || log.status === "excused") dayStats[dow].completed++;
    }

    const dayOfWeek = dayStats.map((d, i) => ({
      day: dayNames[i],
      rate: d.total > 0 ? Math.round((d.completed / d.total) * 100) : 0,
    }));

    // Weekly rates (last 12 weeks)
    const weeklyRates: { week: string; rate: number }[] = [];
    const now = new Date();
    for (let w = 11; w >= 0; w--) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() - w * 7);
      weekStart.setUTCHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setUTCHours(23, 59, 59, 999);

      const weekLogs = logs.filter((l) => {
        const d = new Date(l.date);
        return d >= weekStart && d <= weekEnd;
      });

      const weekCompleted = weekLogs.filter((l) => l.status === "completed" || l.status === "excused").length;
      const weekTotal = weekLogs.length || 1;
      weeklyRates.push({
        week: `W${12 - w}`,
        rate: Math.round((weekCompleted / weekTotal) * 100),
      });
    }

    // Consistency score
    const allDates = new Set(logs.map((l) => new Date(l.date).toISOString().split("T")[0]));
    const daysWithActivity = [...allDates].filter((dateStr) => {
      const dayLogs = logs.filter((l) => new Date(l.date).toISOString().split("T")[0] === dateStr);
      return dayLogs.some((l) => l.status === "completed" || l.status === "excused");
    }).length;
    const totalDays = allDates.size || 1;
    const consistencyScore = Math.round((daysWithActivity / totalDays) * 100);

    // Trend
    const recentRate = weeklyRates.slice(-4).reduce((s, w) => s + w.rate, 0) / 4;
    const olderRate = weeklyRates.slice(0, 4).reduce((s, w) => s + w.rate, 0) / 4;
    const trend = recentRate > olderRate + 5 ? "improving" : recentRate < olderRate - 5 ? "declining" : "stable";

    // Insights
    const insights: string[] = [];
    const bestDay = dayOfWeek.reduce((a, b) => (a.rate > b.rate ? a : b));
    const worstDay = dayOfWeek.reduce((a, b) => (a.rate < b.rate ? a : b));
    if (bestDay.rate > 0) insights.push(`You perform best on ${bestDay.day}s (${bestDay.rate}%)`);
    if (worstDay.rate < bestDay.rate) insights.push(`${worstDay.day}s are your weakest day (${worstDay.rate}%)`);
    const weekdayAvg = dayOfWeek.slice(1, 6).reduce((s, d) => s + d.rate, 0) / 5;
    const weekendAvg = (dayOfWeek[0].rate + dayOfWeek[6].rate) / 2;
    if (weekdayAvg > weekendAvg + 10) insights.push("You're more consistent on weekdays");
    else if (weekendAvg > weekdayAvg + 10) insights.push("You perform better on weekends");
    if (trend === "improving") insights.push("📈 Your consistency is improving — keep it up!");
    if (trend === "declining") insights.push("📉 Your consistency has dipped recently. Refocus!");
    if (consistencyScore >= 80) insights.push("🔥 Excellent consistency! You're in the top tier.");

    // Badges
    const badges: { name: string; emoji: string; earned: boolean; description: string }[] = [];
    // Check streaks from logs
    const completedCount = logs.filter((l) => l.status === "completed").length;
    const perfectDays = [...allDates].filter((dateStr) => {
      const dayLogs = logs.filter((l) => new Date(l.date).toISOString().split("T")[0] === dateStr);
      const done = dayLogs.filter((l) => l.status === "completed" || l.status === "excused").length;
      return done >= total;
    }).length;

    badges.push({ name: "First Step", emoji: "👣", earned: completedCount >= 1, description: "Complete your first activity" });
    badges.push({ name: "Perfect Day", emoji: "🎯", earned: perfectDays >= 1, description: "100% completion in a day" });
    badges.push({ name: "Week Warrior", emoji: "⭐", earned: perfectDays >= 7, description: "7 perfect days" });
    badges.push({ name: "Monthly Master", emoji: "🏆", earned: perfectDays >= 30, description: "30 perfect days" });
    badges.push({ name: "Century Club", emoji: "💎", earned: completedCount >= 100, description: "100 total completions" });
    badges.push({ name: "Consistency King", emoji: "👑", earned: consistencyScore >= 90, description: "90%+ consistency score" });

    return NextResponse.json({ weeklyRates, dayOfWeek, consistencyScore, trend, insights, badges });
  } catch (error) {
    console.error("GET /api/stats/insights error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
