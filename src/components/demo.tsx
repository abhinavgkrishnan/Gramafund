"use client";

import { useEffect, useState } from "react";
import sdk from "@farcaster/frame-sdk";

export default function Demo({ title = "Gramafund" }: { title?: string }) {
  const [isFrame, setIsFrame] = useState(false);
  const [fid, setFid] = useState<number | null>(null);

  useEffect(() => {
    const checkFrame = async () => {
      try {
        const context = await sdk.context;
        if (context?.client?.clientFid) {
          setIsFrame(true);
          setFid(context.client.clientFid);
        }
      } catch (error) {
        console.error("Frame context error:", error);
      }
    };

    checkFrame();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-4">
      <h1 className="text-3xl font-bold">{title}</h1>

      <div className="p-6 bg-card rounded-lg shadow-lg max-w-md w-full space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">
            Gramafund Frame
          </h2>
          {fid && (
            <p className="text-muted-foreground">FID: {fid}</p>
          )}
        </div>

        <div className="border-t pt-4">
          <h3 className="font-medium mb-2">Frame Status:</h3>
          <div className="text-sm text-muted-foreground">
            <p>Frame: {isFrame ? "Active" : "Inactive"}</p>
            {fid && <p>User FID: {fid}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}