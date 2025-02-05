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
    const { signerUuid, title, description, detail, type, channel, requestedFunding, links } = body;

    // Validate required fields
    if (!signerUuid || !title || !description || !detail || !type || requestedFunding === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate requestedFunding
    if (typeof requestedFunding !== "number" || requestedFunding <= 0) {
      return NextResponse.json(
        { error: "Requested funding must be a number greater than 0" },
        { status: 400 }
      );
    }

    // Create GitHub Gist
    const gistData = {
      description: `Gramafund Submission: ${title}`,
      public: true,
      files: {
        'submission.json': {
          content: JSON.stringify({
            title,
            description,
            detail,
            type,
            requestedFunding,
            links, // Include links if provided
            timestamp: new Date().toISOString()
          }, null, 2)
        }
      }
    };

    const gistResponse = await fetch('https://api.github.com/gists', {
      method: 'POST',
      headers: {
        'Authorization': `token ${process.env.GITHUB_TOKEN}`,
        'User-Agent': 'Gramafund/1.0.0',
        'Accept': 'application/vnd.github.v3+json'
      },
      body: JSON.stringify(gistData)
    });

    if (!gistResponse.ok) {
      const error = await gistResponse.json();
      throw new Error(`GitHub API error: ${error.message}`);
    }

    const gist = await gistResponse.json();
    const gistUrl = gist.html_url;

    // Get signer info for FID
    const signer = await client.lookupSigner({ signerUuid });
    if (!signer.fid) {
      return NextResponse.json(
        { error: "Could not retrieve signer FID" },
        { status: 400 }
      );
    }

    // Create cast with gist link
    const castText = `New Project Submission: "${title}"\nRequested: $${requestedFunding}\nDetails: ${gistUrl}`;
    
    const castResponse = await client.publishCast({
      signerUuid,
      text: castText,
      parent: CHANNELS[channel as keyof typeof CHANNELS],
    });

    // Store in database with both cast and gist references
    await createPostApproval(
      castResponse.cast.hash,
      title,
      description,
      type,
      requestedFunding,
      signer.fid.toString(),
      gistUrl,  // Store gist URL
    );

    return NextResponse.json(
      { 
        message: "Cast submitted for approval", 
        data: { 
          cast: castResponse.cast,
          postHash: castResponse.cast.hash,
          gistUrl: gistUrl
        } 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing submission:", error);
    return NextResponse.json(
      { 
        error: "Failed to process submission",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}