import { useState, useCallback, useEffect } from 'react';
import type { Activity, EmbeddingsResponse } from '../types';
import { API_ENDPOINTS } from '../config';

interface EmbeddingsCache {
  activities: Map<number, Activity>;
  isLoading: boolean;
  error: string | null;
}

export function useEmbeddingsCache() {
  const [cache, setCache] = useState<EmbeddingsCache>({
    activities: new Map(),
    isLoading: false,
    error: null,
  });

  const fetchEmbeddings = useCallback(async () => {
    setCache(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await fetch(API_ENDPOINTS.embeddings);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: EmbeddingsResponse = await response.json();
      
      // Convert activities array to Map for efficient lookup
      const activitiesMap = new Map<number, Activity>();
      data.activities.forEach(activity => {
        activitiesMap.set(activity.id, activity);
      });
      
      setCache({
        activities: activitiesMap,
        isLoading: false,
        error: null,
      });
      
      console.log(`Loaded ${data.total} activities with embeddings`);
    } catch (error) {
      console.error('Error fetching embeddings:', error);
      setCache(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch embeddings',
      }));
    }
  }, []);

  const getActivityEmbedding = useCallback((activityId: number): number[] | null => {
    const activity = cache.activities.get(activityId);
    return activity?.embedding || null;
  }, [cache.activities]);

  const getActivityWithEmbedding = useCallback((activityId: number): Activity | null => {
    return cache.activities.get(activityId) || null;
  }, [cache.activities]);

  // Auto-fetch on mount
  useEffect(() => {
    if (cache.activities.size === 0 && !cache.isLoading && !cache.error) {
      fetchEmbeddings();
    }
  }, [cache.activities.size, cache.isLoading, cache.error, fetchEmbeddings]);

  return {
    activities: cache.activities,
    isLoading: cache.isLoading,
    error: cache.error,
    fetchEmbeddings,
    getActivityEmbedding,
    getActivityWithEmbedding,
  };
}
