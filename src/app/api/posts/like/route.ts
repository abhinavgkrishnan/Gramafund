import { NextResponse } from "next/server";
import { NeynarAPIClient } from "@neynar/nodejs-sdk";

const client = new NeynarAPIClient({ apiKey: process.env.NEYNAR_API_KEY! });

export async function POST(request: Request) {
  try {
    const { signerUuid, hash, targetAuthorFid } = await request.json();

    if (!signerUuid || !hash) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const response = await client.publishReaction({
      signerUuid,
      reactionType: "like",
      target: hash,
      targetAuthorFid // Optional, but recommended if available
    });

    return NextResponse.json({ success: true, data: response });
  } catch (error) {
    console.error("Error liking post:", error);
    return NextResponse.json(
      { error: "Failed to like post" },
      { status: 500 }
    );
  }
}