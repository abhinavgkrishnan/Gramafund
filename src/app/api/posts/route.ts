// app/api/posts/route.ts
import { NextResponse } from "next/server";
import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import { getApprovedPosts } from "@/lib/db";

const client = new NeynarAPIClient({ apiKey: process.env.NEYNAR_API_KEY! });

const PARENT_URLS = [
  "https://gramafund.vercel.app",
  "https://gramafund.vercel.app/frame",
];

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor");

    // Get approved posts from database
    const approvedPosts = await getApprovedPosts();
    const approvedHashes = new Set(approvedPosts.rows.map((post) => post.post_hash));

    // Fetch from Neynar with retries
    for (let i = 0; i < 3; i++) {
      try {
        // Fetch from both URLs
        const responses = await Promise.all(
          PARENT_URLS.map((url) =>
            client.fetchFeed({
              feedType: "filter",
              filterType: "parent_url",
              parentUrl: url,
              limit: 25,
              cursor: cursor || undefined,
            }),
          ),
        );

        // Combine and deduplicate posts
        const allCasts = responses.flatMap((response) => response.casts);
        const uniqueCasts = allCasts.filter(
          (cast, index) => allCasts.findIndex((c) => c.hash === cast.hash) === index,
        );

        // Filter to only include approved posts
        const filteredCasts = uniqueCasts.filter((cast) =>
          approvedHashes.has(cast.hash),
        );

        const posts = await Promise.all(
          filteredCasts.map(async (cast) => {
            const titleMatch = cast.text.match(/\[title\]\s*(.*?)(?=\s*\[|$)/);
            const descriptionMatch = cast.text.match(/\[description\]\s*(.*?)(?=\s*\[|$)/);
            const typeMatch = cast.text.match(/\[type\]\s*(.*?)(?=\s*\[|$)/);

            if (!titleMatch?.[1] || !descriptionMatch?.[1] || !typeMatch?.[1]) {
              return null;
            }

            const validTypes = ["Project", "Comment", "Reaction", "Funding"];
            const type = typeMatch[1].trim();
            if (!validTypes.includes(type)) {
              return null;
            }

            // Fetch conversation to count comments excluding curve data
            const conversation = await client.lookupCastConversation({
              identifier: cast.hash,
              type: "hash",
              replyDepth: 1,
            });

            const replies = conversation.conversation.cast.direct_replies || [];
            const curveDataComments = replies.filter(reply => /\[curve-data\]/.test(reply.text));
            const regularCommentsCount = cast.replies.count - curveDataComments.length;

            return {
              id: cast.hash,
              type: type as "Project" | "Comment" | "Reaction" | "Funding",
              title: titleMatch[1].trim(),
              description: descriptionMatch[1].trim(),
              author: cast.author.display_name || cast.author.username,
              date: new Date(cast.timestamp).toISOString().split("T")[0],
              karma: cast.reactions.likes_count,
              comments: regularCommentsCount,
              tags: [],
            };
          }),
        );

        // Filter out null posts
        const validPosts = posts.filter(
          (post): post is NonNullable<typeof post> => post !== null,
        );

        // Get the earliest cursor
        const nextCursor = responses
          .map((response) => response.next?.cursor)
          .filter(Boolean)[0];

        return NextResponse.json({
          posts: validPosts,
          nextCursor,
        });
      } catch (error) {
        console.error(`Attempt ${i + 1} failed:`, error);
        if (i < 2) {
          await wait((i + 1) * 1000);
        }
      }
    }

    throw new Error("Failed after 3 attempts");
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch posts",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}