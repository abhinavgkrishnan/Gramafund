import { Metadata } from "next";
import App from "./app";

const appUrl = process.env.NEXT_PUBLIC_URL || "https://gramafund.vercel.app";

const frame = {
  version: "next",
  image: {
    src: `${appUrl}/image.png`,
    aspectRatio: "1.91:1"
  },
  buttons: [
    {
      label: "Connect Account",
    }
  ],
  postUrl: `${appUrl}/api/frame/auth`,
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
      "fc:frame": "next",
      "fc:frame:image": frame.image.src,
      "fc:frame:image:aspect_ratio": frame.image.aspectRatio,
      "fc:frame:button:1": frame.buttons[0].label,
      "fc:frame:post_url": frame.postUrl,
    },
  };
}

export default function FramePage() {
  return <App />;
}