import { NextRequest, NextResponse } from "next/server";
import { NeynarAPIClient, isApiErrorResponse } from "@neynar/nodejs-sdk";

const client = new NeynarAPIClient({ apiKey: process.env.NEYNAR_API_KEY! });

const CHANNELS = {
  memes: "chain://eip155:1/erc721:0xfd8427165df67df6d7fd689ae67c8ebf56d9ca61",
  test: "https://gramafund.xyz",
} as const;

export async function POST(request: NextRequest) {
  console.log('API Key:', process.env.NEYNAR_API_KEY?.slice(0, 5) + '...'); // Log first few chars of API key

  try {
    const body = await request.json();
    console.log('Received request body:', body);

    const { signerUuid, text, channel } = body as {
      signerUuid: string;
      text: string;
      channel: keyof typeof CHANNELS;
    };

    console.log('Attempting to publish cast with:', {
      signerUuid,
      text,
      parent: CHANNELS[channel],
    });

    const response = await client.publishCast({
      signerUuid,
      text,
      parent: CHANNELS[channel],
    });
    
    console.log('Cast response:', response);

    return NextResponse.json(
      { message: "Cast published successfully", data: response },
      { status: 200 }
    );
  } catch (err) {
    console.error('Detailed error:', err);

    if (isApiErrorResponse(err)) {
      console.error('Neynar API error response:', {
        status: err.response?.status,
        data: err.response?.data,
      });
      
      return NextResponse.json(
        { 
          message: err.response?.data?.message || "Failed to publish cast",
          error: err.response?.data 
        },
        { status: err.response?.status || 500 }
      );
    }

    return NextResponse.json(
      { 
        message: "Something went wrong",
        error: err instanceof Error ? err.message : String(err)
      },
      { status: 500 }
    );
  }
}