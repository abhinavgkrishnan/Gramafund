import { Metadata } from "next";
import App from "./app";

const appUrl = process.env.HOST || "https://gramafund.vercel.app";

const frame = {
  version: "next",
  imageUrl: `${appUrl}/image.png`,
  button: {
    title: "Connect Account",
    action: {
      type: "post",
      name: "Gramafund",
      url: `${appUrl}/frame`,
      splashImageUrl: `${appUrl}/image.png`,
      splashBackgroundColor: "#131313",
    },
  },
};

export const metadata: Metadata = {
  title: "Gramafund",
  description: "Connect with Gramafund",
  openGraph: {
    title: "Gramafund",
    description: "Connect with Gramafund",
    images: [`${appUrl}/image.png`],
  },
  other: {
    "fc:frame": JSON.stringify(frame),
  },
};

export default function FramePage() {
  return <App title="Gramafund" />;
}
