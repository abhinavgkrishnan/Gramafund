// app/api/admin/approve/route.ts
import { NextRequest, NextResponse } from "next/server";
import { approvePost, isAdmin } from "@/lib/db";

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

    // Approve the post
    const result = await approvePost(postHash, adminFid);

    return NextResponse.json({
      message: "Post approved successfully",
      post: result.rows[0]
    });
  } catch (error) {
    console.error("Error approving post:", error);
    return NextResponse.json(
      { error: "Failed to approve post" },
      { status: 500 }
    );
  }
}