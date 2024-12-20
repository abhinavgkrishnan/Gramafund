import { NextRequest, NextResponse } from "next/server";
import { NeynarAPIClient, isApiErrorResponse } from "@neynar/nodejs-sdk";

const client = new NeynarAPIClient({ apiKey: process.env.NEYNAR_API_KEY! });

const CHANNELS = {
  gramafund: "https://gramafund.vercel.app",
} as const;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Received request body:", body);
    
    const { signerUuid, title, description, type, channel } = body as {
      signerUuid: string;
      title: string;
      description: string;
      type: "Project" | "Comment" | "Reaction" | "Funding";
      channel: keyof typeof CHANNELS;
    };
    
    // Format the text
    const formattedText = `[title] ${title}\n[description] ${description}\n[type] ${type}`;
    
    const response = await client.publishCast({
      signerUuid,
      text: formattedText,
      parent: CHANNELS[channel],
    });
    
    console.log("Cast response:", response);
    
    return NextResponse.json(
      { message: "Cast published successfully", data: response },
      { status: 200 }
    );
  } catch (err) {
    console.error("Detailed error:", err);

    if (isApiErrorResponse(err)) {
      console.error("Neynar API error response:", {
        status: err.response?.status,
        data: err.response?.data,
      });

      return NextResponse.json(
        {
          message: err.response?.data?.message || "Failed to publish cast",
          error: err.response?.data,
        },
        { status: err.response?.status || 500 },
      );
    }

    return NextResponse.json(
      {
        message: "Something went wrong",
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}
