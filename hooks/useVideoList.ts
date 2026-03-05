import { useState, useCallback } from 'react';
import { getPopularVideos } from '../services/bilibili';
import type { VideoItem } from '../services/types';

export function useVideoList() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (reset = false) => {
    if (loading) return;
    const nextPage = reset ? 1 : page;
    setLoading(true);
    try {
      const data = await getPopularVideos(nextPage);
      setVideos(prev => reset ? data : [...prev, ...data]);
      setPage(nextPage + 1);
    } catch (e) {
      console.error('Failed to load videos', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [loading, page]);

  const refresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    load(true);
  }, [load]);

  return { videos, loading, refreshing, load, refresh };
}
