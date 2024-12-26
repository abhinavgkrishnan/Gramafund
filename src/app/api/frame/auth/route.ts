import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import neynarClient from "@/lib/neynarClient";

export async function POST(request: Request) {
  try {
    const { fid } = await request.json();

    // Try to find existing user
    let user = await prisma.user.findUnique({
      where: { fid: String(fid) },
    });

    if (!user) {
      // Create new signer if user doesn't exist
      const signer = await neynarClient.createSigner();
      
      user = await prisma.user.create({
        data: {
          fid: String(fid),
          signerUUID: signer.signer_uuid,
        },
      });
    }

    return NextResponse.json({ signerUuid: user.signerUUID });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Failed to authenticate' },
      { status: 500 }
    );
  }
}