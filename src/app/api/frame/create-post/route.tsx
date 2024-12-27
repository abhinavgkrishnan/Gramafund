import { createFrames } from "frames.js/next";

const frames = createFrames();
const appUrl = process.env.HOST || "https://gramafund.vercel.app";

const handler = frames(
  async ({ searchParams }: { searchParams: Record<string, string> }) => {
    const type = searchParams["type"];

    const frame = {
      version: "next",
      imageUrl: `${appUrl}/image.png`,
      button: {
        title: "Post",
        action: {
          type: "post",
          name: "Gramafund Publish",
          url: `${appUrl}/api/frame/publish`,
          splashImageUrl: `${appUrl}/image.png`,
          splashBackgroundColor: "#131313",
        },
      },
      input: {
        text: `Type your ${type?.toLowerCase() || ""} details here...`,
      },
    };

    return new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <meta property="fc:frame" content='${JSON.stringify(frame)}' />
        </head>
      </html>`,
      {
        headers: {
          "Content-Type": "text/html",
        },
      }
    );
  }
);

export const GET = handler;
export const POST = handler;