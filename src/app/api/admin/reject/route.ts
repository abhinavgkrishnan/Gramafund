// app/api/admin/reject/route.ts
import { NextRequest, NextResponse } from "next/server";
import { rejectPost, isAdmin } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { postHash, adminFid } = body;

    if (!postHash || !adminFid) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify admin status
    const adminStatus = await isAdmin(adminFid);
    if (!adminStatus) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Reject the post
    const result = await rejectPost(postHash, adminFid);

    return NextResponse.json({
      message: "Post rejected successfully",
      post: result.rows[0]
    });
  } catch (error) {
    console.error("Error rejecting post:", error);
    return NextResponse.json(
      { error: "Failed to reject post" },
      { status: 500 }
    );
  }
}