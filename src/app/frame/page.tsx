export default function FrameTestPage() {
  return (
    <>
      <meta property="fc:frame" content="vNext" />
      <meta property="fc:frame:image" content="https://gramafund.vercel.app/image.png" />
      <meta property="fc:frame:button:1" content="Simple Button" />
      <meta property="fc:frame:post_url" content="https://gramafund.vercel.app/api/frame" />
      
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Frame Test Page</h1>
        <p className="mb-2">This is a simple test page for Farcaster Frames.</p>
        <p>Frame metadata is properly set up on this page.</p>
        
        <div className="mt-8 p-4 bg-gray-100 rounded">
          <h2 className="font-semibold mb-2">Debug Info:</h2>
          <ul className="list-disc pl-4">
            <li>Image URL: /image.png</li>
            <li>Frame Version: vNext</li>
            <li>Button Action: Simple test</li>
            <li>API Endpoint: /api/frame</li>
          </ul>
        </div>
      </div>
    </>
  );
}