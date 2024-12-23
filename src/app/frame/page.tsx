export const metadata = {
  title: "Gramafund",
  description: "Gramafund Frame App",
  other: {
    "fc:frame": JSON.stringify({
      version: "1",
      imageUrl: "https://gramafund.vercel.app/image.png",
      buttons: [
        {
          title: "Launch App",
          action: {
            type: "launch_frame",
            name: "Gramafund",
            url: "https://gramafund.vercel.app/frame",
            splashImageUrl: "https://gramafund.vercel.app/image.png",
            splashBackgroundColor: "#131313",
          },
        },
      ],
    }),
  },
};

export default function FramePage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Gramafund</h1>
      <p className="mt-4">Launch Gramafund with connected wallet</p>
    </div>
  );
}
