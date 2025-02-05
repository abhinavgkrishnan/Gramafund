"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useNeynarContext } from "@neynar/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { Plus } from "lucide-react";
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

const POST_TYPES = ["Project", "Comment", "Reaction", "Funding"] as const;
type PostType = (typeof POST_TYPES)[number];

const MAX_TITLE_CHARS = 40;
const MAX_DESCRIPTION_CHARS = 300;
const MAX_DETAIL_CHARS = 1000;
const MAX_LINK_CHARS = 200;

interface CastModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CastModal({
  open: externalOpen,
  onOpenChange,
}: CastModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter(); // Import useRouter hook

  // Combine internal and external state
  const isOpen = externalOpen ?? internalOpen;
  const handleOpenChange = onOpenChange ?? setInternalOpen;

  // Handle frame redirect
  useEffect(() => {
    if (searchParams.get("openModal") === "true") {
      handleOpenChange(true);
    }
  }, [searchParams, handleOpenChange]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [detail, setDetail] = useState("");
  const [links, setLinks] = useState("");
  const [requestedFunding, setRequestedFunding] = useState<number | "">("");
  const [fundingError, setFundingError] = useState("");
  const [type, setType] = useState<PostType>("Project");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useNeynarContext();
  const { toast } = useToast();

  const counts = {
    title: title.length,
    description: description.length,
    detail: detail.length,
    links: links.length,
  };

  const remaining = {
    title: MAX_TITLE_CHARS - counts.title,
    description: MAX_DESCRIPTION_CHARS - counts.description,
    detail: MAX_DETAIL_CHARS - counts.detail,
    links: MAX_LINK_CHARS - counts.links,
  };

  const handleSubmit = async () => {
    if (!user?.signer_uuid) {
      toast({
        description: "Please sign in with Farcaster first",
        variant: "destructive",
      });
      return;
    }

    if (
      !title.trim() ||
      !description.trim() ||
      !detail.trim() ||
      requestedFunding === ""
    ) {
      toast({
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (requestedFunding <= 0) {
      setFundingError("Requested funding must be greater than 0");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post("/api/cast", {
        signerUuid: user.signer_uuid,
        title,
        description,
        detail,
        requestedFunding,
        type,
        channel: "gramafund",
        links,
      });

      toast({
        description: "Cast published successfully",
      });

      setTitle("");
      setDescription("");
      setDetail("");
      setLinks("");
      setType("Project");
      handleOpenChange(false);

      const postId = response.data.data.cast.hash;
      router.push(`/posts/${postId}`);
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

  const inputStyles =
    "w-full bg-gray-50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:bg-gray-100";

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          className="fixed bottom-6 right-6 h-12 w-12 rounded-full bg-black shadow-lg hover:bg-black/90"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100%-32px)] max-w-[600px] h-[80vh] max-h-[80vh] p-4 md:p-6 top-[50%] rounded-xl overflow-y-auto">
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
              <p className="text-xs text-muted-foreground">
                Name of the organization or project
              </p>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_TITLE_CHARS) {
                    setTitle(e.target.value);
                  }
                }}
                maxLength={MAX_TITLE_CHARS}
                className={inputStyles}
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

            {/* Requested Funding Section */}
            <div className="space-y-1">
              <label className="text-sm font-medium">
                Requested Funding ($)
              </label>
              <p className="text-xs text-muted-foreground">
                Enter amount in dollars
              </p>
              <input
                type="number"
                value={requestedFunding}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  if (isNaN(value) || value <= 0) {
                    setFundingError("Requested funding must be greater than 0");
                  } else {
                    setFundingError("");
                  }
                  setRequestedFunding(e.target.value === "" ? "" : value);
                }}
                className={inputStyles}
              />
              {fundingError && (
                <div className="text-red-600 text-xs">{fundingError}</div>
              )}
            </div>

            {/* Description Section */}
            <div className="space-y-1">
              <label className="text-sm font-medium">
                What does your project do?
              </label>
              <p className="text-xs text-muted-foreground">
                Please describe, in 1-3 sentences, your (or organization&apos;s)
                plan to defensively accelerate technology, via actions you will
                take over the next few years.
              </p>
              <textarea
                value={description}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_DESCRIPTION_CHARS) {
                    setDescription(e.target.value);
                  }
                }}
                maxLength={MAX_DESCRIPTION_CHARS}
                className={cn(inputStyles, "h-24 resize-none")}
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
              <label className="text-sm font-medium">Spending Plan</label>
              <p className="text-xs text-muted-foreground">
                Include mention of how your requested funding and resulting
                activities fit into that plan including timelines. Your project
                will be evaluated based on how the funding will be used during
                the timelines you specify. There is a 1000 character limit, but
                it&apos;s fine to give a very short explanation if you think
                that will be enough to make sense.
              </p>
              <textarea
                value={detail}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_DETAIL_CHARS) {
                    setDetail(e.target.value);
                  }
                }}
                maxLength={MAX_DETAIL_CHARS}
                className={cn(inputStyles, "h-40 resize-none")}
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

            {/* Optional Link */}
            <div className="space-y-1">
              <label className="text-sm font-medium">
                Links Of Interest (optional)
              </label>
              <p className="text-xs text-muted-foreground">
                Provide any links that may be of interest to potential funders.
                Separate multiple links with a new line.
              </p>
              <textarea
                value={links}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_LINK_CHARS) {
                    setLinks(e.target.value);
                  }
                }}
                maxLength={MAX_LINK_CHARS}
                className={cn(inputStyles, "h-40 resize-none")}
              />
              <div className="flex justify-end">
                <span
                  className={getCharacterCountClass(
                    remaining.links,
                    MAX_LINK_CHARS,
                  )}
                >
                  {remaining.links} characters remaining
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t pt-4">
              <Select
                value={type}
                onValueChange={(value) => setType(value as PostType)}
              >
                <SelectTrigger className="w-[130px] h-8 px-2 text-sm bg-background border">
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
                  isSubmitting ||
                  !requestedFunding
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
