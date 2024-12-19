"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useNeynarContext } from "@neynar/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const MAX_CHARACTERS = 320;

export function CastModal() {
  const [cast, setCast] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useNeynarContext();
  const { toast } = useToast();

  const charCount = cast.length;
  const remainingChars = MAX_CHARACTERS - charCount;

  const handleSubmit = async () => {
    if (!user?.signer_uuid) {
      toast({
        description: "Please sign in with Farcaster first",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post("/api/cast", {
        signerUuid: user.signer_uuid,
        text: cast,
        channel: "gramafund", // hardcoded channel
      });
      console.log("Cast response:", response);

      toast({
        description: "Cast published successfully",
      });

      setCast("");
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
            <Textarea
              placeholder="What's on your mind?"
              value={cast}
              onChange={(e) => {
                if (e.target.value.length <= MAX_CHARACTERS) {
                  setCast(e.target.value);
                }
              }}
              maxLength={MAX_CHARACTERS}
              className="min-h-[120px] md:min-h-[150px] resize-none text-base md:text-lg focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
            />
            <div className="flex items-center justify-end border-t pt-3 md:pt-4">
              <div className="flex items-center gap-2 md:gap-3">
                <span
                  className={cn(
                    "text-sm",
                    remainingChars <= 20
                      ? "text-yellow-600"
                      : "text-muted-foreground",
                    remainingChars <= 0 ? "text-red-600" : "",
                  )}
                >
                  {remainingChars}
                </span>
                <Button
                  onClick={handleSubmit}
                  disabled={
                    !cast.trim() || charCount > MAX_CHARACTERS || isSubmitting
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
