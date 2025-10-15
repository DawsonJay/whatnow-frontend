import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { Activity, EmbeddingsResponse } from '../types';
import { API_ENDPOINTS } from '../config';

interface EmbeddingsContextValue {
  activities: Map<number, Activity>;
  isLoading: boolean;
  error: string | null;
  getActivityEmbedding: (activityId: number) => number[] | null;
  getActivityWithEmbedding: (activityId: number) => Activity | null;
}

const EmbeddingsContext = createContext<EmbeddingsContextValue | null>(null);

export function EmbeddingsProvider({ children }: { children: ReactNode }) {
  const [activities, setActivities] = useState<Map<number, Activity>>(new Map());
  const [isLoading, setIsLoading] = useState(true); // Start as loading
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmbeddings = async () => {
      console.log('🔄 Fetching embeddings from backend...');
      setIsLoading(true);
      setError(null);

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

        setActivities(activitiesMap);
        console.log(`✅ Loaded ${data.total} activities with embeddings (${data.embedding_dimension}D)`);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch embeddings';
        console.error('❌ Error fetching embeddings:', errorMessage);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmbeddings();
  }, []); // Only fetch once on mount

  const getActivityEmbedding = useCallback((activityId: number): number[] | null => {
    const activity = activities.get(activityId);
    return activity?.embedding || null;
  }, [activities]);

  const getActivityWithEmbedding = useCallback((activityId: number): Activity | null => {
    return activities.get(activityId) || null;
  }, [activities]);

  const value: EmbeddingsContextValue = {
    activities,
    isLoading,
    error,
    getActivityEmbedding,
    getActivityWithEmbedding,
  };

  return (
    <EmbeddingsContext.Provider value={value}>
      {children}
    </EmbeddingsContext.Provider>
  );
}

export function useEmbeddings() {
  const context = useContext(EmbeddingsContext);
  if (!context) {
    throw new Error('useEmbeddings must be used within an EmbeddingsProvider');
  }
  return context;
}

