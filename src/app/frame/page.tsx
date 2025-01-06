import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const appUrl = process.env.NEXT_PUBLIC_URL || "https://gramafund.vercel.app";

const frame = {
  version: "next",
  imageUrl: `${appUrl}/image.png`,
  button: {
    title: "Launch Gramafund",
    action: {
      type: "launch_frame",
      name: "Gramafund",
      url: `${appUrl}/frame`,
      splashImageUrl: `${appUrl}/image.png`,
      splashBackgroundColor: "#131313",
    },
  },
};

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Gramafund",
    openGraph: {
      title: "Gramafund",
      description: "Connect with Gramafund",
      images: [`${appUrl}/image.png`],
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

export default function FramePage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Button asChild>
        <Link href="/posts">View Posts</Link>
      </Button>
    </div>
  );
}
