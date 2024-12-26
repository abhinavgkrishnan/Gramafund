import { Metadata } from "next";
import App from "./app";

const appUrl = process.env.NEXT_PUBLIC_URL || "https://gramafund.vercel.app";

const frame = {
  version: "next",
  imageUrl: `${appUrl}/api/frame/base`,
  buttons: [
    {
      title: "Start Posting",
      action: {
        type: "post",
        url: `${appUrl}/api/frame/post-type`,
      },
    }
  ],
  input: {
    text: "What's on your mind?",
  },
  postUrl: `${appUrl}/api/frame/post-type`,
};

export const metadata: Metadata = {
  title: "Gramafund",
  description: "Create posts on Gramafund",
  openGraph: {
    title: "Gramafund",
    description: "Create posts on Gramafund",
    images: [`${appUrl}/api/frame/base`],
  },
  other: {
    "fc:frame": JSON.stringify(frame),
  },
};

export default function FramePage() {
  return <App />;
}