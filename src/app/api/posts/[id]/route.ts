import { NextResponse } from "next/server";
import { NeynarAPIClient } from "@neynar/nodejs-sdk";

const client = new NeynarAPIClient({ apiKey: process.env.NEYNAR_API_KEY! });

// Define types for the Neynar API response
interface NeynarAuthor {
  fid: number;
  username: string;
  display_name?: string; // Make display_name optional
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
  authorFid: number;
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const [castResponse, conversationResponse] = await Promise.all([
      client.lookupCastByHashOrWarpcastUrl({
        identifier: params.id,
        type: "hash",
      }) as Promise<NeynarCastResponse>, // Explicitly type the response
      client.lookupCastConversation({
        identifier: params.id,
        type: "hash",
        replyDepth: 5,
      }) as Promise<NeynarConversationResponse>, // Explicitly type the response
    ]);

    const { cast } = castResponse;

    if (!cast) {
      console.error("Cast not found for ID:", params.id);
      return NextResponse.json({ error: "Cast not found" }, { status: 404 });
    }

    console.log("Cast Text:", cast.text);
    const replies = conversationResponse.conversation.cast.direct_replies || [];

    // Extract Gist URL from cast text
    const gistUrlMatch = cast.text.match(
      /Details: (https?:\/\/gist\.github\.com\/\S+)/i,
    );
    if (!gistUrlMatch) {
      console.error("No Gist URL found in cast text:", cast.text);
      return NextResponse.json(
        { error: "No Gist URL found in cast" },
        { status: 400 },
      );
    }

    // Convert Gist HTML URL to raw JSON URL
    const gistHtmlUrl = gistUrlMatch[1];
    const gistId = gistHtmlUrl.split("/").pop(); // Extract the Gist ID
    if (!gistId) {
      console.error("Invalid Gist URL format:", gistHtmlUrl);
      return NextResponse.json(
        { error: "Invalid Gist URL format" },
        { status: 400 },
      );
    }

    const gistRawUrl = `https://gist.githubusercontent.com/abhinavgkrishnan/${gistId}/raw/submission.json`;

    console.log("Extracted Gist URL:", gistHtmlUrl);
    console.log("Converted Raw URL:", gistRawUrl);

    // Fetch Gist data
    const gistResponse = await fetch(gistRawUrl);
    if (!gistResponse.ok) {
      console.error("Gist fetch failed:", {
        status: gistResponse.status,
        statusText: gistResponse.statusText,
        url: gistRawUrl,
      });
      throw new Error(`Failed to fetch Gist: ${gistResponse.statusText}`);
    }

    const gistData = await gistResponse.json();
    console.log("Gist data:", gistData);

    // Validate required fields
    if (
      !gistData.title ||
      !gistData.description ||
      !gistData.requestedFunding
    ) {
      console.error("Invalid Gist data structure:", gistData);
      return NextResponse.json(
        { error: "Invalid Gist data structure" },
        { status: 400 },
      );
    }

    // Process replies (keep your existing curve data and comment processing)
    const curveSubmissions: CurveData[] = [];
    const regularComments: NeynarCast[] = [];

    replies.forEach((reply) => {
      const curveMatch = reply.text.match(/\[curve-data\](.*)/);
      if (curveMatch) {
        try {
          const curveData = JSON.parse(curveMatch[1]);
          curveSubmissions.push({
            ...curveData,
            authorFid: reply.author.fid,
          });
        } catch (e) {
          console.error("Failed to parse curve data:", e);
        }
      } else {
        regularComments.push(reply);
      }
    });

    // Transform comments (keep your existing transform function)
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

    // Split links by new lines and filter out empty strings
    const links = gistData.links
      ? gistData.links.split("\n").filter(Boolean)
      : [];

    // Build post object with Gist data
    const post = {
      id: cast.hash,
      type: gistData.type || "Project",
      title: gistData.title,
      description: gistData.description,
      detail: gistData.detail || "",
      requestedFunding: gistData.requestedFunding,
      links, // Include links as an array
      author: cast.author.display_name || cast.author.username,
      authorPfp: cast.author.pfp_url,
      authorFid: cast.author.fid,
      date: new Date(cast.timestamp).toISOString().split("T")[0],
      karma: cast.reactions.likes_count,
      comments: cast.replies.count - curveSubmissions.length,
      tags: [],
      replies: comments,
      curveSubmissions,
      // Default curve values if no submissions
      xIntercept: 500,
      yIntercept: 80,
      middlePoint: { x: 100, y: 60 },
      color: "hsl(var(--chart-1))",
      // Include additional Gist metadata if needed
      gistUrl: gistHtmlUrl,
      gistData: {
        timestamp: gistData.timestamp,
        // Add other relevant Gist fields
      },
    };

    return NextResponse.json({ post });
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch post",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
