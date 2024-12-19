"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useNeynarContext } from "@neynar/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast"; // Updated import path
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

const CHANNELS = {
  memes: "Memes",
  test: "Test Channel",
} as const;

const MAX_CHARACTERS = 320;

export function CastModal() {
  const [cast, setCast] = useState("");
  const [channel, setChannel] = useState<keyof typeof CHANNELS>("test");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useNeynarContext();
  const { toast } = useToast();

  // Log the user object to check what we're getting
  console.log('Neynar user:', user);

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
        console.log('Sending cast request:', {
          signerUuid: user.signer_uuid,
          text: cast,
          channel,
        });
  
        const response = await axios.post("/api/cast", {
          signerUuid: user.signer_uuid,
          text: cast,
          channel,
        });
  
        console.log('Cast response:', response.data);
  
        toast({
          description: "Cast published successfully",
        });
  
        setCast("");
      } catch (error) {
        console.error("Detailed cast error:", error);
        
        if (axios.isAxiosError(error)) {
          console.error('Response data:', error.response?.data);
          const errorMessage = error.response?.data?.message || 
                             error.response?.data?.error || 
                             'Failed to publish cast';
          toast({
            description: errorMessage,
            variant: "destructive",
          });
          
          if (error.response?.status === 401) {
            console.log('Auth error - signer UUID:', user.signer_uuid);
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
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">New Cast</DialogTitle>
        </DialogHeader>
        <div className="flex gap-4 pt-4">
          <div className="flex-shrink-0">
            <Avatar className="h-10 w-10">
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
            <Textarea
              placeholder="What's on your mind?"
              value={cast}
              onChange={(e) => {
                if (e.target.value.length <= MAX_CHARACTERS) {
                  setCast(e.target.value);
                }
              }}
              maxLength={MAX_CHARACTERS}
              className="min-h-[150px] resize-none text-lg border-0 border-b focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
            />
            <div className="flex items-center justify-between border-t pt-4">
              <Select
                value={channel}
                onValueChange={(value) => setChannel(value as keyof typeof CHANNELS)}
              >
                <SelectTrigger className="w-[130px] h-8 px-2 text-sm border-0 bg-transparent hover:bg-accent">
                  <SelectValue placeholder="Select channel" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CHANNELS).map(([value, label]) => (
                    <SelectItem 
                      key={value} 
                      value={value}
                      className="text-sm"
                    >
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "text-sm",
                    remainingChars <= 20
                      ? "text-yellow-600"
                      : "text-muted-foreground",
                    remainingChars <= 0 ? "text-red-600" : ""
                  )}
                >
                  {remainingChars}
                </span>
                <Button
                  onClick={handleSubmit}
                  disabled={!cast.trim() || charCount > MAX_CHARACTERS || isSubmitting}
                  className="bg-black text-white hover:bg-black/90"
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