export default function FramePage() {
  return (
    <html>
      <head>
        <title>Gramafund</title>
        <meta name="description" content="Gramafund Frame App" />
        <meta
          name="fc:frame"
          content={JSON.stringify({
            version: "1", // Keep as "1" since you're using the verified domain manifest
            imageUrl: "https://gramafund.vercel.app/image.png",
            button: {
              title: "Launch App",
              action: {
                type: "launch_frame",
                name: "Gramafund",
                url: "https://gramafund.vercel.app/frame",
                splashImageUrl: "https://gramafund.vercel.app/image.png",
                splashBackgroundColor: "#131313",
              },
            },
          })}
          data-rh="true"
        />
        <meta property="og:title" content="Gramafund" />
        <meta property="og:description" content="Gramafund Frame App" />
        <meta
          property="og:image"
          content="https://gramafund.vercel.app/image.png"
        />
      </head>
      <body>
        <div className="p-4">
          <h1 className="text-2xl font-bold">Gramafund</h1>
          <p className="mt-4">Launch Gramafund with connected wallet</p>
        </div>
      </body>
    </html>
  );
}
