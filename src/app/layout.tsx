import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import "@neynar/react/dist/style.css";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Grama Fund",
  description: "Cast from a frame!",
  other: {
    "fc:frame": "next",
    "fc:frame:image": `${process.env.HOST || "https://gramafund.vercel.app"}/api/frame/base`,
    "fc:frame:button:1": "Start",
    "fc:frame:post_url": `${process.env.HOST || "https://gramafund.vercel.app"}/api/frame/start`,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="farcaster-frame-manifest" href="/api/farcaster-manifest" />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
