import { NextResponse, NextRequest } from "next/server";
import { NeynarAPIClient } from "@neynar/nodejs-sdk";

const client = new NeynarAPIClient({ apiKey: process.env.NEYNAR_API_KEY! });

export async function POST(request: NextRequest) {
  try {
    const { untrustedData } = await request.json();
    console.log("Frame auth request:", untrustedData);

    const signerResponse = await client.lookupSigner(untrustedData.fid);
    
    if (!signerResponse) {
      return NextResponse.json(
        { message: "Invalid FID" },
        { status: 400 }
      );
    }

    // This will give us the signer information needed for authentication
    return NextResponse.json({
      success: true,
      fid: untrustedData.fid,
      signer: signerResponse
    }, { status: 200 });

  } catch (err) {
    console.error("/api/frame/auth error:", err);
    return NextResponse.json(
      { message: "Authentication failed" },
      { status: 500 }
    );
  }
}