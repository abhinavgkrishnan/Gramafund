export interface Comment {
  id: string;
  author: string;
  authorPfp: string;
  authorFid: number;
  text: string;
  timestamp: string;
  likes: number;
  replies: number;
  nestedReplies: Comment[];
}

export type Post = {
  id: string;
  type: "Project" | "Comment" | "Reaction" | "Funding";
  title: string;
  description: string;
  detail: string;
  author: string;
  authorPfp?: string;
  date: string;
  karma: number;
  comments: number;
  tags: string[];
  replies?: Comment[];
  hasLiked?: boolean;
  authorFid?: number;
  curveSubmissions?: {
    xIntercept: number;
    yIntercept: number;
    middlePoint: { x: number; y: number };
  }[];
};

export interface Project {
  id: string;
  title: string;
  description: string;
  xIntercept: number;
  yIntercept: number;
  middlePoint: { x: number; y: number };
  color: string;
  curveSubmissions?: {
    xIntercept: number;
    yIntercept: number;
    middlePoint: { x: number; y: number };
  }[];
}

export interface CurvePoint {
  x: number;
  y: number;
}

export interface ProjectData {
  project: Project;
  points: CurvePoint[];
}
