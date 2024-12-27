import { createFrames } from "frames.js/next";

const frames = createFrames();
const appUrl = process.env.HOST || "https://gramafund.vercel.app";

const handler = frames(async (ctx) => {
  // Enhanced debugging
  console.log("Base route hit:", {
    method: ctx.method,
    url: appUrl,
    requestData: ctx.message, // Will show FID and other frame data if available
  });

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
      <body>
        <h1>Gramafund Post</h1>
      </body>
    </html>`,
    {
      headers: {
        "Content-Type": "text/html",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    }
  );
});

export const GET = handler;
export const POST = handler;