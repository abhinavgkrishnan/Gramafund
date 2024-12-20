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

    if (!viewerFid) {
      return NextResponse.json(
        { error: "Missing viewerFid parameter" },
        { status: 400 }
      );
    }

    const response = await client.fetchCastReactions({
      hash: params.id,
      types: ["likes"],
      viewerFid: Number(viewerFid),
      limit: 1, // We only need to check if the user has liked it
    });

    const hasLiked = response.reactions.some(
      (reaction) => reaction.user.fid === Number(viewerFid)
    );

    return NextResponse.json({ hasLiked });
  } catch (error) {
    console.error("Error fetching reactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch reactions" },
      { status: 500 }
    );
  }
}