import { Metadata } from "next";

const appUrl = process.env.HOST || "https://gramafund.vercel.app";

const frame = {
  version: "next",
  imageUrl: `${appUrl}/image.png`,
  button: {
    title: "Launch Gramafund",
    action: {
      type: "launch_frame",
      name: "Gramafund",
      url: `${appUrl}/api/frame/base`, // Point directly to base route
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
      description: "Create a post on Gramafund",
      images: [`${appUrl}/image.png`],
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

export default function FramePage() {
  // Return minimal UI or nothing
  return null;
}