import useSWR from 'swr';
import axios from 'axios';
import type { Post } from '@/types';

interface PostsResponse {
  posts: Post[];
  nextCursor: string | null;
}

export function usePosts(cursor?: string) {
  const { data, error, isLoading, mutate } = useSWR<PostsResponse, Error>(
    `/api/posts${cursor ? `?cursor=${cursor}` : ''}`,
    async (url: string) => {
      const response = await axios.get(url);
      return response.data;
    },
  );

  return {
    posts: data?.posts || [],
    nextCursor: data?.nextCursor,
    isLoading,
    isError: error,
    refresh: mutate,
  };
}