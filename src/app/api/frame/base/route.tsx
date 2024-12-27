import { createFrames } from "frames.js/next";

const frames = createFrames();
const appUrl = process.env.HOST || "https://gramafund.vercel.app";

const handler = frames(async () => {
  return new Response(
    `<!DOCTYPE html>
    <html>
      <head>
        <meta property="fc:frame" content="next" />
        <meta property="fc:frame:image" content="${appUrl}/image.png" />
        <meta property="fc:frame:button:1" content="Start Posting" />
        <meta property="fc:frame:button:1:action" content="post" />
        <meta property="fc:frame:post_url" content="${appUrl}/api/frame/create-post" />
      </head>
    </html>`,
    {
      headers: {
        "Content-Type": "text/html",
      },
    },
  );
});

export const GET = handler;
export const POST = handler;
