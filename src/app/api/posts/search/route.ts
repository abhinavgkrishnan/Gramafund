// app/api/posts/search/route.ts
import { NextResponse } from "next/server";
import { NeynarAPIClient } from "@neynar/nodejs-sdk";

const client = new NeynarAPIClient({ apiKey: process.env.NEYNAR_API_KEY! });

const PARENT_URLS = [
  "https://gramafund.vercel.app",
  "https://gramafund.vercel.app/frame"
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json({ posts: [] });
    }

    // Fetch posts from the feed
    const responses = await Promise.all(
      PARENT_URLS.map(url => 
        client.fetchFeed({
          feedType: "filter",
          filterType: "parent_url",
          parentUrl: url,
          limit: 50, // Increased limit for better search coverage
        })
      )
    );

    // Combine and deduplicate posts
    const allCasts = responses.flatMap(response => response.casts);
    const uniqueCasts = allCasts.filter((cast, index) => 
      allCasts.findIndex(c => c.hash === cast.hash) === index
    );

    // Filter and transform posts based on search query
    const searchLower = query.toLowerCase();
    const posts = uniqueCasts
      .map(cast => {
        const titleMatch = cast.text.match(/\[title\]\s*(.*?)(?=\s*\[|$)/);
        const descriptionMatch = cast.text.match(/\[description\]\s*(.*?)(?=\s*\[|$)/);
        const typeMatch = cast.text.match(/\[type\]\s*(.*?)(?=\s*\[|$)/);

        if (!titleMatch?.[1] || !descriptionMatch?.[1] || !typeMatch?.[1]) {
          return null;
        }

        const title = titleMatch[1].trim();
        const description = descriptionMatch[1].trim();
        const type = typeMatch[1].trim();

        // Check if post matches search query
        if (!title.toLowerCase().includes(searchLower) && 
            !description.toLowerCase().includes(searchLower)) {
          return null;
        }

        return {
          id: cast.hash,
          type,
          title,
          description,
          author: cast.author.display_name || cast.author.username,
          authorPfp: cast.author.pfp_url || "",
          date: new Date(cast.timestamp).toISOString().split("T")[0],
          karma: cast.reactions.likes_count,
          comments: cast.replies.count,
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
      { status: 500 }
    );
  }
}