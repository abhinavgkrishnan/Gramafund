import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import "@neynar/react/dist/style.css";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="https://gramafund.vercel.app/image.png" />
        <meta property="fc:frame:button:1" content="View Posts" />
        <meta property="fc:frame:button:1:action" content="link" />
        <meta property="fc:frame:button:1:target" content="https://gramafund.vercel.app/posts" />
        <meta property="fc:frame:button:2" content="Create Post" />
        <meta property="fc:frame:button:2:action" content="post_redirect" />
        <meta property="fc:frame:button:2:target" content="https://gramafund.vercel.app/posts?openModal=true" />
        <meta property="fc:frame:post_url" content="https://gramafund.vercel.app/api/frame" />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}