import { Heart, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PostEngagementProps {
  karma: number;
  comments: number;
  hasLiked: boolean;
  onLike: () => Promise<void>;
  isAuthenticated: boolean;
}

export function PostEngagement({ 
  karma, 
  comments, 
  hasLiked, 
  onLike, 
  isAuthenticated 
}: PostEngagementProps) {
  return (
    <div className="flex items-center gap-4 border-t pt-4">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onLike}
          className={cn(
            "h-8 w-8 p-0 transition-colors",
            "hover:bg-red-50 hover:text-red-600",
            hasLiked && "text-red-600",
          )}
          disabled={!isAuthenticated || hasLiked}
        >
          <Heart className={cn("h-5 w-5", hasLiked && "fill-current")} />
        </Button>
        <div className="flex items-center gap-1">
          <span className={cn("font-medium", hasLiked && "text-red-600")}>
            {karma}
          </span>
          <span className="text-muted-foreground">points</span>
        </div>
      </div>
      <Button variant="ghost" size="sm" className="gap-2">
        <MessageSquare className="h-4 w-4" />
        <span>{comments} comments</span>
      </Button>
    </div>
  );
}