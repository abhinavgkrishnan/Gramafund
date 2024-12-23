export default function TestPage() {
  return (
    <>
      <meta property="fc:frame" content="1" />
      <meta property="fc:frame:image" content="https://gramafund.vercel.app/image.png" />
      <meta property="fc:frame:button:1" content="Test Button" />
      <meta property="fc:frame:post_url" content="https://gramafund.vercel.app/api/frame" />
      
      <div className="p-4">
        <h1 className="text-2xl font-bold">Frame Test Page</h1>
        <p className="mt-4">This is a test page for Farcaster Frames.</p>
      </div>
    </>
  );
}