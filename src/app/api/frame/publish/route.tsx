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

    const successFrame = {
      version: "next",
      imageUrl: `${appUrl}/image.png`,
      button: {
        title: "Cast Again",
        action: {
          type: "post",
          name: "Gramafund New Post",
          url: `${appUrl}/frame`,
          splashImageUrl: `${appUrl}/image.png`,
          splashBackgroundColor: "#131313",
        },
      },
    };

    return new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <meta property="fc:frame" content='${JSON.stringify(successFrame)}' />
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

    const errorFrame = {
      version: "next",
      imageUrl: `${appUrl}/image.png`,
      button: {
        title: "Try Again",
        action: {
          type: "post",
          name: "Gramafund Retry",
          url: `${appUrl}/frame`,
          splashImageUrl: `${appUrl}/image.png`,
          splashBackgroundColor: "#131313",
        },
      },
    };

    return new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <meta property="fc:frame" content='${JSON.stringify(errorFrame)}' />
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
