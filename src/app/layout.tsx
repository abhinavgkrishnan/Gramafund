import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import "@neynar/react/dist/style.css";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  metadataBase: new URL('https://gramafund.vercel.app'),
  title: 'Gramafund',
  description: 'Gramafund platform',
  other: {
    'fc:frame': 'vNext',
    'fc:frame:image': 'https://gramafund.vercel.app/image.png',
    'fc:frame:post_url': 'https://gramafund.vercel.app/api/frame'
  }
}

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