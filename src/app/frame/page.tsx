import { Metadata } from "next";

const appUrl = process.env.HOST || "https://antprotocol.vercel.app";

const frame = {
  version: "next",
  imageUrl: `${appUrl}/image.png`,
  button: {
    title: "Launch ANT Protocol",
    action: {
      type: "launch_frame",
      name: "ANT Protocol",
      url: `${appUrl}/frame/create`, // This will redirect to a new create post page
      splashImageUrl: `${appUrl}/image.png`,
      splashBackgroundColor: "#131313",
      // Ensure that sponsorship status is included
      sponsorship: {
        sponsored_by_neynar: true,
      },
    },
  },
};

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "ANT Protocol",
    openGraph: {
      title: "ANT Protocol",
      description: "Connect with ANT Protocol",
      images: [`${appUrl}/image.png`],
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

export default function FramePage() {
  return null;
}
