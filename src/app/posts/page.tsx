'use client';

import { useState } from 'react';
import { PostCard } from "@/components/post-card";
import { usePosts } from "@/hooks/use-posts";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [cursor, setCursor] = useState<string | null>(null);
  const { posts, nextCursor, isLoading, isError, refresh } = usePosts(cursor || undefined);

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
    <div className="flex flex-1 flex-col gap-4 p-2 sm:p-4 pt-0">
      <div className="flex flex-col gap-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
      
      {nextCursor && (
        <div className="flex justify-center py-4">
          <Button
            variant="outline"
            onClick={() => setCursor(nextCursor)}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </div>
  );
}