import { Metadata } from "next";

const appUrl = process.env.HOST || "https://gramafund.vercel.app";

const frame = {
  version: "next",
  imageUrl: `${appUrl}/image.png`,
  button: {
    title: "Create Post",
    action: {
      type: "post",
      name: "Gramafund Post",
      url: `${appUrl}/api/frame/publish`,
      splashImageUrl: `${appUrl}/image.png`,
      splashBackgroundColor: "#131313",
    },
  },
  input: {
    text: "What would you like to post?",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Create Post - Gramafund",
    openGraph: {
      title: "Create Post - Gramafund",
      description: "Create a new post on Gramafund",
      images: [`${appUrl}/image.png`],
    },
    other: {
      "fc:frame": JSON.stringify(frame), // This is the key change
    },
  };
}

export default function CreatePostPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="max-w-md w-full space-y-4">
        <h1 className="text-2xl font-bold text-center">Create a Post</h1>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="space-y-4">
            <div className="text-center text-gray-600">
              Share your thoughts on Farcaster
            </div>

            <div className="space-y-2">
              <textarea
                className="w-full p-2 border rounded"
                placeholder="What would you like to post?"
                disabled
              />
              <div className="text-sm text-gray-500">
                Use the frame button above to create your post
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
