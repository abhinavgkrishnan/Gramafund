export const metadata = {
  other: {
    "fc:frame": "vNext",
    "fc:frame:image": `${process.env.HOST}/api/frame/base`,
    "fc:frame:button:1": "Start",
    "fc:frame:post_url": `${process.env.HOST}/api/frame/start`,
  },
};

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Grama Fund</h1>
      <div className="w-full max-w-2xl">
        <div className="bg-black p-8 rounded-lg text-white text-center">
          <p className="text-2xl">Frame Preview</p>
          <p className="mt-4">This frame will be interactive in Farcaster clients</p>
          <p className="mt-2 text-gray-400">Test URL: {process.env.HOST}/frame</p>
        </div>
        <div className="mt-4 text-center">
          <a 
            href="https://warpcast.com/~/developers/frames" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            Test in Warpcast Frame Validator →
          </a>
        </div>
      </div>
    </main>
  );
}