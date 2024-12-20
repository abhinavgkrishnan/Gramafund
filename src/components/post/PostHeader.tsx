import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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

interface PostHeaderProps {
  author: string;
  authorPfp?: string;
  date: string;
  title: string;
  type: keyof typeof typeStyles;
  tags: string[];
}

export function PostHeader({ 
  author, 
  authorPfp, 
  date, 
  title, 
  type, 
  tags 
}: PostHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        {authorPfp && (
          <div className="relative w-10 h-10 overflow-hidden rounded-full border border-border">
            <img
              src={authorPfp}
              alt={author}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="flex flex-col">
          <span className="font-medium">{author}</span>
          <span className="text-sm text-muted-foreground">
            {formatDate(date)}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{title}</h1>
        <span
          className={cn(
            "inline-block rounded-md px-2 py-0.5 text-xs font-medium",
            typeStyles[type],
          )}
        >
          {type}
        </span>
      </div>

      <div className="flex gap-2">
        {tags.map((tag) => (
          <Badge key={tag} variant="secondary">
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  );
}