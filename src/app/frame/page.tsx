import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const appUrl = process.env.NEXT_PUBLIC_URL || "https://gramafund.vercel.app";

const MAX_TITLE_CHARS = 40;
const MAX_DESCRIPTION_CHARS = 200;
const MAX_DETAIL_CHARS = 750;

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
  postUrl: `${appUrl}/api/frame/cast`,
  input: {
    text: `Title (max ${MAX_TITLE_CHARS} chars)
Description (max ${MAX_DESCRIPTION_CHARS} chars)
Detail (max ${MAX_DETAIL_CHARS} chars)
Type (Project/Comment/Reaction/Funding)`,
    placeholder: "Format: Title\nDescription\nDetail\nType",
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
