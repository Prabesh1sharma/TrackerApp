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
    const logs = await ActivityLog.find({ userId: session.user.id }).sort({ date: -1 });

    const streaks = activities.map((act) => {
      const actLogs = logs
        .filter((l) => l.activityId.toString() === act._id.toString())
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      const checkDate = new Date(today);

      // Calculate current streak walking backward from today
      let foundFirst = false;
      for (let i = 0; i < 365; i++) {
        const dateStr = checkDate.toISOString().split("T")[0];
        const log = actLogs.find((l) => new Date(l.date).toISOString().split("T")[0] === dateStr);

        if (log && (log.status === "completed" || log.status === "excused")) {
          currentStreak++;
          foundFirst = true;
        } else if (foundFirst || i > 0) {
          break;
        }
        checkDate.setDate(checkDate.getDate() - 1);
      }

      // Calculate longest streak from all logs
      const sortedLogs = [...actLogs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      for (const log of sortedLogs) {
        if (log.status === "completed" || log.status === "excused") {
          tempStreak++;
          longestStreak = Math.max(longestStreak, tempStreak);
        } else {
          tempStreak = 0;
        }
      }
      longestStreak = Math.max(longestStreak, currentStreak);

      return {
        activityId: act._id,
        title: act.title,
        category: act.category,
        currentStreak,
        longestStreak,
        totalCompleted: actLogs.filter((l) => l.status === "completed").length,
        totalExcused: actLogs.filter((l) => l.status === "excused").length,
      };
    });

    streaks.sort((a, b) => b.currentStreak - a.currentStreak);
    return NextResponse.json(streaks);
  } catch (error) {
    console.error("GET /api/streaks error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
