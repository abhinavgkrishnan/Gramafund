"use client";

import { MessageSquare, Heart } from "lucide-react";
import { notFound } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import axios from "axios";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Post } from "@/types";

const typeStyles = {
  Project: "bg-blue-100 text-blue-800",
  Comment: "bg-gray-100 text-gray-800",
  Reaction: "bg-purple-100 text-purple-800",
  Funding: "bg-green-100 text-green-800",
} as const;

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

interface PageProps {
  params: { id: string };
}

export default function PostPage({ params }: PageProps) {
  const { data, error, isLoading } = useSWR<{ post: Post }>(
    `/api/posts/${params.id}`,
    async (url: string) => {
      const response = await axios.get(url);
      return response.data;
    },
  );

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-8">
        <div>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-4xl py-8">
        <div>Error loading post</div>
      </div>
    );
  }

  const post = data?.post;

  if (!post) {
    notFound();
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="space-y-6">
        {/* Back button */}
        <Link href="/posts">
          <Button variant="ghost" size="sm" className="mb-4">
            ← Back to posts
          </Button>
        </Link>

        {/* Header */}
        <div className="space-y-4">
          {/* Author info */}
          <div className="flex items-center gap-3">
            {post.authorPfp && (
              <div className="relative w-10 h-10 overflow-hidden rounded-full border border-border">
                <img
                  src={post.authorPfp}
                  alt={post.author}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-medium">{post.author}</span>
              <span className="text-sm text-muted-foreground">
                {formatDate(post.date)}
              </span>
            </div>
          </div>

          {/* Title and type */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">{post.title}</h1>
            <span
              className={cn(
                "inline-block rounded-md px-2 py-0.5 text-xs font-medium",
                typeStyles[post.type],
              )}
            >
              {post.type}
            </span>
          </div>

          {/* Tags */}
          <div className="flex gap-2">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <p className="text-lg text-muted-foreground">{post.description}</p>
        </div>

        {/* Engagement */}
        <div className="flex items-center gap-4 border-t pt-4">
          <div className="flex items-center gap-1">
            <span className="font-medium">{post.karma}</span>
            <span className="text-muted-foreground">points</span>
          </div>
          <Button variant="ghost" size="sm" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            <span>{post.comments} comments</span>
          </Button>
        </div>

        {/* Comments section */}
        <div className="space-y-4 border-t pt-4">
          <h2 className="text-xl font-semibold">Comments ({post.comments})</h2>
          <div className="rounded-lg bg-muted p-4">
            <div className="flex flex-col gap-4">
              {/* Comment form */}
              <div className="border-b pb-4">
                <textarea
                  className="w-full rounded-md border p-2"
                  placeholder="Add a comment..."
                  rows={3}
                />
                <Button className="mt-2">Post Comment</Button>
              </div>

              {/* Actual comments */}
              <div className="space-y-4">
                {post.replies?.map((comment) => (
                  <div key={comment.id} className="rounded-lg bg-card p-4">
                    <div className="flex items-center gap-3">
                      {" "}
                      {/* Changed gap-2 to gap-3 to match header */}
                      {comment.authorPfp && (
                        <div className="relative w-10 h-10 overflow-hidden rounded-full border border-border">
                          {/* Changed w-8 h-8 to w-10 h-10 to match header */}
                          <img
                            src={comment.authorPfp}
                            alt={comment.author}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex flex-col">
                        {" "}
                        {/* Changed to flex-col to match header */}
                        <span className="font-medium">{comment.author}</span>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(comment.timestamp)}
                        </span>
                      </div>
                    </div>
                    <p className="mt-4">{comment.text}</p>{" "}
                    {/* Added more top margin */}
                    <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4" /> {/* Added heart icon */}
                        <span>{comment.likes}</span>
                      </div>
                      {comment.replies > 0 && (
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          <span>{comment.replies}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {(!post.replies || post.replies.length === 0) && (
                  <div className="text-center text-muted-foreground py-4">
                    No comments yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
