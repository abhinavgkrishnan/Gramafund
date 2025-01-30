// app/api/cast/route.ts
import { NextRequest, NextResponse } from "next/server";
import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import { createPostApproval } from "@/lib/db";

const client = new NeynarAPIClient({ apiKey: process.env.NEYNAR_API_KEY! });

const CHANNELS = {
  gramafund: "https://gramafund.vercel.app/frame",
} as const;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { signerUuid, title, description, detail, type, channel } = body;

    // Validate required fields
    if (!signerUuid || !title || !description || !detail || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const formattedText = `[title] ${title}\n[description] ${description}\n[detail] ${detail}\n[type] ${type}`;

    // Get signer info first to get FID
    const signer = await client.lookupSigner({ signerUuid });
    
    if (!signer.fid) {
      return NextResponse.json(
        { error: "Could not retrieve signer FID" },
        { status: 400 }
      );
    }

    // Post to Farcaster
    const castResponse = await client.publishCast({
      signerUuid,
      text: formattedText,
      parent: CHANNELS[channel as keyof typeof CHANNELS],
    });
    
    // Store in approval system using FID from signer
    await createPostApproval(
      castResponse.cast.hash,
      title,
      description,
      type,
      signer.fid.toString()
    );

    return NextResponse.json(
      { 
        message: "Cast submitted for approval", 
        data: { 
          cast: castResponse.cast,
          postHash: castResponse.cast.hash
        } 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing cast:", error);
    return NextResponse.json(
      { 
        error: "Failed to process cast",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}