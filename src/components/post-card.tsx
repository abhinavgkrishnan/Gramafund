import { ArrowUpIcon, MessageSquare } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Post {
  id: number;
  title: string;
  type: "Project" | "Comment" | "Reaction" | "Funding";
  author: string;
  date: string;
  description: string;
  karma: number;
  comments: number;
  tags: string[];
}

interface PostCardProps {
  post: Post;
}

const typeStyles = {
  Project: "bg-blue-100 text-blue-800",
  Comment: "bg-gray-100 text-gray-800",
  Reaction: "bg-purple-100 text-purple-800",
  Funding: "bg-green-100 text-green-800",
  Impact: "bg-yellow-100 text-yellow-800",
  Research: "bg-red-100 text-red-800",
};

export function PostCard({ post }: PostCardProps) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Link
              href={`/posts/${post.id}`}
              className="text-xl font-semibold tracking-tight hover:underline"
            >
              {post.title}
            </Link>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "inline-block rounded-md px-2 py-0.5 text-xs font-medium",
                  typeStyles[post.type],
                  "cursor-default",
                )}
              >
                {post.type}
              </span>
              <span>•</span>
              <span className="text-sm text-muted-foreground">
                {post.author}
              </span>
              <span>•</span>
              <span className="text-sm text-muted-foreground">
                {new Date(post.date).toLocaleDateString()}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1 h-8 px-2"
          >
            <ArrowUpIcon className="h-4 w-4" />
            <span className="text-sm">{post.karma}</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{post.description}</p>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <div className="flex gap-2">
          {post.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
        <Button variant="ghost" size="sm" className="gap-2">
          <MessageSquare className="h-4 w-4" />
          <span>{post.comments}</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
