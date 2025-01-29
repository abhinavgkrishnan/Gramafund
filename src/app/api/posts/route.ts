import { NextResponse } from "next/server";
import { NeynarAPIClient } from "@neynar/nodejs-sdk";

const client = new NeynarAPIClient({ apiKey: process.env.NEYNAR_API_KEY! });

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const PARENT_URLS = [
  "https://gramafund.vercel.app",
  "https://gramafund.vercel.app/frame"
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor");

    console.log("Making request to Neynar...", { cursor });
    
    for (let i = 0; i < 3; i++) {
      try {
        // Fetch from both URLs
        const responses = await Promise.all(
          PARENT_URLS.map(url => 
            client.fetchFeed({
              feedType: "filter",
              filterType: "parent_url",
              parentUrl: url,
              limit: 25,
              cursor: cursor || undefined,
            })
          )
        );

        // Combine and deduplicate posts
        const allCasts = responses.flatMap(response => response.casts);
        const uniqueCasts = allCasts.filter((cast, index) => 
          allCasts.findIndex(c => c.hash === cast.hash) === index
        );

        const posts = await Promise.all(uniqueCasts.map(async (cast) => {
          const titleMatch = cast.text.match(/\[title\]\s*(.*?)(?=\s*\[|$)/);
          const descriptionMatch = cast.text.match(
            /\[description\]\s*(.*?)(?=\s*\[|$)/
          );
          const typeMatch = cast.text.match(/\[type\]\s*(.*?)(?=\s*\[|$)/);

          if (!titleMatch?.[1] || !descriptionMatch?.[1] || !typeMatch?.[1]) {
            return null;
          }

          const validTypes = ["Project", "Comment", "Reaction", "Funding"];
          const type = typeMatch[1].trim();
          if (!validTypes.includes(type)) {
            return null;
          }

          // Fetch conversation to get replies
          const conversationResponse = await client.lookupCastConversation({
            identifier: cast.hash,
            type: "hash",
            replyDepth: 1,
          });

          const replies = conversationResponse.conversation.cast.direct_replies || [];

          // Filter out curve data comments
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
        }));

        // Filter out null posts
        const filteredPosts = posts.filter((post): post is NonNullable<typeof post> => post !== null);

        // Get the earliest cursor
        const nextCursor = responses
          .map(response => response.next?.cursor)
          .filter(Boolean)[0];

        return NextResponse.json({
          posts: filteredPosts,
          nextCursor,
        });
      } catch (error) {
        console.log(
          `Attempt ${i + 1} failed, retrying in ${(i + 1) * 1000}ms...`,
          error
        );
        await wait((i + 1) * 1000);
      }
    }

    throw new Error("Failed after 3 attempts");
  } catch (err: unknown) {
    console.error("All attempts failed:", err);
    return NextResponse.json(
      {
        error: "API temporarily unavailable",
        message: "Please try again in a few moments",
      },
      { status: 503 }
    );
  }
}