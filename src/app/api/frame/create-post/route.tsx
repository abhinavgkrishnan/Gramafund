import { createFrames } from "frames.js/next";

const frames = createFrames();
const HOST = process.env.HOST || "https://gramafund.vercel.app";

const handler = frames(
  async ({ searchParams }: { searchParams: Record<string, string> }) => {
    const type = searchParams["type"];

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
            <div style={{ fontSize: "48px" }}>Create {type}</div>
            <div style={{ fontSize: "24px", marginTop: "20px" }}>
              Enter your post content
            </div>
          </div>
        </div>
      ),
      buttons: [
        {
          label: "Post",
          action: "post" as const,
          target: `${HOST}/api/frame/publish`,
        },
      ],
      input: {
        text: `Type your ${type?.toLowerCase() || ""} details here...`,
      },
    };
  },
);

export const GET = handler;
export const POST = handler;
