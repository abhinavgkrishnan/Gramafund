import { Metadata } from "next";
import { PostsClient } from "./posts-client";

export const metadata: Metadata = {
  title: "Gramafund Posts",
  description: "Browse and create posts on Gramafund",
  other: {
    // Frame metadata
    'fc:frame': 'vNext',
    'fc:frame:image': 'https://gramafund.vercel.app/image.png',
    'fc:frame:button:1': 'Browse Posts',
    'fc:frame:button:1:action': 'link',
    'fc:frame:button:1:target': 'https://gramafund.vercel.app/posts',
    'fc:frame:button:2': 'Create Post',
    'fc:frame:button:2:action': 'post_redirect',
    'fc:frame:button:2:target': 'https://gramafund.vercel.app/posts?openModal=true',
    'fc:frame:post_url': 'https://gramafund.vercel.app/api/frame',
  }
};

export default function PostsPage() {
  return <PostsClient />;
}
