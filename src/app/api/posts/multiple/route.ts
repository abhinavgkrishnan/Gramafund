// app/api/posts/multiple/route.ts
import { NextResponse } from "next/server";
import { NeynarAPIClient } from "@neynar/nodejs-sdk";

const client = new NeynarAPIClient({ apiKey: process.env.NEYNAR_API_KEY! });

// Define types for the Neynar API response
interface NeynarAuthor {
  fid: number;
  username: string;
  display_name?: string;
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

interface PostResponse {
  post: {
    id: string;
    type: string;
    title: string;
    description: string;
    detail: string;
    requestedFunding: number;
    links: string[];
    author: string;
    authorPfp: string;
    authorFid: number;
    date: string;
    karma: number;
    comments: number;
    tags: string[];
    replies: TransformedComment[];
    curveSubmissions: CurveData[];
    xIntercept: number;
    yIntercept: number;
    middlePoint: { x: number; y: number };
    color: string;
    gistUrl: string;
    gistData: {
      timestamp: string;
      [key: string]: unknown;
    };
  };
}

interface ErrorResponse {
  error: string;
}

type ProjectResult = PostResponse | ErrorResponse;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get('ids');
    
    if (!idsParam) {
      return NextResponse.json(
        { error: "Project IDs are required" },
        { status: 400 }
      );
    }

    const projectIds = idsParam.split(',');
    const results: Record<string, ProjectResult> = {};
    
    // Fetch each project in parallel
    await Promise.all(projectIds.map(async (id) => {
      try {
        const [castResponse, conversationResponse] = await Promise.all([
          client.lookupCastByHashOrWarpcastUrl({
            identifier: id,
            type: "hash",
          }) as Promise<NeynarCastResponse>,
          client.lookupCastConversation({
            identifier: id,
            type: "hash",
            replyDepth: 5,
          }) as Promise<NeynarConversationResponse>,
        ]);

        const { cast } = castResponse;
        if (!cast) {
          console.error("Cast not found for ID:", id);
          results[id] = { error: "Cast not found" };
          return;
        }

        // Extract Gist URL from cast text
        const gistUrlMatch = cast.text.match(
          /Details: (https?:\/\/gist\.github\.com\/\S+)/i,
        );
        if (!gistUrlMatch) {
          console.error("No Gist URL found in cast text:", cast.text);
          results[id] = { error: "No Gist URL found in cast" };
          return;
        }

        // Convert Gist HTML URL to raw JSON URL
        const gistHtmlUrl = gistUrlMatch[1];
        const gistId = gistHtmlUrl.split("/").pop();
        if (!gistId) {
          console.error("Invalid Gist URL format:", gistHtmlUrl);
          results[id] = { error: "Invalid Gist URL format" };
          return;
        }

        const gistRawUrl = `https://gist.githubusercontent.com/abhinavgkrishnan/${gistId}/raw/submission.json`;
        const gistResponse = await fetch(gistRawUrl);
        if (!gistResponse.ok) {
          console.error("Gist fetch failed:", {
            status: gistResponse.status,
            statusText: gistResponse.statusText,
            url: gistRawUrl,
          });
          results[id] = { error: `Failed to fetch Gist: ${gistResponse.statusText}` };
          return;
        }

        const gistData = await gistResponse.json();
        
        // Process replies and extract curve data
        const replies = conversationResponse.conversation.cast.direct_replies || [];
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

        // Transform comments to the expected format
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

        // Build post object
        results[id] = {
          post: {
            id: cast.hash,
            type: gistData.type || "Project",
            title: gistData.title,
            description: gistData.description,
            detail: gistData.detail || "",
            requestedFunding: gistData.requestedFunding,
            links,
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
            gistUrl: gistHtmlUrl,
            gistData: {
              timestamp: gistData.timestamp,
            },
          }
        };
      } catch (error) {
        console.error(`Error fetching project ${id}:`, error);
        results[id] = { error: "Failed to fetch project data" };
      }
    }));

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error fetching multiple projects:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch projects",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}