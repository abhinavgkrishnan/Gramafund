import { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Frame Test',
    description: 'Test page for Farcaster Frame',
    other: {
      'fc:frame': '1',
      'fc:frame:image': 'https://gramafund.vercel.app/image.png',
      'fc:frame:button:1': 'Test Button',
      'fc:frame:post_url': 'https://gramafund.vercel.app/api/frame',
    },
  }
}

export default function FramePage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Frame Test Page</h1>
      <p className="mt-4">This is a test page for Farcaster Frames.</p>
    </div>
  );
}