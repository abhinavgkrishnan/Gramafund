import { NextResponse } from "next/server";
import { NeynarAPIClient } from "@neynar/nodejs-sdk";

const client = new NeynarAPIClient({ apiKey: process.env.NEYNAR_API_KEY! });

interface CurveData {
  xIntercept: number;
  yIntercept: number;
  middlePoint: { x: number; y: number };
}

export async function POST(request: Request) {
  try {
    const { signerUuid, text, parentHash, curveData } = await request.json();
    
    if (!signerUuid || !parentHash) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // If submitting curve data
    if (curveData) {
      // Type check curve data
      const curveDataTyped = curveData as CurveData;
      if (
        typeof curveDataTyped.xIntercept !== 'number' ||
        typeof curveDataTyped.yIntercept !== 'number' ||
        typeof curveDataTyped.middlePoint?.x !== 'number' ||
        typeof curveDataTyped.middlePoint?.y !== 'number'
      ) {
        return NextResponse.json(
          { error: "Invalid curve data format" },
          { status: 400 }
        );
      }

      // First get the user's FID
      const signer = await client.lookupSigner({ signerUuid });
      const userFid = signer.fid;

      console.log('User FID:', userFid); // Debug log

      // Fetch conversation to check for existing curves
      const conversation = await client.lookupCastConversation({
        identifier: parentHash,
        type: "hash",
        replyDepth: 1,
      });

      const replies = conversation.conversation.cast.direct_replies || [];

      // Debug log all curve submissions
      const curveSubmissions = replies.filter(reply => reply.text.startsWith('[curve-data]'));
      console.log('Curve submissions:', curveSubmissions.map(r => ({ 
        authorFid: r.author.fid,
        text: r.text 
      })));

      // Check if user has already submitted a curve
      const hasExistingCurve = curveSubmissions.some(reply => 
        reply.author.fid === userFid
      );

      console.log('Has existing curve:', hasExistingCurve); // Debug log

      if (hasExistingCurve) {
        return NextResponse.json(
          { error: "You have already submitted a curve for this Project" },
          { status: 400 }
        );
      }

      // Submit curve data
      const finalText = `[curve-data]${JSON.stringify(curveData)}`;
      const response = await client.publishCast({
        signerUuid,
        text: finalText,
        parent: parentHash,
      });

      return NextResponse.json({ success: true, data: response });
    }

    // If regular text comment
    if (!text?.trim()) {
      return NextResponse.json(
        { error: "Comment text is required" },
        { status: 400 }
      );
    }

    const response = await client.publishCast({
      signerUuid,
      text,
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