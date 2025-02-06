import neynarClient from "@/lib/neynarClient";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Received cast request:", body);

    if (!body.signer_uuid) {
      return NextResponse.json(
        {
          error: "signer_uuid is required",
        },
        { status: 400 },
      );
    }

    // Format the text regardless of input source
    const formattedText = `[title] ${body.title}\n[description] ${body.description}\n[detail] ${body.detail}\n[requestedFunding] $${body.requestedFunding}\n[type] ${body.type}`;

    // Publish the cast
    const cast = await neynarClient.publishCast({
      signerUuid: body.signer_uuid,
      text: formattedText,
      parent: "https://antprotocol.vercel.app/frame",
    });

    console.log("Cast published:", cast);

    return NextResponse.json(cast, { status: 200 });
  } catch (error) {
    console.error("Cast creation error:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: error.message,
          details: error.stack,
        },
        { status: 500 },
      );
    }
    return NextResponse.json(
      {
        error: "An unexpected error occurred",
      },
      { status: 500 },
    );
  }
}