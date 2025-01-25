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
        { status: 400 },
      );
    }

    // Type check curveData if present
    if (curveData) {
      const curveDataTyped = curveData as CurveData;
      if (
        typeof curveDataTyped.xIntercept !== 'number' ||
        typeof curveDataTyped.yIntercept !== 'number' ||
        typeof curveDataTyped.middlePoint?.x !== 'number' ||
        typeof curveDataTyped.middlePoint?.y !== 'number'
      ) {
        return NextResponse.json(
          { error: "Invalid curve data format" },
          { status: 400 },
        );
      }
    }

    // If text is not provided but curveData is, or if both are provided
    let finalText = text;
    if (curveData) {
      finalText = `[curve-data]${JSON.stringify(curveData)}`;
    } else if (!text) {
      return NextResponse.json(
        { error: "Either text or curve data must be provided" },
        { status: 400 },
      );
    }

    const response = await client.publishCast({
      signerUuid: signerUuid,
      text: finalText,
      parent: parentHash,
    });

    return NextResponse.json({ success: true, data: response });
  } catch (error) {
    console.error("Error posting reply:", error);
    return NextResponse.json(
      { error: "Failed to post reply" },
      { status: 500 },
    );
  }
}