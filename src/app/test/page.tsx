export default function TestPage() {
  return (
    <html>
      <head>
        <title>Frame Test</title>
        <meta property="fc:frame" content="1" />
        <meta property="fc:frame:image" content="https://gramafund.vercel.app/image.png" />
        <meta property="fc:frame:button:1" content="Test Button" />
        <meta property="fc:frame:post_url" content="https://gramafund.vercel.app/api/frame" />
        <meta property="og:title" content="Frame Test" />
        <meta property="og:image" content="https://gramafund.vercel.app/image.png" />
      </head>
      <body>
        <div>
          <h1>Frame Test Page</h1>
          <p>Testing Farcaster Frame</p>
        </div>
      </body>
    </html>
  );
}