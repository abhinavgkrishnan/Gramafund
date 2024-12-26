import neynarClient from "@/lib/neynarClient";
import prisma from "@/lib/prisma";
import { createFrames, Button } from "frames.js/next";

const frames = createFrames({});

const HOST = process.env.HOST || "http://localhost:3000";

const handleRequest = frames(async (payload) => {
  try {
    const text = payload.message?.inputText;
    const fid = payload.message?.requesterFid;

    const user = await prisma.user.findUnique({
      where: {
        fid: String(fid),
      },
    });

    if (!user) {
      return {
        image: (
          <div style={{ color: "white", display: "flex", fontSize: 60 }}>
            User not found!
          </div>
        ),
        buttons: [
          <Button action="link" key="login" target={HOST}>
            Sign in
          </Button>,
        ],
      };
    }

    // Updated to use object parameter
    const cast = await neynarClient.publishCast({
      signerUuid: user.signerUUID,
      text: text || "gm",
      // Optional parameters:
      // embeds: [],
      // parent: parentCastHash,
      // channelId: someChannelId,
    });

    return {
      image: (
        <div tw="flex items-center justify-center h-full w-full bg-black">
          <div tw="text-white text-6xl flex">
            Casted successfully! 🎉
            {cast.cast.hash}
          </div>
        </div>
      ),
    };
  } catch (error) {
    console.error('Error publishing cast:', error);
    return {
      image: (
        <div style={{ color: "white", display: "flex", fontSize: 60 }}>
          Error publishing cast!
        </div>
      ),
    };
  }
});

export const GET = handleRequest;
export const POST = handleRequest;