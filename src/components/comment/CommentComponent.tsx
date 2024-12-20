import { Heart, MessageSquare, Reply } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CommentForm } from "./CommentForm";
import { cn } from "@/lib/utils";
import type { Comment } from "@/types";

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

interface CommentComponentProps {
  comment: Comment;
  level?: number;
  onLike: (comment: Comment) => Promise<void>;
  onReply: (text: string, parentComment: Comment) => Promise<void>;
  isAuthenticated: boolean;
  reactionData: {
    reactions: Record<string, { hasLiked: boolean }>;
  };
}

export function CommentComponent({
  comment,
  level = 0,
  onLike,
  onReply,
  isAuthenticated,
  reactionData,
}: CommentComponentProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const handleReplySubmit = async () => {
    setIsSubmittingReply(true);
    try {
      await onReply(replyText, comment);
      setReplyText("");
      setIsReplying(false);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  return (
    <div className={cn("rounded-lg bg-card p-4", level > 0 && "ml-8 mt-4")}>
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
            onClick={() => onLike(comment)}
            className={cn(
              "h-8 w-8 p-0 transition-colors",
              "hover:bg-red-50 hover:text-red-600",
              reactionData?.reactions[comment.id]?.hasLiked && "text-red-600",
            )}
            disabled={!isAuthenticated || reactionData?.reactions[comment.id]?.hasLiked}
          >
            <Heart
              className={cn(
                "h-4 w-4",
                reactionData?.reactions[comment.id]?.hasLiked && "fill-current"
              )}
            />
          </Button>
          <span
            className={cn(
              "text-sm",
              reactionData?.reactions[comment.id]?.hasLiked && "text-red-600"
            )}
          >
            {comment.likes}
          </span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsReplying(!isReplying)}
          className="gap-2 text-muted-foreground hover:text-foreground"
          disabled={!isAuthenticated}
        >
          <Reply className="h-4 w-4" />
          <span>Reply</span>
        </Button>

        {comment.replies > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MessageSquare className="h-4 w-4" />
            <span>{comment.replies}</span>
          </div>
        )}
      </div>

      {isReplying && (
        <div className="mt-4">
          <CommentForm
            onSubmit={handleReplySubmit}
            text={replyText}
            onChange={setReplyText}
            isSubmitting={isSubmittingReply}
            isAuthenticated={isAuthenticated}
            placeholder="Write a reply..."
          />
        </div>
      )}

      {comment.nestedReplies?.map((reply) => (
        <CommentComponent
          key={reply.id}
          comment={reply}
          level={level + 1}
          onLike={onLike}
          onReply={onReply}
          isAuthenticated={isAuthenticated}
          reactionData={reactionData}
        />
      ))}
    </div>
  );
}