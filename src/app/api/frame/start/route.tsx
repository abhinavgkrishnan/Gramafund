import prisma from "@/lib/prisma";
import { createFrames, Button } from "frames.js/next";

const frames = createFrames({});

const HOST = process.env.HOST || "http://localhost:3000";

const handleRequest = frames(async (payload) => {
  const fid = payload.message?.requesterFid;
  const user = await prisma.user.findUnique({
    where: {
      fid: String(fid),
    },
  });

  if (!user) {
    return {
      image: (
        <div tw="flex items-center justify-center h-full w-full bg-black">
          <p tw="text-white text-6xl">User not found!</p>
        </div>
      ),
      buttons: [
        <Button action="link" key="login" target={`${HOST}`}>
          Sign in
        </Button>,
      ],
    };
  }

  return {
    image: (
      <div tw="flex items-center justify-center h-full w-full bg-black">
        <p tw="text-white text-6xl">Cast from a frame!</p>
      </div>
    ),
    buttons: [
      <Button action="post" key="login" target={`${HOST}/api/frame/publish`}>
        Cast
      </Button>,
    ],
    textInput: "Text to cast...",
  };
});

export const GET = handleRequest;
export const POST = handleRequest;

