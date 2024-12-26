import { createFrames } from "frames.js/next";
import prisma from "@/lib/prisma";
import neynarClient from "@/lib/neynarClient";

const frames = createFrames();
const HOST = process.env.HOST || "https://gramafund.vercel.app";

const handler = frames(async (ctx) => {
  try {
    const text = ctx.message?.inputText;
    const fid = ctx.message?.requesterFid;

    if (!text || !fid) {
      throw new Error("Missing required information");
    }

    // Find or create user with their signer
    let user = await prisma.user.findUnique({
      where: { fid: String(fid) },
    });

    if (!user) {
      // Create new signer if user doesn't exist
      const signer = await neynarClient.createSigner();

      user = await prisma.user.create({
        data: {
          fid: String(fid),
          signerUUID: signer.signer_uuid,
        },
      });
    }

    // Publish cast with user's signer
    const cast = await neynarClient.publishCast({
      signerUuid: user.signerUUID,
      text: text,
    });

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
            <div style={{ fontSize: "48px" }}>Cast Success! 🎉</div>
            <div style={{ fontSize: "24px", marginTop: "20px" }}>
              {cast.cast.hash}
            </div>
          </div>
        </div>
      ),
      buttons: [
        {
          label: "Cast Again",
          action: "post" as const,
          target: `${HOST}/frame`,
        },
      ],
    };
  } catch (error) {
    console.error("Error publishing:", error);
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
          <div style={{ fontSize: "48px" }}>Error Publishing Cast</div>
        </div>
      ),
      buttons: [
        {
          label: "Try Again",
          action: "post" as const,
          target: `${HOST}/frame`,
        },
      ],
    };
  }
});

export const GET = handler;
export const POST = handler;
