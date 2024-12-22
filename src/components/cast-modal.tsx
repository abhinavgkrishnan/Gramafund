"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useNeynarContext } from "@neynar/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
// import { Input } from "@/components/ui/input";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const POST_TYPES = ["Project", "Comment", "Reaction", "Funding"] as const;
type PostType = (typeof POST_TYPES)[number];

const MAX_TITLE_CHARS = 40;
const MAX_DESCRIPTION_CHARS = 200;
const MAX_DETAIL_CHARS = 750;

export function CastModal() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [detail, setDetail] = useState("");
  const [type, setType] = useState<PostType>("Project");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useNeynarContext();
  const { toast } = useToast();

  const counts = {
    title: title.length,
    description: description.length,
    detail: detail.length,
  };

  const remaining = {
    title: MAX_TITLE_CHARS - counts.title,
    description: MAX_DESCRIPTION_CHARS - counts.description,
    detail: MAX_DETAIL_CHARS - counts.detail,
  };

  const handleSubmit = async () => {
    if (!user?.signer_uuid) {
      toast({
        description: "Please sign in with Farcaster first",
        variant: "destructive",
      });
      return;
    }

    if (!title.trim() || !description.trim() || !detail.trim()) {
      toast({
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post("/api/cast", {
        signerUuid: user.signer_uuid,
        title,
        description,
        detail,
        type,
        channel: "gramafund",
      });

      toast({
        description: "Cast published successfully",
      });

      setTitle("");
      setDescription("");
      setDetail("");
      setType("Project");
      setOpen(false);
    } catch (error) {
      console.error("Detailed cast error:", error);

      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to publish cast";
        toast({
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        toast({
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCharacterCountClass = (remaining: number, threshold: number) =>
    cn(
      "text-xs",
      remaining <= threshold * 0.1
        ? "text-red-600"
        : remaining <= threshold * 0.2
          ? "text-yellow-600"
          : "text-muted-foreground",
    );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-black text-white hover:bg-black/90">
          Post
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100%-32px)] p-4 md:p-6 max-w-[600px] top-[50%] rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold md:text-xl">
            New Post
          </DialogTitle>
        </DialogHeader>
        <div className="flex gap-3 md:gap-4 pt-4">
          <div className="flex-shrink-0">
            <Avatar className="h-8 w-8 md:h-10 md:w-10">
              <AvatarImage
                src={user?.pfp_url}
                alt={user?.display_name || "User"}
              />
              <AvatarFallback>
                {user?.display_name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1 space-y-4">
            {/* Title Section */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Title</label>
              <Textarea
                placeholder="Title"
                value={title}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_TITLE_CHARS) {
                    setTitle(e.target.value);
                  }
                }}
                maxLength={MAX_TITLE_CHARS}
                className="resize-none px-3 py-2"
              />
              <div className="flex justify-end">
                <span
                  className={getCharacterCountClass(
                    remaining.title,
                    MAX_TITLE_CHARS,
                  )}
                >
                  {remaining.title} characters remaining
                </span>
              </div>
            </div>

            {/* Description Section */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Write a brief description"
                value={description}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_DESCRIPTION_CHARS) {
                    setDescription(e.target.value);
                  }
                }}
                maxLength={MAX_DESCRIPTION_CHARS}
                className="min-h-[80px] resize-none"
              />
              <div className="flex justify-end">
                <span
                  className={getCharacterCountClass(
                    remaining.description,
                    MAX_DESCRIPTION_CHARS,
                  )}
                >
                  {remaining.description} characters remaining
                </span>
              </div>
            </div>

            {/* Detail Section */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Details</label>
              <Textarea
                placeholder="Provide more detailed information"
                value={detail}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_DETAIL_CHARS) {
                    setDetail(e.target.value);
                  }
                }}
                maxLength={MAX_DETAIL_CHARS}
                className="min-h-[150px] resize-none"
              />
              <div className="flex justify-end">
                <span
                  className={getCharacterCountClass(
                    remaining.detail,
                    MAX_DETAIL_CHARS,
                  )}
                >
                  {remaining.detail} characters remaining
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t pt-4">
              <Select
                value={type}
                onValueChange={(value) => setType(value as PostType)}
              >
                <SelectTrigger className="w-[130px] h-8 px-2 text-sm">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {POST_TYPES.map((type) => (
                    <SelectItem key={type} value={type} className="text-sm">
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                onClick={handleSubmit}
                disabled={
                  !title.trim() ||
                  !description.trim() ||
                  !detail.trim() ||
                  counts.title > MAX_TITLE_CHARS ||
                  counts.description > MAX_DESCRIPTION_CHARS ||
                  counts.detail > MAX_DETAIL_CHARS ||
                  isSubmitting
                }
                className="bg-black text-white hover:bg-black/90"
                size="sm"
              >
                {isSubmitting ? "Posting..." : "Post"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
