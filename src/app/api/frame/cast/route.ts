import neynarClient from "@/lib/neynarClient";
import { NextResponse } from "next/server";

const POST_TYPES = ["Project", "Comment", "Reaction", "Funding"] as const;
type PostType = (typeof POST_TYPES)[number];

interface FrameRequest {
  untrustedData: {
    inputText: string;
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json() as FrameRequest;
    const inputLines = body.untrustedData.inputText.split('\n').map((line: string) => line.trim());
    
    if (inputLines.length !== 4) {
      return NextResponse.json({ error: "Invalid input format" }, { status: 400 });
    }

    const [title, description, detail, type] = inputLines;

    // Validate input
    if (!title || !description || !detail || !POST_TYPES.includes(type as PostType)) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // Get signer
    const signerResponse = await fetch(`${process.env.HOST}/api/frame/signer`, {
      method: 'POST',
    });
    const signer = await signerResponse.json();

    // Format text similar to modal
    const formattedText = `[title] ${title}\n[description] ${description}\n[detail] ${detail}\n[type] ${type}`;

    const cast = await neynarClient.publishCast({
      signerUuid: signer.signer_uuid,
      text: formattedText
    });

    return NextResponse.json(cast, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}