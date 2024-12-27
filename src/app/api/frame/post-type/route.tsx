import { createFrames } from "frames.js/next";

const frames = createFrames();
const appUrl = process.env.HOST || "https://gramafund.vercel.app";

const POST_TYPES = ["Project", "Comment", "Reaction", "Funding"];

const handler = frames(async () => {
  const frame = {
    version: "next",
    imageUrl: `${appUrl}/image.png`,
    buttons: POST_TYPES.map((type) => ({
      title: type,
      action: {
        type: "post",
        name: `Gramafund ${type}`,
        url: `${appUrl}/api/frame/create-post?type=${type}`,
        splashImageUrl: `${appUrl}/image.png`,
        splashBackgroundColor: "#131313",
      },
    })),
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
