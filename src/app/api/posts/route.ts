import { NextResponse } from "next/server";
import { NeynarAPIClient } from "@neynar/nodejs-sdk";

const client = new NeynarAPIClient({ apiKey: process.env.NEYNAR_API_KEY! });

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor");

    console.log("Making request to Neynar...", { cursor });

    for (let i = 0; i < 3; i++) {
      try {
        const response = await client.fetchFeed({
          feedType: "filter",
          filterType: "parent_url",
          parentUrl: "https://gramafund.vercel.app",
          limit: 25,
          cursor: cursor || undefined,
        });

        const posts = response.casts
          .map((cast) => {
            const titleMatch = cast.text.match(/\[title\]\s*(.*?)(?=\s*\[|$)/);
            const descriptionMatch = cast.text.match(
              /\[description\]\s*(.*?)(?=\s*\[|$)/,
            );
            const typeMatch = cast.text.match(/\[type\]\s*(.*?)(?=\s*\[|$)/);

            // If any of the required fields are missing, return null
            if (!titleMatch?.[1] || !descriptionMatch?.[1] || !typeMatch?.[1]) {
              return null;
            }

            // Validate type is one of the allowed values
            const validTypes = ["Project", "Comment", "Reaction", "Funding"];
            const type = typeMatch[1].trim();
            if (!validTypes.includes(type)) {
              return null;
            }

            return {
              id: cast.hash,
              type: type as "Project" | "Comment" | "Reaction" | "Funding",
              title: titleMatch[1].trim(),
              description: descriptionMatch[1].trim(),
              author: cast.author.display_name || cast.author.username,
              date: new Date(cast.timestamp).toISOString().split("T")[0],
              karma: cast.reactions.likes_count,
              comments: cast.replies.count,
              tags: [],
            };
          })
          .filter((post): post is NonNullable<typeof post> => post !== null); // Type guard to filter out null values

        return NextResponse.json({
          posts,
          nextCursor: response.next?.cursor,
        });
      } catch (error) {
        console.log(
          `Attempt ${i + 1} failed, retrying in ${(i + 1) * 1000}ms...`,
          error,
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
      { status: 503 },
    );
  }
}