import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import Activity from "@/models/Activity";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const showArchived = searchParams.get("archived") === "true";

    const activities = await Activity.find({
      userId: session.user.id,
      archived: showArchived,
    }).sort({ createdAt: -1 });

    return NextResponse.json(activities);
  } catch (error) {
    console.error("GET /api/activities error:", error);
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, category } = await req.json();

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    await dbConnect();

    const activity = await Activity.create({
      userId: session.user.id,
      title: title.trim(),
      description: description?.trim() || "",
      category: category?.trim() || "General",
    });

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error("POST /api/activities error:", error);
    return NextResponse.json({ error: "Failed to create activity" }, { status: 500 });
  }
}
