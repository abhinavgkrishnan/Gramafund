import { NextResponse } from "next/server";
import { NeynarAPIClient } from "@neynar/nodejs-sdk";

const client = new NeynarAPIClient({ apiKey: process.env.NEYNAR_API_KEY! });

// Define types for the Neynar API response
interface NeynarAuthor {
  fid: number;
  username: string;
  display_name: string;
  pfp_url: string;
}

interface NeynarReactions {
  likes_count: number;
}

interface NeynarReplies {
  count: number;
}

interface NeynarCast {
  hash: string;
  author: NeynarAuthor;
  text: string;
  timestamp: string;
  reactions: NeynarReactions;
  replies: NeynarReplies;
  direct_replies?: NeynarCast[];
}

interface NeynarCastResponse {
  cast: NeynarCast;
}

interface NeynarConversationResponse {
  conversation: {
    cast: NeynarCast;
  };
}

interface TransformedComment {
  id: string;
  author: string;
  authorPfp: string;
  authorFid: number;
  text: string;
  timestamp: string;
  likes: number;
  replies: number;
  nestedReplies: TransformedComment[];
}

interface CurveData {
  xIntercept: number;
  yIntercept: number;
  middlePoint: { x: number; y: number };
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const [castResponse, conversationResponse] = (await Promise.all([
      client.lookupCastByHashOrWarpcastUrl({
        identifier: params.id,
        type: "hash",
      }),
      client.lookupCastConversation({
        identifier: params.id,
        type: "hash",
        replyDepth: 5,
      }),
    ])) as [NeynarCastResponse, NeynarConversationResponse];

    const { cast } = castResponse;
    const replies = conversationResponse.conversation.cast.direct_replies || [];

    // Separate curve data comments from regular comments
    const curveSubmissions: CurveData[] = [];
    const regularComments: NeynarCast[] = [];

    replies.forEach((reply) => {
      const curveMatch = reply.text.match(/\[curve-data\](.*)/);
      if (curveMatch) {
        try {
          const curveData = JSON.parse(curveMatch[1]);
          curveSubmissions.push(curveData);
        } catch (e) {
          console.error("Failed to parse curve data:", e);
        }
      } else {
        regularComments.push(reply);
      }
    });

    // Update regex to include detail field
    const titleMatch = cast.text.match(/\[title\](.*?)\n/);
    const descriptionMatch = cast.text.match(/\[description\](.*?)\n/);
    const detailMatch = cast.text.match(/\[detail\](.*?)\n/);
    const typeMatch = cast.text.match(/\[type\](.*?)$/);

    // Transform regular comments as before
    const transformComment = (reply: NeynarCast): TransformedComment => ({
      id: reply.hash,
      author: reply.author.display_name || reply.author.username,
      authorPfp: reply.author.pfp_url,
      authorFid: reply.author.fid,
      text: reply.text,
      timestamp: reply.timestamp,
      likes: reply.reactions.likes_count,
      replies: reply.replies.count,
      nestedReplies: (reply.direct_replies || []).map(transformComment),
    });

    const comments = regularComments.map(transformComment);

    const post = {
      id: cast.hash,
      type: (typeMatch?.[1]?.trim() || "Project") as
        | "Project"
        | "Comment"
        | "Reaction"
        | "Funding",
      title: titleMatch?.[1]?.trim() || "Untitled",
      description: descriptionMatch?.[1]?.trim() || "",
      detail: detailMatch?.[1]?.trim() || "",
      author: cast.author.display_name || cast.author.username,
      authorPfp: cast.author.pfp_url,
      authorFid: cast.author.fid,
      date: new Date(cast.timestamp).toISOString().split("T")[0],
      karma: cast.reactions.likes_count,
      comments: cast.replies.count - curveSubmissions.length,
      tags: [],
      replies: comments,
      curveSubmissions, // Add curve submissions to the response
      // Default curve values if no submissions
      xIntercept: 100000,
      yIntercept: 80,
      middlePoint: { x: 83000, y: 60 },
      color: "hsl(var(--chart-1))",
    };

    return NextResponse.json({ post });
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 },
    );
  }
}
