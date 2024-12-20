import { NextResponse } from "next/server";
import { NeynarAPIClient } from "@neynar/nodejs-sdk";

const client = new NeynarAPIClient({ apiKey: process.env.NEYNAR_API_KEY! });

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Fetch both the cast and its conversation
    const [castResponse, conversationResponse] = await Promise.all([
      client.lookupCastByHashOrWarpcastUrl({
        identifier: params.id,
        type: "hash"
      }),
      client.lookupCastConversation({
        identifier: params.id,
        type: "hash",
        replyDepth: 1,
      })
    ]);
    
    const { cast } = castResponse;
    const replies = conversationResponse.conversation.cast.direct_replies || [];
    
    // Extract title, description, and type from the text
    const titleMatch = cast.text.match(/\[title\](.*?)\n/);
    const descriptionMatch = cast.text.match(/\[description\](.*?)\n/);
    const typeMatch = cast.text.match(/\[type\](.*?)$/);

    // Transform comments
    const comments = replies.map(reply => ({
      id: reply.hash,
      author: reply.author.display_name || reply.author.username,
      authorPfp: reply.author.pfp_url,
      text: reply.text,
      timestamp: reply.timestamp,
      likes: reply.reactions.likes_count,
      replies: reply.replies.count,
    }));

    const post = {
      id: cast.hash,
      type: (typeMatch?.[1]?.trim() || "Project") as "Project" | "Comment" | "Reaction" | "Funding",
      title: titleMatch?.[1]?.trim() || "Untitled",
      description: descriptionMatch?.[1]?.trim() || "",
      author: cast.author.display_name || cast.author.username,
      authorPfp: cast.author.pfp_url,
      date: new Date(cast.timestamp).toISOString().split("T")[0],
      karma: cast.reactions.likes_count,
      comments: cast.replies.count,
      tags: [],
      replies: comments
    };

    return NextResponse.json({ post });
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    );
  }
}