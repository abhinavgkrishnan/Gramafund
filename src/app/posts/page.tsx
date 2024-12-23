'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { PostCard } from "@/components/post-card";
import { usePosts } from "@/hooks/use-posts";
import { Button } from "@/components/ui/button";
import { CastModal } from "@/components/cast-modal"; // Import your modal component

export default function Home() {
  const [cursor, setCursor] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { posts, nextCursor, isLoading, isError, refresh } = usePosts(cursor || undefined);
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check for openModal parameter
    if (searchParams.get('openModal') === 'true') {
      setIsModalOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    // Create frame meta tag
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'fc:frame');
    meta.setAttribute('content', JSON.stringify({
      version: "1",
      image: "https://gramafund.vercel.app/image.png", // Use your actual image
      buttons: [
        {
          label: "Browse Posts",
          action: "post_redirect",
          target: "https://gramafund.vercel.app/posts"
        },
        {
          label: "Create Post",
          action: "post_redirect",
          target: "https://gramafund.vercel.app/posts?openModal=true"
        }
      ],
      postUrl: "https://gramafund.vercel.app/posts"
    }));
    document.head.appendChild(meta);

    return () => {
      document.head.removeChild(meta);
    };
  }, []); 

  if (isLoading && !posts.length) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-4">
        <p>Loading posts...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-4">
        <p className="text-red-500 mb-4">
          Temporarily unable to load posts
        </p>
        <Button 
          onClick={() => refresh()}
          variant="outline"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (!posts?.length) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-4">
        <p>No posts found</p>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto max-w-3xl px-4 py-6">
        <div className="grid gap-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>

        {nextCursor && (
          <div className="flex justify-center mt-6">
            <Button
              variant="outline"
              onClick={() => setCursor(nextCursor)}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading ? "Loading..." : "Load More"}
            </Button>
          </div>
        )}
      </div>

      {/* Cast Modal */}
      <CastModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen}
      />
    </>
  );
}