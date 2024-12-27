import { Metadata } from "next";

const appUrl = process.env.HOST || "https://gramafund.vercel.app";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Create Post - Gramafund",
    openGraph: {
      title: "Create Post - Gramafund",
      description: "Create a new post on Gramafund",
      images: [`${appUrl}/image.png`],
    },
    other: {
      "fc:frame": "next",
      "fc:frame:image": `${appUrl}/image.png`,
      "fc:frame:button:1": "Create Post",
      "fc:frame:button:1:action": "post",
      "fc:frame:post_url": `${appUrl}/api/frame/publish`,
      "fc:frame:input:text": "What would you like to post?",
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
            
            {/* Example form - this is just for visual, actual posting happens via frame */}
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