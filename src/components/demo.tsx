"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";
import sdk from "@farcaster/frame-sdk";

export default function Demo({ title = "Gramafund" }: { title?: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isFrame, setIsFrame] = useState(false);
  const [signingIn] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    const checkFrameAndAuth = async () => {
      try {
        const context = await sdk.context;
        if (context?.client?.clientFid) {
          setIsFrame(true);
          
          // Create frame data without relying on message property
          const frameData = {
            untrustedData: {
              fid: context.client.clientFid,
              url: window.location.href,
              network: 1,
              buttonIndex: 1,
              inputText: "",
            },
            trustedData: {
              messageBytes: null, // This will be provided by the frame itself
            },
          };

          // Validate the frame interaction
          const response = await fetch('/api/frame', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(frameData),
          });

          if (!response.ok) {
            throw new Error('Frame validation failed');
          }

          // Handle successful validation
          const data = await response.json();
          console.log('Validation successful:', data);
        }
      } catch (error) {
        console.error("Frame auth error:", error);
        toast({
          title: "Authentication Error",
          description: "Failed to authenticate with frame.",
          variant: "destructive",
        });
      }
    };

    checkFrameAndAuth();
  }, [toast]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-4">
      <h1 className="text-3xl font-bold">{title}</h1>

      <div className="p-6 bg-card rounded-lg shadow-lg max-w-md w-full space-y-4">
        <div className="text-center">
          {status === "authenticated" ? (
            <>
              <h2 className="text-xl font-semibold text-green-500 mb-2">
                🎉 Connected to Gramafund
              </h2>
              <p className="text-muted-foreground">FID: {session?.user?.name}</p>
            </>
          ) : (
            <h2 className="text-xl font-semibold text-yellow-500">
              Please connect your account
            </h2>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex flex-col gap-2">
            {status === "authenticated" ? (
              <>
                <Button onClick={() => router.push("/posts")} variant="default">
                  View Posts
                </Button>
                <Button
                  onClick={() => router.push("/posts?openModal=true")}
                  variant="outline"
                >
                  Create Post
                </Button>
              </>
            ) : (
              <Button
                variant="default"
              >
                {signingIn ? "Signing in..." : "Connect Account"}
              </Button>
            )}
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-medium mb-2">Status:</h3>
          <div className="text-sm text-muted-foreground">
            <p>Frame: {isFrame ? "Active" : "Inactive"}</p>
            <p>
              Session:{" "}
              {status === "authenticated" ? "Connected" : "Not connected"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
