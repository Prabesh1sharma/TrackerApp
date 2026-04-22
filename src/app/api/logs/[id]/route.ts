import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import ActivityLog from "@/models/ActivityLog";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const updates = await req.json();

    // Only allow updating specific fields
    const allowedFields: Record<string, unknown> = {};
    if (updates.status) allowedFields.status = updates.status;
    if (updates.reason !== undefined) allowedFields.reason = updates.reason;
    if (updates.remark !== undefined) allowedFields.remark = updates.remark;

    if (updates.status === "excused" && (!updates.reason || !updates.reason.trim())) {
      return NextResponse.json(
        { error: "A reason is required when marking as excused" },
        { status: 400 }
      );
    }

    await dbConnect();

    const log = await ActivityLog.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { $set: allowedFields },
      { new: true, runValidators: true }
    );

    if (!log) {
      return NextResponse.json({ error: "Log not found" }, { status: 404 });
    }

    return NextResponse.json(log);
  } catch (error) {
    console.error("PUT /api/logs/[id] error:", error);
    return NextResponse.json({ error: "Failed to update log" }, { status: 500 });
  }
}
