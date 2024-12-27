import { createFrames } from "frames.js/next";
import prisma from "@/lib/prisma";
import neynarClient from "@/lib/neynarClient";

const frames = createFrames();
const appUrl = process.env.HOST || "https://gramafund.vercel.app";

const handler = frames(async (ctx) => {
  try {
    const text = ctx.message?.inputText;
    const fid = ctx.message?.requesterFid;

    if (!text || !fid) {
      throw new Error("Missing required information");
    }

    let user = await prisma.user.findUnique({
      where: { fid: String(fid) },
    });

    if (!user) {
      const signer = await neynarClient.createSigner();
      user = await prisma.user.create({
        data: {
          fid: String(fid),
          signerUUID: signer.signer_uuid,
        },
      });
    }

    // Uncomment when ready to publish
    // const cast = await neynarClient.publishCast({
    //   signerUuid: user.signerUUID,
    //   text: text,
    // });

    // Success response
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <meta property="fc:frame" content="next" />
          <meta property="fc:frame:image" content="${appUrl}/image.png" />
          <meta property="fc:frame:button:1" content="Post Another" />
          <meta property="fc:frame:button:1:action" content="post" />
          <meta property="fc:frame:post_url" content="${appUrl}/frame/create" />
        </head>
        <body>
          <h1>Post Created Successfully!</h1>
        </body>
      </html>`,
      {
        headers: {
          "Content-Type": "text/html",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("Error publishing:", error);
    
    // Error response
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <meta property="fc:frame" content="next" />
          <meta property="fc:frame:image" content="${appUrl}/image.png" />
          <meta property="fc:frame:button:1" content="Try Again" />
          <meta property="fc:frame:button:1:action" content="post" />
          <meta property="fc:frame:post_url" content="${appUrl}/frame/create" />
        </head>
        <body>
          <h1>Error Creating Post</h1>
        </body>
      </html>`,
      {
        headers: {
          "Content-Type": "text/html",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      }
    );
  }
});

export const GET = handler;
export const POST = handler;