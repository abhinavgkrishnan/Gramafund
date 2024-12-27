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

    return new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <meta property="fc:frame" content="next" />
          <meta property="fc:frame:image" content="${appUrl}/image.png" />
          <meta property="fc:frame:button:1" content="Post Again" />
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
  } catch (error) {
    console.error("Error publishing:", error);
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <meta property="fc:frame" content="next" />
          <meta property="fc:frame:image" content="${appUrl}/image.png" />
          <meta property="fc:frame:button:1" content="Try Again" />
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
  }
});

export const GET = handler;
export const POST = handler;
