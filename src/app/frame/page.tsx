import { Metadata } from "next";

const appUrl = process.env.HOST || "https://gramafund.vercel.app";

const frame = {
  version: "next",
  image: {
    src: `${appUrl}/api/frame/base`,
    aspectRatio: "1.91:1",
  },
  buttons: [
    {
      label: "Start Posting",
      action: "post",
    },
  ],
  postUrl: `${appUrl}/api/frame/post-type`,
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Gramafund",
    openGraph: {
      title: "Gramafund",
      description: "Create posts on Gramafund",
      images: [frame.image.src],
    },
    other: {
      "fc:frame": "next",
      "fc:frame:image": frame.image.src,
      "fc:frame:image:aspect_ratio": frame.image.aspectRatio,
      "fc:frame:button:1": frame.buttons[0].label,
      "fc:frame:button:1:action": frame.buttons[0].action,
      "fc:frame:post_url": frame.postUrl,
    },
  };
}

export default function FramePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Gramafund Frame</h1>
      <p className="text-lg mb-4">Test this frame URL:</p>
      <code className="bg-gray-100 p-2 rounded">{appUrl}/frame</code>
    </div>
  );
}
