import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import "@neynar/react/dist/style.css";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: 'Gramafund',
  description: 'Gramafund platform',
  other: {
    'fc:frame': 'vNext',
    'fc:frame:image': 'https://gramafund.vercel.app/image.png',
    'fc:frame:button:1': 'View Posts',
    'fc:frame:button:1:action': 'link',
    'fc:frame:button:1:target': 'https://gramafund.vercel.app/posts',
    'fc:frame:button:2': 'Create Post',
    'fc:frame:button:2:action': 'post_redirect',
    'fc:frame:button:2:target': 'https://gramafund.vercel.app/posts?openModal=true',
    'fc:frame:post_url': 'https://gramafund.vercel.app/api/frame',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}