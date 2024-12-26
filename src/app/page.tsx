"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useNeynarContext } from "@neynar/react";
import { NeynarAuthButton, SIWN_variant } from "@neynar/react";

export default function LandingPage() {
  const { user } = useNeynarContext();
  const router = useRouter();

  // Redirect to /posts if user is logged in
  useEffect(() => {
    if (user) {
      router.push("/posts");
    }
  }, [user, router]);

  // If user is logged in, don't show the landing page
  if (user) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="mb-4 text-4xl font-bold">Welcome to GramaFund</h1>
        <p className="mb-8 text-xl text-muted-foreground">
          A platform for effective altruists to collaborate, share projects, and
          maximize impact.
        </p>
        <div className="flex justify-center gap-4">
          <NeynarAuthButton variant={SIWN_variant.WARPCAST} />
        </div>
      </div>
    </div>
  );
}
