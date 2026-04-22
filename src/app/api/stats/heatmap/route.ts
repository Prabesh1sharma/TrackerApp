import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import Activity from "@/models/Activity";
import ActivityLog from "@/models/ActivityLog";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const year = parseInt(searchParams.get("year") || new Date().getFullYear().toString());

    await dbConnect();

    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);

    const activities = await Activity.find({ userId: session.user.id, archived: false });
    const totalActivities = activities.length;

    if (totalActivities === 0) return NextResponse.json([]);

    const logs = await ActivityLog.find({
      userId: session.user.id,
      date: { $gte: startDate, $lte: endDate },
    });

    const dayMap: Record<string, { completed: number; total: number }> = {};

    // Initialize all days
    const d = new Date(startDate);
    while (d <= endDate) {
      dayMap[d.toISOString().split("T")[0]] = { completed: 0, total: totalActivities };
      d.setDate(d.getDate() + 1);
    }

    for (const log of logs) {
      const key = new Date(log.date).toISOString().split("T")[0];
      if (dayMap[key] && (log.status === "completed" || log.status === "excused")) {
        dayMap[key].completed++;
      }
    }

    const data = Object.entries(dayMap).map(([date, v]) => ({
      date,
      completed: v.completed,
      total: v.total,
      score: v.total > 0 ? Math.round((v.completed / v.total) * 100) : 0,
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/stats/heatmap error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
