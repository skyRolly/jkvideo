import { useState, useCallback } from 'react';
import { getComments } from '../services/bilibili';
import type { Comment } from '../services/types';

export function useComments(aid: number) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const load = useCallback(async () => {
    if (loading || !hasMore || !aid) return;
    setLoading(true);
    try {
      const data = await getComments(aid, page);
      if (data.length === 0) { setHasMore(false); return; }
      setComments(prev => [...prev, ...data]);
      setPage(p => p + 1);
    } catch (e) {
      console.error('Failed to load comments', e);
    } finally {
      setLoading(false);
    }
  }, [aid, page, loading, hasMore]);

  return { comments, loading, hasMore, load };
}
