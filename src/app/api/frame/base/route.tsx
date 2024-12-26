import { createFrames } from "frames.js/next";

const frames = createFrames();
const HOST = process.env.HOST || "https://gramafund.vercel.app";

const handler = frames(async () => {
  return {
    image: (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          backgroundColor: "black",
          color: "white",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "48px" }}>Create a Post</div>
          <div style={{ fontSize: "24px", marginTop: "20px" }}>
            Project • Comment • Reaction • Funding
          </div>
        </div>
      </div>
    ),
    buttons: [
      {
        label: "Start Posting",
        action: "post" as const,
        target: `${HOST}/api/frame/post-type`,
      },
    ],
  };
});

export const GET = handler;
export const POST = handler;
