import React from "react";
import useSWR from "swr";
import axios from "axios";
import { useNeynarContext } from "@neynar/react";
import ImpactCurveEditor from "./ImpactCurveEditor";
import ImpactCurveViewer from "./ImpactCurveViewer";
import type { Post } from "@/types/index";

interface ImpactCurveContainerProps {
  projectId: string;
}

const ImpactCurveContainer: React.FC<ImpactCurveContainerProps> = ({ projectId }) => {
  const { user } = useNeynarContext();
  const fetcher = (url: string) => axios.get(url).then((res) => res.data.post);

  const { data: postData, error } = useSWR<{ post: Post }>(
    `/api/posts/${projectId}`,
    fetcher,
  );

  if (error) return <div>Error loading project</div>;
  if (!postData?.post) return <div>Loading...</div>;

  const post = postData.post;
  const curveSubmissions = post.curveSubmissions || [];

  // Find user's submission directly from curveSubmissions
  const userSubmission = curveSubmissions.find(
    submission => submission.authorFid === user?.fid
  );

  if (userSubmission) {
    return (
      <ImpactCurveViewer 
        post={post}
        userSubmission={userSubmission}
        curveSubmissions={curveSubmissions}
      />
    );
  }

  return <ImpactCurveEditor post={post} />;
};

export default ImpactCurveContainer;
