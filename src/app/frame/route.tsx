import { createFrames, Button } from "frames.js/next";

const frames = createFrames({});

const HOST = process.env.HOST || "http://localhost:3000";

const handleRequest = frames(async () => {
  return {
    image: (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          backgroundColor: "black",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p style={{ color: "white", fontSize: "60px" }}>Cast from a frame!</p>
      </div>
    ),
    buttons: [
      <Button action="post" key="start" target={`${HOST}/frame/start`}>
        Start
      </Button>,
    ],
  };
});

export const GET = handleRequest;
export const POST = handleRequest;