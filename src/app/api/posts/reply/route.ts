import { NextResponse } from "next/server";
import { NeynarAPIClient } from "@neynar/nodejs-sdk";

const client = new NeynarAPIClient({ apiKey: process.env.NEYNAR_API_KEY! });

export async function POST(request: Request) {
  try {
    const { signerUuid, text, parentHash } = await request.json();

    if (!signerUuid || !text || !parentHash) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const response = await client.publishCast({
      signerUuid: signerUuid,
      text: text,
      parent: parentHash,
    });

    return NextResponse.json({ success: true, data: response });
  } catch (error) {
    console.error("Error posting reply:", error);
    return NextResponse.json(
      { error: "Failed to post reply" },
      { status: 500 }
    );
  }
}