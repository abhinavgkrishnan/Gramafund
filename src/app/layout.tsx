import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import "@neynar/react/dist/style.css";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Grama Fund",
  description: "Cast from a frame!",
  openGraph: {
    title: "Grama Fund",
    description: "Cast from a frame!",
    images: [`${process.env.HOST}/api/frame/base`],
  },
  other: {
    "fc:frame": "vNext",
    "fc:frame:image": `${process.env.HOST}/api/frame/base`,
    "fc:frame:button:1": "Start",
    "fc:frame:post_url": `${process.env.HOST}/api/frame/start`,
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
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content={`${process.env.HOST}/api/frame/base`} />
        <meta property="fc:frame:button:1" content="Start" />
        <meta property="fc:frame:post_url" content={`${process.env.HOST}/api/frame/start`} />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}