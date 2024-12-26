import { Metadata } from "next";

const appUrl = process.env.HOST || "https://gramafund.vercel.app";

const frame = {
  version: "next",
  imageUrl: `${appUrl}/image.png`,
  buttons: [
    {
      title: "Cast",
      action: {
        type: "post",
        url: `${appUrl}/api/frame/publish`,
      },
    },
  ],
  input: {
    text: "What would you like to cast?",
  },
  postUrl: `${appUrl}/api/frame/publish`,
};

export const metadata: Metadata = {
  title: "Gramafund",
  description: "Cast on Gramafund",
  openGraph: {
    title: "Gramafund",
    description: "Cast on Gramafund",
    images: [`${appUrl}/image.png`],
  },
  other: {
    "fc:frame": JSON.stringify(frame),
  },
};

export default function FramePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Gramafund Frame</h1>
      <p className="text-lg mb-4">Test this frame URL:</p>
      <code className="bg-gray-100 p-2 rounded">{appUrl}/frame</code>
    </div>
  );
}
