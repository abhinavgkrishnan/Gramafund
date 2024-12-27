import { createFrames } from "frames.js/next";

const frames = createFrames();
const appUrl = process.env.HOST || "https://gramafund.vercel.app";

const handler = frames(async () => {
  const frame = {
    version: "next",
    imageUrl: `${appUrl}/image.png`,
    button: {
      title: "Start Posting",
      action: {
        type: "post",
        name: "Gramafund Post Type",
        url: `${appUrl}/api/frame/post-type`,
        splashImageUrl: `${appUrl}/image.png`,
        splashBackgroundColor: "#131313",
      },
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
    },
  );
});

export const GET = handler;
export const POST = handler;
