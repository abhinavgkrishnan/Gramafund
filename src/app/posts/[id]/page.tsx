"use client";

import Link from "next/link";
import useSWR from "swr";
import axios from "axios";
import { useNeynarContext } from "@neynar/react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { PostHeader } from "@/components/post/PostHeader";
import { PostEngagement } from "@/components/post/PostEngagement";
import { CommentForm } from "@/components/comment/CommentForm";
import { CommentComponent } from "@/components/comment/CommentComponent";
import ImpactCurveContainer from "@/components/ImpactCurveContainer";
import type { Comment, Post } from "@/types";

// Helper function to get all comment IDs including nested ones
const getAllCommentIds = (comments: Comment[]): string[] => {
  return comments.reduce((ids: string[], comment) => {
    ids.push(comment.id);
    if (comment.nestedReplies?.length) {
      ids.push(...getAllCommentIds(comment.nestedReplies));
    }
    return ids;
  }, []);
};

interface PageProps {
  params: { id: string };
}

const LoadingState = () => (
  <div className="container max-w-4xl py-8">
    <div className="space-y-6">
      <div className="w-24 h-8 bg-muted animate-pulse rounded" />
      <div className="space-y-4">
        <div className="h-12 bg-muted animate-pulse rounded" />
        <div className="h-6 bg-muted animate-pulse rounded w-1/3" />
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-muted animate-pulse rounded" />
        <div className="h-4 bg-muted animate-pulse rounded w-5/6" />
        <div className="h-4 bg-muted animate-pulse rounded w-4/6" />
      </div>
    </div>
  </div>
);

export default function PostPage({ params }: PageProps) {
  const { user } = useNeynarContext();
  const { toast } = useToast();
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const {
    data: postData,
    error,
    isLoading,
    mutate: mutatePost,
  } = useSWR<{ post: Post }>(
    params.id ? `/api/posts/${params.id}` : null, // Check if params.id exists
    async (url: string) => {
      console.log('Fetching:', url);
      const response = await axios.get(url);
      console.log('Response:', response.data);
      return response.data;
    },
    {
      keepPreviousData: true,
      revalidateOnFocus: false,
      dedupingInterval: 2000,
    }
  );
  

  const post = postData?.post;

  // Create an array of all comment IDs (including nested ones)
  const commentIds = post?.replies ? getAllCommentIds(post.replies) : [];

  // Fetch reaction status for post and comments
  const { data: reactionData, mutate: mutateReactions } = useSWR(
    user?.fid && post
      ? `/api/posts/${params.id}/reactions?viewerFid=${user.fid}${
          commentIds.length ? `&commentIds=${commentIds.join(",")}` : ""
        }`
      : null,
    async (url: string) => {
      const response = await axios.get(url);
      return response.data;
    },
  );

  // Simplify the loading check
  const isLoadingPost = isLoading || !postData?.post;
  if (isLoadingPost) {
    return <LoadingState />;
  }

  // Show error state
  if (error) {
    return (
      <div className="container max-w-4xl py-8">
        <div>Error loading post</div>
      </div>
    );
  }

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
        targetAuthorFid: post?.authorFid,
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

  const updateCommentLikes = (
    comments: Comment[],
    commentId: string,
    increment: number,
  ): Comment[] => {
    return comments.map((comment) => {
      if (comment.id === commentId) {
        return { ...comment, likes: comment.likes + increment };
      }
      if (comment.nestedReplies?.length) {
        return {
          ...comment,
          nestedReplies: updateCommentLikes(
            comment.nestedReplies,
            commentId,
            increment,
          ),
        };
      }
      return comment;
    });
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
            replies: updateCommentLikes(
              current.post.replies || [],
              comment.id,
              1,
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

  const handleCommentReply = async (text: string, parentComment: Comment) => {
    if (!user?.signer_uuid) {
      toast({
        description: "Please sign in with Farcaster first",
        variant: "destructive",
      });
      return;
    }

    if (!text.trim()) {
      toast({
        description: "Please enter a reply",
        variant: "destructive",
      });
      return;
    }

    try {
      await axios.post("/api/posts/reply", {
        signerUuid: user.signer_uuid,
        text: text,
        parentHash: parentComment.id,
      });

      await mutatePost();

      toast({
        description: "Reply posted successfully",
      });
    } catch (error) {
      console.error("Failed to post reply:", error);
      toast({
        description: "Failed to post reply",
        variant: "destructive",
      });
    }
  };

  // Show loading state for any loading condition
  if (isLoading || !postData || !post) {
    return <LoadingState />;
  }

  // Only show error state after loading is complete
  if (error) {
    return (
      <div className="container max-w-4xl py-8">
        <div>Error loading post</div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="space-y-6">
        <Link href="/posts">
          <Button variant="ghost" size="sm" className="mb-4">
            ← Back to posts
          </Button>
        </Link>

        <PostHeader
          author={post.author}
          authorPfp={post.authorPfp}
          date={post.date}
          title={post.title}
          type={post.type}
          tags={post.tags}
        />

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Project Details</h2>
          <p className="text-lg leading-relaxed text-muted-foreground">
            {post.description}
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Spending plan</h2>
          <p className="text-lg leading-relaxed text-muted-foreground">
            {post.detail}
          </p>
        </div>

        {post.links && post.links.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Links of Interest</h2>
            <ul className="list-disc list-inside">
              {post.links.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.startsWith("http") ? link : `https://${link}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-6">
          <ImpactCurveContainer projectId={post.id} />
        </div>

        <PostEngagement
          karma={post.karma}
          comments={post.comments}
          hasLiked={reactionData?.hasLiked}
          onLike={handleLike}
          isAuthenticated={!!user}
        />

        <div className="space-y-4 border-t pt-4">
          <h2 className="text-xl font-semibold">Comments ({post.comments})</h2>
          <div className="rounded-lg bg-muted p-4">
            <div className="flex flex-col gap-4">
              <CommentForm
                onSubmit={handleSubmitComment}
                text={commentText}
                onChange={setCommentText}
                isSubmitting={isSubmittingComment}
                isAuthenticated={!!user}
              />

              <div className="space-y-4">
                {post.replies?.map((comment) => (
                  <CommentComponent
                    key={comment.id}
                    comment={comment}
                    onLike={handleCommentLike}
                    onReply={handleCommentReply}
                    isAuthenticated={!!user}
                    reactionData={reactionData}
                  />
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
