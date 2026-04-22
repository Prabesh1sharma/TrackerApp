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

    if (total === 0) return NextResponse.json({
      consistencyScore: 0,
      consistencyContext: { donedays: 0, totalDays: 0, missedDays: 0, label: "No data yet" },
      trend: "stable",
      trendDelta: 0,
      monthlyRates: [],
      habitBreakdown: [],
      bestHabit: null,
      worstHabit: null,
      insights: [],
      badges: [],
    });

    // ── Helpers ────────────────────────────────────────────────────────────────
    const isDone = (status: string) => status === "completed" || status === "excused";

    const allDates = [...new Set(logs.map((l) => new Date(l.date).toISOString().split("T")[0]))].sort();

    // ── Consistency score & context ────────────────────────────────────────────
    const doneDays = allDates.filter((d) => {
      return logs.filter((l) => new Date(l.date).toISOString().split("T")[0] === d).some((l) => isDone(l.status));
    }).length;
    const totalDays = allDates.length || 1;
    const missedDays = totalDays - doneDays;
    const consistencyScore = Math.round((doneDays / totalDays) * 100);
    const consistencyLabel =
      consistencyScore >= 90 ? "Excellent — top tier"
        : consistencyScore >= 75 ? "Great — above average"
          : consistencyScore >= 60 ? "Good — room to grow"
            : consistencyScore >= 40 ? "Inconsistent — needs focus"
              : "Struggling — start small";

    // ── Monthly completion rates (last 6 months) ───────────────────────────────
    const monthlyRates: { month: string; rate: number; completed: number; total: number }[] = [];
    const now = new Date();
    for (let m = 5; m >= 0; m--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - m, 1);
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59, 999);
      const monthLogs = logs.filter((l) => {
        const d = new Date(l.date);
        return d >= monthStart && d <= monthEnd;
      });
      const completed = monthLogs.filter((l) => isDone(l.status)).length;
      const monthTotal = monthLogs.length || 0;
      monthlyRates.push({
        month: monthDate.toLocaleString("default", { month: "short" }),
        rate: monthTotal > 0 ? Math.round((completed / monthTotal) * 100) : 0,
        completed,
        total: monthTotal,
      });
    }

    // ── 4-week trend (recent 4 weeks vs prior 4 weeks) ─────────────────────────
    const weeksBucket = (offset: number) => {
      const end = new Date(now);
      end.setDate(end.getDate() - offset * 7);
      const start = new Date(end);
      start.setDate(start.getDate() - 28);
      const bucket = logs.filter((l) => { const d = new Date(l.date); return d >= start && d <= end; });
      const done = bucket.filter((l) => isDone(l.status)).length;
      return bucket.length > 0 ? (done / bucket.length) * 100 : 0;
    };
    const recentRate = weeksBucket(0);
    const priorRate = weeksBucket(4);
    const trendDelta = Math.round(recentRate - priorRate);
    const trend = trendDelta > 5 ? "improving" : trendDelta < -5 ? "declining" : "stable";

    // ── Per-habit breakdown ────────────────────────────────────────────────────
    const habitBreakdown = activities.map((activity) => {
      const hLogs = logs.filter((l) => l.activityId?.toString() === activity._id.toString());
      const hDone = hLogs.filter((l) => isDone(l.status)).length;
      const hTotal = hLogs.length || 1;
      const rate = Math.round((hDone / hTotal) * 100);

      // current streak for this habit
      const hDates = [...new Set(hLogs.map((l) => new Date(l.date).toISOString().split("T")[0]))].sort();
      let currentStreak = 0;
      for (let i = hDates.length - 1; i >= 0; i--) {
        const dayLogs = hLogs.filter((l) => new Date(l.date).toISOString().split("T")[0] === hDates[i]);
        if (dayLogs.some((l) => isDone(l.status))) currentStreak++;
        else break;
      }

      // best streak
      let bestStreak = 0, tmpStreak = 0;
      for (const dk of hDates) {
        const dayLogs = hLogs.filter((l) => new Date(l.date).toISOString().split("T")[0] === dk);
        if (dayLogs.some((l) => isDone(l.status))) { tmpStreak++; bestStreak = Math.max(bestStreak, tmpStreak); }
        else tmpStreak = 0;
      }

      // last 30-day rate
      const cutoff = new Date(now);
      cutoff.setDate(cutoff.getDate() - 30);
      const recent30 = hLogs.filter((l) => new Date(l.date) >= cutoff);
      const recent30Done = recent30.filter((l) => isDone(l.status)).length;
      const recent30Rate = recent30.length > 0 ? Math.round((recent30Done / recent30.length) * 100) : null;

      return {
        id: activity._id.toString(),
        name: activity.title,
        emoji: "📌",
        rate,
        completedCount: hDone,
        totalCount: hTotal,
        currentStreak,
        bestStreak,
        recent30Rate,
      };
    });

    // Sort by rate descending
    habitBreakdown.sort((a, b) => b.rate - a.rate);

    const bestHabit = habitBreakdown.length > 0 ? habitBreakdown[0] : null;
    const worstHabit = habitBreakdown.length > 1 ? habitBreakdown[habitBreakdown.length - 1] : null;

    // ── Insights (data-driven, specific) ──────────────────────────────────────
    const insights: string[] = [];

    if (bestHabit && bestHabit.rate >= 80)
      insights.push(`${bestHabit.emoji} "${bestHabit.name}" is your strongest habit at ${bestHabit.rate}% — use it as an anchor for the others.`);

    if (worstHabit && worstHabit.rate < 60 && worstHabit.name !== bestHabit?.name)
      insights.push(`${worstHabit.emoji} "${worstHabit.name}" is lagging at ${worstHabit.rate}%. Consider pairing it with a stronger habit.`);

    if (trend === "improving" && trendDelta > 0)
      insights.push(`You're up ${trendDelta}% compared to the previous 4 weeks — momentum is building.`);
    if (trend === "declining" && trendDelta < 0)
      insights.push(`You're down ${Math.abs(trendDelta)}% vs the previous 4 weeks. A small reset can get you back on track.`);

    const longestCurrentStreak = Math.max(...habitBreakdown.map((h) => h.currentStreak));
    if (longestCurrentStreak >= 7)
      insights.push(`You're on a ${longestCurrentStreak}-day streak — don't break the chain!`);

    if (missedDays > 0 && doneDays > 0) {
      const ratio = Math.round((missedDays / totalDays) * 100);
      if (ratio <= 20) insights.push(`Only ${missedDays} missed day${missedDays > 1 ? "s" : ""} total — you're extremely reliable.`);
    }

    const lastMonth = monthlyRates[monthlyRates.length - 1];
    const prevMonth = monthlyRates[monthlyRates.length - 2];
    if (lastMonth && prevMonth && lastMonth.rate > prevMonth.rate + 10)
      insights.push(`${lastMonth.month} was your best recent month at ${lastMonth.rate}% — up from ${prevMonth.rate}% in ${prevMonth.month}.`);

    // ── Badges ─────────────────────────────────────────────────────────────────
    const completedCount = logs.filter((l) => l.status === "completed").length;
    const perfectDays = allDates.filter((dateStr) => {
      const dayLogs = logs.filter((l) => new Date(l.date).toISOString().split("T")[0] === dateStr);
      const done = dayLogs.filter((l) => isDone(l.status)).length;
      return done >= total;
    }).length;

    const globalBestStreak = Math.max(0, ...habitBreakdown.map((h) => h.bestStreak));

    const badges = [
      { name: "First Step", emoji: "👣", earned: completedCount >= 1, description: "Complete your first activity" },
      { name: "Perfect Day", emoji: "🎯", earned: perfectDays >= 1, description: "100% completion in a day" },
      { name: "Week Warrior", emoji: "⭐", earned: globalBestStreak >= 7, description: "7-day streak on any habit" },
      { name: "Monthly Master", emoji: "🏆", earned: perfectDays >= 30, description: "30 perfect days" },
      { name: "Century Club", emoji: "💎", earned: completedCount >= 100, description: "100 total completions" },
      { name: "Consistency King", emoji: "👑", earned: consistencyScore >= 90, description: "90%+ consistency score" },
    ];

    return NextResponse.json({
      consistencyScore,
      consistencyContext: { doneDays, totalDays, missedDays, label: consistencyLabel },
      trend,
      trendDelta,
      monthlyRates,
      habitBreakdown,
      bestHabit,
      worstHabit,
      insights,
      badges,
    });
  } catch (error) {
    console.error("GET /api/stats/insights error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}