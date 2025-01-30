// app/api/admin/posts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { isAdmin } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fid = searchParams.get("fid");

    if (!fid) {
      return NextResponse.json({ error: "FID is required" }, { status: 400 });
    }

    // Check if user is admin
    const adminStatus = await isAdmin(fid);
    if (!adminStatus) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all posts with status
    const posts = await sql`
      SELECT
        post_hash,
        title,
        description,
        post_type,
        created_at,
        author_fid,
        status,
        approved_at,
        approved_by
      FROM posts_approval
      ORDER BY
        CASE
          WHEN status = 'pending' THEN 0
          WHEN status = 'approved' THEN 1
          ELSE 2
        END,
        created_at DESC;
    `;

    return NextResponse.json({ posts: posts.rows });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 },
    );
  }
}
