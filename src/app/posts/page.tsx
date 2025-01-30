"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { PostCard } from "@/components/post-card";
import { usePosts } from "@/hooks/use-posts";
import { Button } from "@/components/ui/button";
import { CastModal } from "@/components/cast-modal";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SortOption = "date" | "karma" | "comments";

function PostsContent() {
  const [cursor, setCursor] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("date");
  const { posts, nextCursor, isLoading, isError, refresh } = usePosts(
    cursor || undefined,
  );
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("openModal") === "true") {
      setIsModalOpen(true);
    }
  }, [searchParams]);

  const sortedPosts = [...(posts || [])].sort((a, b) => {
    switch (sortBy) {
      case "date":
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case "karma":
        return b.karma - a.karma;
      case "comments":
        return b.comments - a.comments;
      default:
        return 0;
    }
  });

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
        <p className="text-red-500 mb-4">Temporarily unable to load posts</p>
        <Button onClick={() => refresh()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  // if (!posts?.length) {
  //   return (
  //     <div className="flex flex-1 flex-col items-center justify-center p-4">
  //       <p>No posts found</p>
  //     </div>
  //   );
  // }

  return (
    <>
      <div className="container mx-auto max-w-3xl px-4 py-6">
        <div className="flex justify-end mb-4">
          <Select
            value={sortBy}
            onValueChange={(value: SortOption) => setSortBy(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" defaultValue="date">
                {sortBy === "date" && "Most Recent"}
                {sortBy === "karma" && "Most Liked"}
                {sortBy === "comments" && "Most Comments"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Most Recent</SelectItem>
              <SelectItem value="karma">Most Liked</SelectItem>
              <SelectItem value="comments">Most Comments</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4">
          {sortedPosts.map((post) => (
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

      <CastModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-4">
      <p>Loading posts...</p>
    </div>
  );
}

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-4">
      <p className="text-red-500 mb-4">Something went wrong:</p>
      <pre className="mb-4">{error.message}</pre>
      <Button onClick={resetErrorBoundary} variant="outline">
        Try Again
      </Button>
    </div>
  );
}

export default function PostsClient() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Suspense fallback={<LoadingState />}>
        <PostsContent />
      </Suspense>
    </ErrorBoundary>
  );
}
