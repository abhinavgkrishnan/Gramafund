import React from 'react';
import useSWR from 'swr';
import axios from 'axios';
import { useNeynarContext } from '@neynar/react';
import ImpactCurveEditor from './ImpactCurveEditor';
import ImpactCurveViewer from './ImpactCurveViewer';
import type { Post } from '@/types/index';

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

  // Check directly in the curveSubmissions array - we can derive the user's submission
  // by checking both regular replies and the existence of curve submissions
  const hasUserSubmitted = (post.replies?.some(reply => reply.authorFid === user?.fid) || 
                          curveSubmissions.length > 0) && user?.fid === post.authorFid;

  if (hasUserSubmitted && curveSubmissions.length > 0) {
    // If user has submitted, show their submission along with all submissions
    return (
      <ImpactCurveViewer 
        post={post}
        userSubmission={curveSubmissions[0]} // User's submission is the first one
        curveSubmissions={curveSubmissions}
      />
    );
  }

  return <ImpactCurveEditor post={post} />;
};

export default ImpactCurveContainer;