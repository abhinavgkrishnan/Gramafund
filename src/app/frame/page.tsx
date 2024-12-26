import { Metadata } from 'next';

const HOST = process.env.HOST || "http://localhost:3000";

export const metadata: Metadata = {
  title: 'Grama Fund Frame',
  description: 'Cast from Grama Fund frame',
  openGraph: {
    title: 'Grama Fund Frame',
    description: 'Cast from Grama Fund frame',
    images: [`${HOST}/api/frame/base`],
  },
  other: {
    'fc:frame': 'vNext',
    'fc:frame:image': `${HOST}/api/frame/base`,
    'fc:frame:button:1': 'Start',
    'fc:frame:post_url': `${HOST}/api/frame/start`,
  },
};

export default function Frame() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-black text-white">
      <h1 className="text-4xl font-bold mb-8">Grama Fund Frame</h1>
      <div className="space-y-4 text-center">
        <p className="text-lg">Test this frame in Warpcast:</p>
        <code className="block bg-gray-800 p-4 rounded-lg text-green-400">
          {HOST}/frame
        </code>
        
        <div className="mt-8">
          <a 
            href="https://warpcast.com/~/developers/frames" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            → Test in Frame Validator
          </a>
        </div>

        {/* Preview of what the frame looks like */}
        <div className="mt-12 w-full max-w-2xl mx-auto bg-gray-900 p-8 rounded-lg">
          <div className="aspect-[1.91/1] flex items-center justify-center border-2 border-gray-700 rounded-lg">
            <p className="text-4xl">Cast from a frame! 🎭</p>
          </div>
        </div>
      </div>
    </main>
  );
}