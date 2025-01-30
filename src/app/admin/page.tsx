// app/admin/page.tsx
"use client";

import { useState, useCallback, useEffect } from "react";
import { useNeynarContext } from "@neynar/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Post {
  post_hash: string;
  title: string;
  description: string;
  post_type: string;
  created_at: string;
  author_fid: string;
  status: "pending" | "approved" | "rejected";
  approved_at?: string;
  approved_by?: string;
}

type StatusFilter = "all" | "pending" | "approved" | "rejected";

function AdminPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const { user } = useNeynarContext();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const fetchPosts = useCallback(async () => {
    if (!user?.fid) return;

    try {
      const response = await fetch(`/api/admin/posts?fid=${user.fid}`);
      if (!response.ok) {
        throw new Error("Unauthorized");
      }

      const data = await response.json();
      setPosts(data.posts);
    } catch (error) {
      toast({
        description: "You are not authorized to view this page",
        variant: "destructive",
      });
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [user?.fid, toast]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleApprove = async (postHash: string) => {
    if (!user?.fid) return;

    try {
      const response = await fetch("/api/admin/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postHash, adminFid: user.fid }),
      });

      if (!response.ok) {
        throw new Error("Failed to approve post");
      }

      toast({ description: "Post approved successfully" });
      fetchPosts();
    } catch (error) {
      toast({
        description: "Failed to approve post",
        variant: "destructive",
      });
      console.log(error);
    }
  };

  const handleReject = async (postHash: string) => {
    if (!user?.fid) return;

    try {
      const response = await fetch("/api/admin/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postHash, adminFid: user.fid }),
      });

      if (!response.ok) {
        throw new Error("Failed to reject post");
      }

      toast({ description: "Post rejected successfully" });
      fetchPosts();
    } catch (error) {
      toast({
        description: "Failed to reject post",
        variant: "destructive",
      });
      console.log(error);
    }
  };

  const filteredPosts = posts.filter((post) =>
    statusFilter === "all" ? true : post.status === statusFilter,
  );

  const getStatusColor = (status: Post["status"]) => {
    switch (status) {
      case "approved":
        return "text-green-600";
      case "rejected":
        return "text-red-600";
      case "pending":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  if (loading) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  const getActionButtons = (post: Post) => {
    switch (post.status) {
      case "pending":
        return (
          <>
            <Button
              onClick={(e) => {
                e.preventDefault();
                handleApprove(post.post_hash);
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              Approve
            </Button>
            <Button
              onClick={(e) => {
                e.preventDefault();
                handleReject(post.post_hash);
              }}
              variant="destructive"
            >
              Reject
            </Button>
          </>
        );
      case "approved":
        return (
          <Button
            onClick={(e) => {
              e.preventDefault();
              handleReject(post.post_hash);
            }}
            variant="destructive"
          >
            Reject
          </Button>
        );
      case "rejected":
        return (
          <Button
            onClick={(e) => {
              e.preventDefault();
              handleApprove(post.post_hash);
            }}
            className="bg-green-600 hover:bg-green-700"
          >
            Re-approve
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto max-w-4xl p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Select
          value={statusFilter}
          onValueChange={(value: StatusFilter) => setStatusFilter(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Posts</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {filteredPosts.map((post) => (
          <Link href={`/posts/${post.post_hash}`} key={post.post_hash}>
            <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold">{post.title}</h2>
                    <span
                      className={`text-sm font-medium ${getStatusColor(post.status)}`}
                    >
                      •{" "}
                      {post.status.charAt(0).toUpperCase() +
                        post.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-1">{post.description}</p>
                  <div className="mt-2 space-x-2">
                    <span className="text-sm text-gray-500">
                      Type: {post.post_type}
                    </span>
                    <span className="text-sm text-gray-500">
                      Author FID: {post.author_fid}
                    </span>
                    {post.approved_by && (
                      <span className="text-sm text-gray-500">
                        {post.status === "approved" ? "Approved" : "Rejected"}{" "}
                        by: {post.approved_by}
                      </span>
                    )}
                  </div>
                </div>
                <div className="space-x-2 ml-4">{getActionButtons(post)}</div>
              </div>
            </Card>
          </Link>
        ))}

        {filteredPosts.length === 0 && (
          <p className="text-center text-gray-500">
            No {statusFilter === "all" ? "" : statusFilter} posts found
          </p>
        )}
      </div>
    </div>
  );
}

export default AdminPage;
