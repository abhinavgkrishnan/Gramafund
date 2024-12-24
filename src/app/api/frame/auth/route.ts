import { NextResponse, NextRequest } from "next/server";
import { NeynarAPIClient } from "@neynar/nodejs-sdk";

const client = new NeynarAPIClient({ apiKey: process.env.NEYNAR_API_KEY! });

export async function POST(request: NextRequest) {
  try {
    const { messageBytesInHex } = await request.json();

    const validateResponse = await client.validateFrameAction({
      messageBytesInHex,
      // Optional contexts if needed
      castReactionContext: false,
      followContext: false,
      signerContext: false,
      channelFollowContext: false
    });

    return NextResponse.json(validateResponse, { status: 200 });
  } catch (err) {
    console.error("/api/frame/auth error:", err);
    return NextResponse.json(
      { message: "Authentication failed" },
      { status: 500 }
    );
  }
}