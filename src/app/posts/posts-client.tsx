"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { PostCard } from "@/components/post-card";
import { usePosts } from "@/hooks/use-posts";
import { Button } from "@/components/ui/button";
import { CastModal } from "@/components/cast-modal";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

function PostsContent() {
  const [cursor, setCursor] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { posts, nextCursor, isLoading, isError, refresh } = usePosts(
    cursor || undefined,
  );
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check for openModal parameter
    if (searchParams.get("openModal") === "true") {
      setIsModalOpen(true);
    }
  }, [searchParams]);

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

export function PostsClient() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Suspense fallback={<LoadingState />}>
        <PostsContent />
      </Suspense>
    </ErrorBoundary>
  );
}