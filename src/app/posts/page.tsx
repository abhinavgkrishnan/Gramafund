import { Metadata } from "next";
import { PostsClient } from "./posts-client";

export const metadata: Metadata = {
  metadataBase: new URL('https://gramafund.vercel.app'),
  title: "Gramafund Posts",
  description: "Browse and create posts on Gramafund",
  openGraph: {
    images: ['/image.png'],
  },
};

export default async function PostsPage() {
  return (
    <>
      <meta property="fc:frame" content="vNext" />
      <meta property="fc:frame:image" content="https://gramafund.vercel.app/image.png" />
      <meta property="fc:frame:button:1" content="View Posts" />
      <meta property="fc:frame:button:1:action" content="link" />
      <meta property="fc:frame:button:1:target" content="https://gramafund.vercel.app/posts" />
      <meta property="fc:frame:button:2" content="Create Post" />
      <meta property="fc:frame:button:2:action" content="post_redirect" />
      <meta property="fc:frame:button:2:target" content="https://gramafund.vercel.app/posts?openModal=true" />
      <meta property="fc:frame:post_url" content="https://gramafund.vercel.app/api/frame" />
      <PostsClient />
    </>
  );
}