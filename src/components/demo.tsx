"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useNeynarContext } from "@neynar/react";
import { useToast } from "@/hooks/use-toast";

export default function Demo({ title = "Gramafund" }: { title?: string }) {
  const router = useRouter();
  const { isAuthenticated, user } = useNeynarContext();
  const { toast } = useToast();
  const [isFrame, setIsFrame] = useState(false);

  useEffect(() => {
    const checkFrameAndAuth = async () => {
      try {
        const frameSDK = await import('@farcaster/frame-sdk');
        const context = await frameSDK.default.context;
        
        if (context?.client?.clientFid) {
          setIsFrame(true);
          
          const response = await fetch('/api/frame/auth', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              untrustedData: {
                fid: context.client.clientFid,
                url: window.location.href,
                buttonIndex: 1,
                inputText: ""
              }
            }),
          });
  
          if (!response.ok) {
            throw new Error('Frame authentication failed');
          }

          const data = await response.json();
          
          if (data.success) {
            toast({
              title: "Authentication Successful",
              description: "You're now connected to Gramafund!",
            });
          } else {
            throw new Error('Authentication failed');
          }
        }
      } catch (error) {
        console.error('Frame auth error:', error);
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
          {isAuthenticated ? (
            <>
              <h2 className="text-xl font-semibold text-green-500 mb-2">
                🎉 Connected to Gramafund
              </h2>
              <p className="text-muted-foreground">FID: {user?.fid}</p>
            </>
          ) : (
            <h2 className="text-xl font-semibold text-yellow-500">
              {isFrame ? "Connecting..." : "Please connect your account"}
            </h2>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex flex-col gap-2">
            {isAuthenticated ? (
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
              !isFrame && (
                <Button 
                  data-action="post"
                  variant="default"
                  className="w-full"
                >
                  Connect Account
                </Button>
              )
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