import { MessageSquare } from "lucide-react";
import { notFound } from "next/navigation";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { posts } from "@/data/posts";

const typeStyles = {
  Project: "bg-blue-100 text-blue-800",
  Comment: "bg-gray-100 text-gray-800",
  Reaction: "bg-purple-100 text-purple-800",
  Funding: "bg-green-100 text-green-800",
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

interface PageProps {
  params: {
    id: string;
  };
}

export default function PostPage({ params }: PageProps) {
  const post = posts.find((p) => p.id === Number(params.id));

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
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "inline-block rounded-md px-2 py-0.5 text-xs font-medium",
                typeStyles[post.type],
              )}
            >
              {post.type}
            </span>
            <span className="text-sm text-muted-foreground">
              Posted by {post.author} on {formatDate(post.date)}
            </span>
          </div>
          <h1 className="text-3xl font-bold">{post.title}</h1>
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
          <div className="prose prose-slate max-w-none">
            <p>{post.detail}</p>
          </div>
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
          <h2 className="text-xl font-semibold">Comments</h2>
          <div className="rounded-lg bg-muted p-4">
            <div className="flex flex-col gap-4">
              {/* Placeholder comment form */}
              <div className="border-b pb-4">
                <textarea
                  className="w-full rounded-md border p-2"
                  placeholder="Add a comment..."
                  rows={3}
                />
                <Button className="mt-2">Post Comment</Button>
              </div>

              {/* Placeholder comments */}
              <div className="space-y-4">
                <div className="rounded-lg bg-card p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">
                      Example User
                    </span>
                    <span>•</span>
                    <span>2 hours ago</span>
                  </div>
                  <p className="mt-2">
                    This is an example comment. The commenting system will be
                    implemented soon.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
