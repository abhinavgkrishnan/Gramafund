import { createFrames } from "frames.js/next";

const frames = createFrames();
const HOST = process.env.HOST || "https://gramafund.vercel.app";

const POST_TYPES = ["Project", "Comment", "Reaction", "Funding"];

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
        <div style={{ fontSize: "48px" }}>Select Post Type</div>
      </div>
    ),
    buttons: POST_TYPES.map((type) => ({
      label: type,
      action: "post" as const,
      target: `${HOST}/api/frame/create-post?type=${type}`,
    })),
  };
});

export const GET = handler;
export const POST = handler;
