"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useNeynarContext } from "@neynar/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
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

const MAX_TITLE_CHARACTERS = 100;
const MAX_DESCRIPTION_CHARACTERS = 320;

export function CastModal() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<PostType>("Project");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useNeynarContext();
  const { toast } = useToast();

  const titleCount = title.length;
  const descriptionCount = description.length;
  const remainingTitleChars = MAX_TITLE_CHARACTERS - titleCount;
  const remainingDescriptionChars =
    MAX_DESCRIPTION_CHARACTERS - descriptionCount;

  const handleSubmit = async () => {
    if (!user?.signer_uuid) {
      toast({
        description: "Please sign in with Farcaster first",
        variant: "destructive",
      });
      return;
    }

    if (!title.trim() || !description.trim()) {
      toast({
        description: "Please fill in both title and description",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post("/api/cast", {
        signerUuid: user.signer_uuid,
        title,
        description,
        type,
        channel: "gramafund",
      });
      console.log("response", response);

      toast({
        description: "Cast published successfully",
      });

      setTitle("");
      setDescription("");
      setType("Project");
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

        if (error.response?.status === 401) {
          toast({
            description: "Authentication error. Please try signing in again",
            variant: "destructive",
          });
        }
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

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-black text-white hover:bg-black/90">
          Cast
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100%-32px)] p-4 md:p-6 max-w-[440px] top-[50%] rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold md:text-xl">
            New Cast
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
          <div className="flex-1 space-y-3 md:space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="Title"
                value={title}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_TITLE_CHARACTERS) {
                    setTitle(e.target.value);
                  }
                }}
                maxLength={MAX_TITLE_CHARACTERS}
                className="border-0 border-b rounded-none px-0 text-lg focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <div className="flex justify-end">
                <span
                  className={cn(
                    "text-xs",
                    remainingTitleChars <= 20
                      ? "text-yellow-600"
                      : "text-muted-foreground",
                    remainingTitleChars <= 0 ? "text-red-600" : "",
                  )}
                >
                  {remainingTitleChars}
                </span>
              </div>
            </div>

            <Textarea
              placeholder="Description"
              value={description}
              onChange={(e) => {
                if (e.target.value.length <= MAX_DESCRIPTION_CHARACTERS) {
                  setDescription(e.target.value);
                }
              }}
              maxLength={MAX_DESCRIPTION_CHARACTERS}
              className="min-h-[120px] md:min-h-[150px] resize-none text-base md:text-sm focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
            />

            <div className="flex items-center justify-between border-t pt-3 md:pt-4">
              <Select
                value={type}
                onValueChange={(value) => setType(value as PostType)}
              >
                <SelectTrigger className="w-[110px] md:w-[130px] h-8 px-2 text-sm border-0 bg-transparent hover:bg-accent">
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

              <div className="flex items-center gap-2 md:gap-3">
                <span
                  className={cn(
                    "text-sm",
                    remainingDescriptionChars <= 20
                      ? "text-yellow-600"
                      : "text-muted-foreground",
                    remainingDescriptionChars <= 0 ? "text-red-600" : "",
                  )}
                >
                  {remainingDescriptionChars}
                </span>
                <Button
                  onClick={handleSubmit}
                  disabled={
                    !title.trim() ||
                    !description.trim() ||
                    titleCount > MAX_TITLE_CHARACTERS ||
                    descriptionCount > MAX_DESCRIPTION_CHARACTERS ||
                    isSubmitting
                  }
                  className="bg-black text-white hover:bg-black/90"
                  size="sm"
                >
                  {isSubmitting ? "Casting..." : "Cast"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
