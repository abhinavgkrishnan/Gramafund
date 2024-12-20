"use client";

import { MessageSquare, Heart } from "lucide-react";
import { notFound } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import axios from "axios";
import { useNeynarContext } from "@neynar/react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Comment, Post } from "@/types";

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
  const { user } = useNeynarContext();
  const { toast } = useToast();
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Fetch post data
  const {
    data: postData,
    error,
    isLoading,
    mutate: mutatePost,
  } = useSWR<{ post: Post }>(`/api/posts/${params.id}`, async (url: string) => {
    const response = await axios.get(url);
    return response.data;
  });

  // Create an array of comment IDs
  const commentIds = postData?.post.replies?.map((reply) => reply.id) || [];

  // Fetch reaction status for post and comments
  const { data: reactionData, mutate: mutateReactions } = useSWR(
    user?.fid
      ? `/api/posts/${params.id}/reactions?viewerFid=${user.fid}&commentIds=${commentIds.join(",")}`
      : null,
    async (url: string) => {
      const response = await axios.get(url);
      return response.data;
    },
  );

  const handleLike = async () => {
    if (!user?.signer_uuid) {
      toast({
        description: "Please sign in with Farcaster first",
        variant: "destructive",
      });
      return;
    }

    if (reactionData?.hasLiked) {
      toast({
        description: "You've already liked this post",
        variant: "destructive",
      });
      return;
    }

    try {
      // Optimistically update both post and reaction data
      mutatePost((current) => {
        if (!current) return current;
        return {
          post: {
            ...current.post,
            karma: current.post.karma + 1,
          },
        };
      }, false);

      mutateReactions(
        (
          current:
            | {
                hasLiked: boolean;
                reactions: Record<string, { hasLiked: boolean }>;
              }
            | undefined,
        ) => ({
          ...current,
          hasLiked: true,
        }),
        false,
      );

      await axios.post("/api/posts/like", {
        signerUuid: user.signer_uuid,
        hash: params.id,
        targetAuthorFid: postData?.post.authorFid,
      });

      toast({
        description: "Post liked successfully",
      });
    } catch (error) {
      console.error("Failed to like post", error);
      mutatePost();
      mutateReactions();

      toast({
        description: "Failed to like post",
        variant: "destructive",
      });
    }
  };

  const handleCommentLike = async (comment: Comment) => {
    if (!user?.signer_uuid) {
      toast({
        description: "Please sign in with Farcaster first",
        variant: "destructive",
      });
      return;
    }

    const hasLiked = reactionData?.reactions[comment.id]?.hasLiked;

    if (hasLiked) {
      toast({
        description: "You've already liked this comment",
        variant: "destructive",
      });
      return;
    }

    try {
      // Optimistically update UI
      mutateReactions(
        (
          current:
            | {
                hasLiked: boolean;
                reactions: Record<string, { hasLiked: boolean }>;
              }
            | undefined,
        ) => ({
          ...current,
          reactions: {
            ...current?.reactions,
            [comment.id]: { hasLiked: true },
          },
        }),
        false,
      );

      mutatePost((current) => {
        if (!current) return current;
        return {
          post: {
            ...current.post,
            replies: current.post.replies?.map((reply) =>
              reply.id === comment.id
                ? { ...reply, likes: reply.likes + 1 }
                : reply,
            ),
          },
        };
      }, false);

      await axios.post("/api/posts/like", {
        signerUuid: user.signer_uuid,
        hash: comment.id,
        targetAuthorFid: comment.authorFid,
      });

      toast({
        description: "Comment liked successfully",
      });
    } catch (error) {
      console.error("Failed to like comment", error);
      mutateReactions();
      mutatePost();

      toast({
        description: "Failed to like comment",
        variant: "destructive",
      });
    }
  };

  const handleSubmitComment = async () => {
    if (!user?.signer_uuid) {
      toast({
        description: "Please sign in with Farcaster first",
        variant: "destructive",
      });
      return;
    }

    if (!commentText.trim()) {
      toast({
        description: "Please enter a comment",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingComment(true);

    try {
      await axios.post("/api/posts/reply", {
        signerUuid: user.signer_uuid,
        text: commentText,
        parentHash: params.id,
      });

      // Clear form and refetch post data
      setCommentText("");
      await mutatePost();

      toast({
        description: "Comment posted successfully",
      });
    } catch (error) {
      console.error("Failed to post comment:", error);
      toast({
        description: "Failed to post comment",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

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

  if (!postData?.post) {
    notFound();
  }

  const post = postData.post;

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
          <p className="text-lg leading-relaxed">{post.description}</p>
        </div>

        {/* Engagement */}
        <div className="flex items-center gap-4 border-t pt-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={cn(
                "h-8 w-8 p-0 transition-colors",
                "hover:bg-red-50 hover:text-red-600",
                reactionData?.hasLiked && "text-red-600",
              )}
              disabled={!user || reactionData?.hasLiked}
            >
              <Heart
                className={cn(
                  "h-5 w-5",
                  reactionData?.hasLiked && "fill-current",
                )}
              />
            </Button>
            <div className="flex items-center gap-1">
              <span
                className={cn(
                  "font-medium",
                  reactionData?.hasLiked && "text-red-600",
                )}
              >
                {post.karma}
              </span>
              <span className="text-muted-foreground">points</span>
            </div>
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
                  className={cn(
                    "w-full rounded-md border p-2 resize-none",
                    "focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2",
                    !user && "cursor-not-allowed opacity-50",
                  )}
                  placeholder={
                    user ? "Add a comment..." : "Please sign in to comment"
                  }
                  rows={3}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  disabled={!user || isSubmittingComment}
                />
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {commentText.length} characters
                  </span>
                  <Button
                    onClick={handleSubmitComment}
                    disabled={
                      !user || isSubmittingComment || !commentText.trim()
                    }
                  >
                    {isSubmittingComment ? (
                      <span className="mr-2">Posting...</span>
                    ) : (
                      "Post Comment"
                    )}
                  </Button>
                </div>
              </div>

              {/* Actual comments */}
              <div className="space-y-4">
                {post.replies?.map((comment) => (
                  <div key={comment.id} className="rounded-lg bg-card p-4">
                    <div className="flex items-center gap-3">
                      {comment.authorPfp && (
                        <div className="relative w-10 h-10 overflow-hidden rounded-full border border-border">
                          <img
                            src={comment.authorPfp}
                            alt={comment.author}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="font-medium">{comment.author}</span>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(comment.timestamp)}
                        </span>
                      </div>
                    </div>
                    <p className="mt-4">{comment.text}</p>
                    <div className="mt-2 flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCommentLike(comment)}
                          className={cn(
                            "h-8 w-8 p-0 transition-colors", // Remove gap-2
                            "hover:bg-red-50 hover:text-red-600",
                            reactionData?.reactions[comment.id]?.hasLiked &&
                              "text-red-600",
                          )}
                          disabled={
                            !user ||
                            reactionData?.reactions[comment.id]?.hasLiked
                          }
                        >
                          <Heart
                            className={cn(
                              "h-4 w-4",
                              reactionData?.reactions[comment.id]?.hasLiked &&
                                "fill-current",
                            )}
                          />
                        </Button>
                        <span
                          className={cn(
                            "text-sm",
                            reactionData?.reactions[comment.id]?.hasLiked &&
                              "text-red-600",
                          )}
                        >
                          {comment.likes}
                        </span>
                      </div>
                      {comment.replies > 0 && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
