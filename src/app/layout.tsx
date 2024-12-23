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
        <meta
          name="fc:frame"
          content='{
            "version": "1",
            "imageUrl": "https://gramafund.vercel.app/image.png",
            "buttons": [
              {
                "label": "View Posts",
                "action": "link",
                "target": "https://gramafund.vercel.app/posts"
              },
              {
                "label": "Create Post",
                "action": "post_redirect",
                "target": "https://gramafund.vercel.app/posts?openModal=true"
              }
            ]
          }'
        />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
