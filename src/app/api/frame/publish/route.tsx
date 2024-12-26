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

    // Find user with their signer
    const user = await prisma.user.findUnique({
      where: { fid: String(fid) },
    });

    if (!user) {
      // Create new signer if user doesn't exist
      const signer = await neynarClient.createSigner();

      await prisma.user.create({
        data: {
          fid: String(fid),
          signerUUID: signer.signer_uuid,
        },
      });

      // Use the new signer
      const response = await neynarClient.publishCast({
        signerUuid: signer.signer_uuid,
        text: text,
        parent: `${HOST}/frame`,
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
              <div style={{ fontSize: "48px" }}>Posted Successfully! 🎉</div>
              <div style={{ fontSize: "24px", marginTop: "20px" }}>
                {response.cast.hash}
              </div>
            </div>
          </div>
        ),
        buttons: [
          {
            label: "Create Another",
            action: "post" as const,
            target: `${HOST}/api/frame/base`,
          },
        ],
      };
    }

    // Use existing signer
    const response = await neynarClient.publishCast({
      signerUuid: user.signerUUID,
      text: text,
      parent: `${HOST}/frame`,
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
            <div style={{ fontSize: "48px" }}>Posted Successfully! 🎉</div>
            <div style={{ fontSize: "24px", marginTop: "20px" }}>
              {response.cast.hash}
            </div>
          </div>
        </div>
      ),
      buttons: [
        {
          label: "Create Another",
          action: "post" as const,
          target: `${HOST}/api/frame/base`,
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
          <div style={{ fontSize: "48px" }}>Error Publishing Post</div>
        </div>
      ),
      buttons: [
        {
          label: "Try Again",
          action: "post" as const,
          target: `${HOST}/api/frame/base`,
        },
      ],
    };
  }
});

export const GET = handler;
export const POST = handler;
