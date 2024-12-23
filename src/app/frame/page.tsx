export default function TestPage() {
  return (
    <div>
      <meta property="og:title" content="Frame Test" />
      <meta property="og:image" content="https://gramafund.vercel.app/image.png" />
      <meta property="fc:frame" content="vNext" />
      <meta property="fc:frame:image" content="https://gramafund.vercel.app/image.png" />
      <meta property="fc:frame:button:1" content="Test Button" />
      <meta property="fc:frame:post_url" content="https://gramafund.vercel.app/api/frame" />
      <h1>Frame Test Page</h1>
    </div>
  );
}