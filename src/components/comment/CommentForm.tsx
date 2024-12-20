import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CommentFormProps {
  onSubmit: () => Promise<void>;
  text: string;
  onChange: (text: string) => void;
  isSubmitting: boolean;
  isAuthenticated: boolean;
  placeholder?: string;
}

export function CommentForm({
  onSubmit,
  text,
  onChange,
  isSubmitting,
  isAuthenticated,
  placeholder = "Add a comment...",
}: CommentFormProps) {
  return (
    <div className="border-b pb-4">
      <textarea
        className={cn(
          "w-full rounded-md border p-2 resize-none",
          "focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2",
          !isAuthenticated && "cursor-not-allowed opacity-50",
        )}
        placeholder={isAuthenticated ? placeholder : "Please sign in to comment"}
        rows={3}
        value={text}
        onChange={(e) => onChange(e.target.value)}
        disabled={!isAuthenticated || isSubmitting}
      />
      <div className="mt-2 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {text.length} characters
        </span>
        <Button
          onClick={onSubmit}
          disabled={!isAuthenticated || isSubmitting || !text.trim()}
        >
          {isSubmitting ? (
            <span className="mr-2">Posting...</span>
          ) : (
            "Post Comment"
          )}
        </Button>
      </div>
    </div>
  );
}