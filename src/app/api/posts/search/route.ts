import { NextResponse } from "next/server";
import { getApprovedPosts } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json({ posts: [] });
    }

    // Fetch approved posts from the database
    const approvedPosts = await getApprovedPosts();

    // Filter and transform posts based on search query
    const searchLower = query.toLowerCase();
    const posts = approvedPosts.rows
      .map((post) => {
        const title = post.title.trim();
        const description = post.description.trim();
        const type = post.post_type.trim();

        // Check if post matches search query
        if (
          !title.toLowerCase().includes(searchLower) &&
          !description.toLowerCase().includes(searchLower)
        ) {
          return null;
        }

        return {
          id: post.post_hash,
          type,
          title,
          description,
          author: post.author_fid, // Assuming author_fid is the display name or username
          authorPfp: "", // Assuming no profile picture URL in the database
          date: new Date(post.created_at).toISOString().split("T")[0],
          karma: 0, // Assuming no karma data in the database
          comments: 0, // Assuming no comments data in the database
        };
      })
      .filter((post): post is NonNullable<typeof post> => post !== null)
      .sort((a, b) => {
        // Sort by relevance (title matches first, then description matches)
        const aTitle = a.title.toLowerCase().includes(searchLower);
        const bTitle = b.title.toLowerCase().includes(searchLower);
        if (aTitle && !bTitle) return -1;
        if (!aTitle && bTitle) return 1;
        return b.karma - a.karma; // Secondary sort by karma
      });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Error searching posts:", error);
    return NextResponse.json(
      { error: "Failed to search posts" },
      { status: 500 },
    );
  }
}
