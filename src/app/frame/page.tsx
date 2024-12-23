import { Metadata } from "next";
import App from "./app";

const appUrl = process.env.NEXT_PUBLIC_URL || "https://gramafund.vercel.app";

const frame = {
  version: "1", // Keep as "1" since you're using verified domain
  imageUrl: `${appUrl}/image.png`,
  button: {
    title: "Launch Gramafund",
    action: {
      type: "launch_frame",
      name: "Gramafund",
      url: `${appUrl}/posts`, // Where you want users to land
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
  return <App />;
}