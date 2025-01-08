"use client";

import axios from "axios";
import { QRCodeSVG } from 'qrcode.react';
import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface FarcasterUser {
  signer_uuid: string;
  public_key: string;
  status: string;
  signer_approval_url?: string;
  fid?: number;
  user?: {
    display_name: string;
    pfp_url: string;
  };
}

const POST_TYPES = ["Project", "Comment", "Reaction", "Funding"] as const;
type PostType = (typeof POST_TYPES)[number];

const LOCAL_STORAGE_KEYS = {
  FARCASTER_USER: "farcasterUser",
} as const;

export default function CreatePost() {
  const [loading, setLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [farcasterUser, setFarcasterUser] = useState<FarcasterUser | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [detail, setDetail] = useState("");
  const [type, setType] = useState<PostType>("Project");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load stored user data on mount
  useEffect(() => {
    const storedData = localStorage.getItem(LOCAL_STORAGE_KEYS.FARCASTER_USER);
    if (storedData) {
      setFarcasterUser(JSON.parse(storedData));
    }
  }, []);

  // Poll for signer approval status
  useEffect(() => {
    if (farcasterUser?.status === "pending_approval") {
      setIsCheckingStatus(true);
      const interval = setInterval(async () => {
        try {
          const response = await axios.get(`/api/frame/signer?signer_uuid=${farcasterUser.signer_uuid}`);
          console.log("Polling response:", response.data);

          if (response.data.status === "approved") {
            const updatedUser = response.data;
            localStorage.setItem(
              LOCAL_STORAGE_KEYS.FARCASTER_USER,
              JSON.stringify(updatedUser)
            );
            setFarcasterUser(updatedUser);
            clearInterval(interval);
          }
        } catch (error) {
          console.error("Error checking signer status:", error);
        } finally {
          setIsCheckingStatus(false);
        }
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [farcasterUser]);

  // Fetch user details using the fid
  useEffect(() => {
    const fetchUserDetails = async (fid: number) => {
      try {
        const response = await axios.get(`/api/frame/user?fid=${fid}`);
        const userData = response.data.users[0];
        setFarcasterUser((prevUser) => ({
          ...prevUser,
          user: {
            display_name: userData.display_name,
            pfp_url: userData.pfp_url,
          },
          signer_uuid: prevUser?.signer_uuid || '',
          public_key: prevUser?.public_key || '',
          status: prevUser?.status || '',
          signer_approval_url: prevUser?.signer_approval_url,
          fid: prevUser?.fid,
        }));
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    if (farcasterUser?.fid) {
      fetchUserDetails(farcasterUser.fid);
    }
  }, [farcasterUser?.fid]);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      await createAndStoreSigner();
    } catch (error) {
      console.error("Sign in failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const createAndStoreSigner = async () => {
    try {
      const response = await axios.post("/api/frame/signer");
      console.log("Signer creation response:", response.data);
  
      if (response.status === 200) {
        localStorage.setItem(
          LOCAL_STORAGE_KEYS.FARCASTER_USER,
          JSON.stringify(response.data)
        );
        setFarcasterUser(response.data);
      }
    } catch (error) {
      console.error("API Call failed:", error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    if (!farcasterUser?.signer_uuid) {
      alert("Please sign in first");
      return;
    }

    if (!title.trim() || !description.trim() || !detail.trim()) {
      alert("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post("/api/frame/cast", {
        signer_uuid: farcasterUser.signer_uuid,
        title,
        description,
        detail,
        type,
      });

      console.log("Cast response:", response.data);
      alert("Post created successfully!");

      // Clear form
      setTitle("");
      setDescription("");
      setDetail("");
      setType("Project");
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Failed to create post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || isCheckingStatus) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          {loading ? "Creating signer..." : "Checking signer status..."}
        </div>
      </div>
    );
  }

  if (!farcasterUser?.status) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Button
          onClick={handleSignIn}
          disabled={loading}
          className="px-6 py-3"
        >
          Sign in with Farcaster
        </Button>
      </div>
    );
  }

  if (farcasterUser.status === "pending_approval" && farcasterUser.signer_approval_url) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h2 className="text-xl font-bold mb-4">Approve Signer</h2>
        <QRCodeSVG value={farcasterUser.signer_approval_url} size={256} />
        <div className="text-center my-4">OR</div>
        <a
          href={farcasterUser.signer_approval_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          Click here to open in your mobile browser
        </a>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl p-4">
      <h1 className="text-2xl font-bold mb-6">Create New Post</h1>
      
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={farcasterUser.user?.pfp_url}
              alt={farcasterUser.user?.display_name || "User"}
            />
            <AvatarFallback>
              {farcasterUser.user?.display_name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <span className="text-lg font-medium">{farcasterUser.user?.display_name}</span>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <Textarea
            placeholder="Enter title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <Textarea
            placeholder="Enter description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Details</label>
          <Textarea
            placeholder="Enter details"
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            className="w-full h-32"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Type</label>
          <Select value={type} onValueChange={(value) => setType(value as PostType)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {POST_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? "Creating..." : "Create Post"}
        </Button>
      </div>
    </div>
  );
}
