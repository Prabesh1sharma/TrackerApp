import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import ActivityLog from "@/models/ActivityLog";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const activityId = searchParams.get("activityId");

    const query: Record<string, unknown> = { userId: session.user.id };

    if (activityId) {
      query.activityId = activityId;
    }

    if (from || to) {
      query.date = {};
      if (from) (query.date as Record<string, Date>).$gte = new Date(from);
      if (to) (query.date as Record<string, Date>).$lte = new Date(to);
    }

    const logs = await ActivityLog.find(query).sort({ date: -1 });

    return NextResponse.json(logs);
  } catch (error) {
    console.error("GET /api/logs error:", error);
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { activityId, date, status, reason, remark } = await req.json();

    if (!activityId || !date || !status) {
      return NextResponse.json(
        { error: "activityId, date, and status are required" },
        { status: 400 }
      );
    }

    if (status === "excused" && (!reason || !reason.trim())) {
      return NextResponse.json(
        { error: "A reason is required when marking as excused" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Normalize date to midnight UTC
    const normalizedDate = new Date(date);
    normalizedDate.setUTCHours(0, 0, 0, 0);

    // Upsert: create or update the log for this activity on this date
    const log = await ActivityLog.findOneAndUpdate(
      {
        userId: session.user.id,
        activityId,
        date: normalizedDate,
      },
      {
        $set: {
          status,
          reason: reason?.trim() || "",
          remark: remark?.trim() || "",
        },
        $setOnInsert: {
          userId: session.user.id,
          activityId,
          date: normalizedDate,
        },
      },
      { upsert: true, new: true, runValidators: true }
    );

    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    console.error("POST /api/logs error:", error);
    return NextResponse.json({ error: "Failed to create log" }, { status: 500 });
  }
}
