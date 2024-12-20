import { NextResponse } from "next/server";
import { NeynarAPIClient } from "@neynar/nodejs-sdk";

const client = new NeynarAPIClient({ apiKey: process.env.NEYNAR_API_KEY! });

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const viewerFid = searchParams.get("viewerFid");
    const commentIds = searchParams.get("commentIds")?.split(',');

    if (!viewerFid) {
      return NextResponse.json(
        { error: "Missing viewerFid parameter" },
        { status: 400 }
      );
    }

    // Fetch reactions for main post
    const postReaction = await client.fetchCastReactions({
      hash: params.id,
      types: ["likes"],
      viewerFid: Number(viewerFid),
      limit: 1,
    });

    const hasLiked = postReaction.reactions.some(
      (reaction) => reaction.user.fid === Number(viewerFid)
    );

    // If there are comment IDs, fetch their reactions
    const commentReactions: Record<string, { hasLiked: boolean }> = {};
    
    if (commentIds?.length) {
      await Promise.all(
        commentIds.map(async (commentId) => {
          const reaction = await client.fetchCastReactions({
            hash: commentId,
            types: ["likes"],
            viewerFid: Number(viewerFid),
            limit: 1,
          });
          
          commentReactions[commentId] = {
            hasLiked: reaction.reactions.some(
              (r) => r.user.fid === Number(viewerFid)
            ),
          };
        })
      );
    }

    return NextResponse.json({
      hasLiked,
      reactions: commentReactions,
    });
  } catch (error) {
    console.error("Error fetching reactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch reactions" },
      { status: 500 }
    );
  }
}