export interface Comment {
  id: string;
  author: string;
  authorPfp?: string;
  text: string;
  timestamp: string;
  likes: number;
  replies: number;
}

export type Post = {
  id: string;
  type: "Project" | "Comment" | "Reaction" | "Funding";
  title: string;
  description: string;
  author: string;
  authorPfp?: string;
  date: string;
  karma: number;
  comments: number;
  tags: string[];
  replies?: Comment[];
  hasLiked?: boolean;
  authorFid?: number;
};
