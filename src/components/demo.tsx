"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useNeynarContext } from "@neynar/react";

export default function Demo({ title = "Gramafund" }: { title?: string }) {
  const router = useRouter();
  const { user } = useNeynarContext();
  const [isFrame, setIsFrame] = useState(false);
  const [fid, setFid] = useState<number | null>(null);

  useEffect(() => {
    const checkFrame = async () => {
      try {
        const frameSDK = (await import("@farcaster/frame-sdk")).default;
        const context = await frameSDK.context;

        if (context?.client.clientFid) {
          setIsFrame(true);
          setFid(context.client.clientFid);
        }
      } catch (error) {
        console.error("Frame check error:", error);
      }
    };

    checkFrame();
  }, []);

  const handleViewPosts = () => {
    router.push("/posts");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-4">
      <h1 className="text-3xl font-bold">{title}</h1>

      <div className="p-6 bg-card rounded-lg shadow-lg max-w-md w-full space-y-4">
        <div className="text-center">
          {isFrame ? (
            <>
              <h2 className="text-xl font-semibold text-green-500 mb-2">
                🎉 Connected to Gramafund
              </h2>
              <p className="text-muted-foreground">FID: {fid}</p>
            </>
          ) : (
            <h2 className="text-xl font-semibold text-yellow-500">
              Welcome to Gramafund
            </h2>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex flex-col gap-2">
            <Button onClick={handleViewPosts} variant="default">
              View Posts
            </Button>
            {user && (
              <Button
                onClick={() => router.push("/posts?openModal=true")}
                variant="outline"
              >
                Create Post
              </Button>
            )}
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-medium mb-2">Status:</h3>
          <div className="text-sm text-muted-foreground">
            <p>Frame: {isFrame ? "Active" : "Inactive"}</p>
            <p>User: {user ? `Connected (${user.fid})` : "Not connected"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}