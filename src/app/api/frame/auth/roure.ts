import { NextResponse, NextRequest } from "next/server";
// import { NeynarAPIClient } from "@neynar/nodejs-sdk";

// const client = new NeynarAPIClient({ apiKey: process.env.NEYNAR_API_KEY! });

export async function POST(request: NextRequest) {
  try {
    const { untrustedData } = await request.json();

    console.log("Frame auth request:", untrustedData); // For debugging

    // For now, just return success with the FID
    return NextResponse.json(
      {
        success: true,
        fid: untrustedData.fid,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("/api/frame/auth error:", err);
    return NextResponse.json(
      { message: "Authentication failed" },
      { status: 500 },
    );
  }
}
