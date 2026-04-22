import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import Activity from "@/models/Activity";
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

    await dbConnect();

    const activity = await Activity.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!activity) {
      return NextResponse.json({ error: "Activity not found" }, { status: 404 });
    }

    return NextResponse.json(activity);
  } catch (error) {
    console.error("PUT /api/activities/[id] error:", error);
    return NextResponse.json({ error: "Failed to update activity" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await dbConnect();

    const activity = await Activity.findOneAndDelete({
      _id: id,
      userId: session.user.id,
    });

    if (!activity) {
      return NextResponse.json({ error: "Activity not found" }, { status: 404 });
    }

    // Also delete all related logs
    await ActivityLog.deleteMany({ activityId: id, userId: session.user.id });

    return NextResponse.json({ message: "Activity deleted" });
  } catch (error) {
    console.error("DELETE /api/activities/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete activity" }, { status: 500 });
  }
}
