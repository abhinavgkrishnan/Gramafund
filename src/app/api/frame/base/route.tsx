import { createFrames, Button } from "frames.js/next";

const frames = createFrames({});

const HOST = process.env.HOST || "http://localhost:3000";

const handleRequest = frames(async () => {
  return {
    image: (
      <div tw="flex items-center justify-center h-full w-full bg-black">
        <p tw="text-white text-6xl flex">Cast from a frame!</p>
      </div>
    ),
    buttons: [
      <Button action="post" key="start" target={`${HOST}/api/frame/start`}>
        Start
      </Button>,
    ],
  };
});

export const GET = handleRequest;
export const POST = handleRequest;
