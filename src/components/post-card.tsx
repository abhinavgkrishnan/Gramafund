"use client"

import { MessageSquare } from 'lucide-react'
import Link from "next/link"
import { Post } from "@/types"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { cn } from "@/lib/utils"


interface PostCardProps {
  post: Post
}

const typeStyles = {
  Project: "bg-blue-100 text-blue-800",
  Comment: "bg-gray-100 text-gray-800",
  Reaction: "bg-purple-100 text-purple-800",
  Funding: "bg-green-100 text-green-800",
  Impact: "bg-yellow-100 text-yellow-800",
  Research: "bg-red-100 text-red-800",
}

function getTimeAgo(date: string) {
  const now = new Date()
  const postDate = new Date(date)
  const diffInDays = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24))

  if (diffInDays > 365) {
    return `${Math.floor(diffInDays / 365)}y`
  }
  if (diffInDays > 30) {
    return `${Math.floor(diffInDays / 30)}mo`
  }
  return `${diffInDays}d`
}

export function PostCard({ post }: PostCardProps) {
  return (
    <div className="group rounded-lg px-3 sm:px-4 py-2 hover:bg-accent border-b border-border last:border-b-0">
      {/* Mobile Layout */}
      <div className="flex flex-col gap-2 sm:hidden">
        {/* Karma and Type */}
        <div className="flex items-center gap-2">
          <span className="font-medium">{post.karma}</span>
          <span
            className={cn(
              "inline-block rounded-md px-2 py-0.5 text-xs font-medium",
              typeStyles[post.type]
            )}
          >
            {post.type}
          </span>
        </div>

        {/* Title */}
        <HoverCard openDelay={0} closeDelay={0}>
          <HoverCardTrigger asChild>
            <div>
              <Link
                href={`/posts/${post.id}`}
                className="font-medium hover:underline line-clamp-2"
              >
                {post.title}
              </Link>
            </div>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <div className="flex flex-col gap-2">
              <h4 className="font-semibold">{post.title}</h4>
              <p className="text-sm text-muted-foreground">{post.description}</p>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground truncate max-w-[100px]">
              {post.author}
            </span>
            <span className="text-muted-foreground">{getTimeAgo(post.date)}</span>
          </div>
          <Button variant="ghost" size="sm" className="h-8 gap-1 px-2">
            <MessageSquare className="h-4 w-4" />
            <span className="text-sm">{post.comments}</span>
          </Button>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden sm:flex sm:flex-row items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="w-12 text-right font-medium">{post.karma}</span>
          <span
            className={cn(
              "inline-block rounded-md px-2 py-0.5 text-xs font-medium",
              typeStyles[post.type]
            )}
          >
            {post.type}
          </span>
        </div>

        <HoverCard openDelay={0} closeDelay={0}>
          <HoverCardTrigger asChild>
            <div className="flex-1 min-w-0">
              <Link
                href={`/posts/${post.id}`}
                className="font-medium hover:underline line-clamp-1"
              >
                {post.title}
              </Link>
            </div>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <div className="flex flex-col gap-2">
              <h4 className="font-semibold">{post.title}</h4>
              <p className="text-sm text-muted-foreground">{post.description}</p>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>

        <div className="flex items-center gap-4 ml-auto text-sm">
          <span className="text-muted-foreground truncate max-w-none">
            {post.author}
          </span>
          <span className="text-muted-foreground">{getTimeAgo(post.date)}</span>
          <Button variant="ghost" size="sm" className="h-8 gap-1 px-2">
            <MessageSquare className="h-4 w-4" />
            <span>{post.comments}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}