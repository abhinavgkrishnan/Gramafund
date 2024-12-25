import { NextRequest, NextResponse } from "next/server";
import { isApiErrorResponse } from "@neynar/nodejs-sdk";
import neynarClient from "@/lib/neynarClient";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const { signerUuid, fid } = (await request.json()) as {
    signerUuid: string;
    fid: string;
  };

  try {
    const { fid: userFid } = await neynarClient.lookupSigner({ signerUuid: signerUuid });

    if (!userFid) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    console.log(fid, userFid);

    if (String(fid) !== String(userFid)) {
      console.log("Invalid user data");

      return NextResponse.json(
        { message: "Invalid user data" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        fid: String(userFid),
      },
    });

    if (!user) {
      await prisma.user.create({
        data: {
          signerUUID: signerUuid,
          fid: String(userFid),
        },
      });
    }

    return NextResponse.json({ message: "User added" }, { status: 200 });
  } catch (err) {
    if (isApiErrorResponse(err)) {
      return NextResponse.json(
        { ...err.response.data },
        { status: err.response.status }
      );
    } else
      return NextResponse.json(
        { message: "Something went wrong" },
        { status: 500 }
      );
  }
}