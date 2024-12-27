import { Metadata } from "next";
import App from "./app";

const appUrl = process.env.HOST || "https://gramafund.vercel.app";

const frame = {
  version: "next", // Keep this as it was working
  imageUrl: `${appUrl}/image.png`,
  button: {
    title: "Create Post",
    action: {
      type: "post", // Changed from launch_frame since we're handling posts
      name: "Gramafund Post",
      url: `${appUrl}/api/frame/base`,
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
      "fc:frame": JSON.stringify(frame), // Keep the JSON.stringify as it was working
    },
  };
}

export default function FramePage() {
  return <App />;
}
