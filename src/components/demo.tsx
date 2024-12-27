"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { signIn, getCsrfToken, signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import sdk from "@farcaster/frame-sdk";
import { SignIn as SignInCore } from "@farcaster/frame-core";

export default function Demo({ title = "Gramafund" }: { title?: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isFrame, setIsFrame] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const { data: session, status } = useSession();

  const getNonce = useCallback(async () => {
    const nonce = await getCsrfToken();
    if (!nonce) throw new Error("Unable to generate nonce");
    return nonce;
  }, []);

  const handleSignIn = useCallback(async () => {
    try {
      setSigningIn(true);
      const nonce = await getNonce();
      console.log("Got nonce:", nonce);

      // Check if we're in a Frame context
      const context = await sdk.context;
      if (!context?.client?.clientFid) {
        throw new Error("Not in a Frame context or Frame not connected");
      }

      // Try to sign in with Frame SDK - remove the domain option
      const result = await sdk.actions.signIn({ nonce });

      if (!result?.message || !result?.signature) {
        throw new Error("Failed to get signature from Frame");
      }

      console.log("Frame sign-in result:", result);

      const signInResponse = await signIn("credentials", {
        message: result.message,
        signature: result.signature,
        redirect: false,
        callbackUrl: "/",
      });

      if (signInResponse?.error) {
        throw new Error(signInResponse.error);
      }

      toast({
        title: "Success",
        description: "Successfully signed in with Farcaster",
      });
    } catch (error: unknown) {
      console.error("Sign-in error:", error);

      let errorMessage = "An unknown error occurred";

      if (error instanceof SignInCore.RejectedByUser) {
        errorMessage = "Rejected by user";
      } else if (error instanceof Error) {
        if (error.message.includes("Frame not connected")) {
          errorMessage =
            "Please open this page in Warpcast or a compatible Frame app";
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: "Sign-in Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSigningIn(false);
    }
  }, [getNonce, toast]);

  const handleSignOut = useCallback(async () => {
    await signOut({ redirect: false });
    toast({
      title: "Signed Out",
      description: "Successfully signed out",
    });
  }, [toast]);

  useEffect(() => {
    const checkFrameAndAuth = async () => {
      try {
        const context = await sdk.context;
        if (context?.client?.clientFid) {
          setIsFrame(true);
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
              <p className="text-muted-foreground">FID: {session?.user?.fid}</p>
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
                <Button onClick={handleSignOut} variant="destructive">
                  Sign Out
                </Button>
              </>
            ) : (
              <Button
                onClick={handleSignIn}
                disabled={signingIn}
                variant="default"
                className="w-full"
              >
                {signingIn ? "Signing in..." : "Sign in with Farcaster"}
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