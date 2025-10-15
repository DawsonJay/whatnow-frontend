import { useState, useCallback } from 'react';
import type { Activity, GameStartResponse } from '../types';
import { API_ENDPOINTS } from '../config';
import { useSessionAI } from './useSessionAI';
import { useEmbeddings } from '../context/EmbeddingsContext';

interface GameState {
  pool: Activity[];
  currentLeft: Activity | null;
  currentRight: Activity | null;
  sessionId: string | null;
  contextTags: string[];
}

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>({
    pool: [],
    currentLeft: null,
    currentRight: null,
    sessionId: null,
    contextTags: [],
  });

  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const { initializeSessionAI, trainSessionAI, rankActivities } = useSessionAI();
  const { activities: embeddingsCache, getActivityEmbedding } = useEmbeddings();

  const initializeGame = useCallback(
    (data: GameStartResponse, contextTags: string[]) => {
      // Initialize Session AI with Base AI weights first
      initializeSessionAI(data.base_ai_weights);
      
      // Rank activities using Session AI with the weights directly
      const rankedPool = rankActivities(data.recommendations, contextTags, embeddingsCache, data.base_ai_weights);
      
      // Pick first two activities from top of ranked list
      const leftActivity = rankedPool[0];
      const rightActivity = rankedPool[1] || rankedPool[0];

      setGameState({
        pool: rankedPool,
        currentLeft: leftActivity,
        currentRight: rightActivity,
        sessionId: data.session_id,
        contextTags,
      });
    },
    [initializeSessionAI, rankActivities, embeddingsCache]
  );

  const displayNextPair = useCallback((updatedPool: Activity[]) => {
    if (updatedPool.length < 2) {
      // Not enough activities to display a pair
      return { left: null, right: null };
    }

    // Select from top-ranked activities (top 20% or at least 2)
    const topCount = Math.max(2, Math.floor(updatedPool.length * 0.2));
    const topActivities = updatedPool.slice(0, topCount);
    
    const leftIndex = Math.floor(Math.random() * topActivities.length);
    const leftActivity = topActivities[leftIndex];

    let rightIndex;
    do {
      rightIndex = Math.floor(Math.random() * topActivities.length);
    } while (rightIndex === leftIndex && topActivities.length > 1);
    const rightActivity = topActivities[rightIndex];

    return { left: leftActivity, right: rightActivity };
  }, []);

  const fetchMoreRecommendations = useCallback(async () => {
    if (!gameState.contextTags.length) {
      console.warn('No context tags available for fetching more recommendations');
      return;
    }

    console.log('🔄 Fetching more recommendations...', {
      currentPoolSize: gameState.pool.length,
      contextTags: gameState.contextTags.slice(0, 3)
    });

    setIsLoadingMore(true);

    try {
      const response = await fetch(API_ENDPOINTS.gameStart, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gameState.contextTags),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: GameStartResponse = await response.json();
      console.log('✅ Fetched more recommendations:', {
        newCount: data.recommendations?.length,
        sessionId: data.session_id
      });

      // Add new recommendations to pool and re-rank
      setGameState((prev) => {
        const combinedPool = [...prev.pool, ...data.recommendations];
        const rankedPool = rankActivities(combinedPool, prev.contextTags, embeddingsCache);
        const nextPair = displayNextPair(rankedPool);
        
        console.log('📊 Updated pool:', {
          oldSize: prev.pool.length,
          newSize: combinedPool.length,
          rankedSize: rankedPool.length
        });
        
        return {
          ...prev,
          pool: rankedPool,
          currentLeft: nextPair.left,
          currentRight: nextPair.right,
        };
      });
    } catch (error) {
      console.error('❌ Error fetching more recommendations:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [gameState.contextTags, gameState.pool.length, displayNextPair, rankActivities, embeddingsCache]);

  const trainBaseAI = useCallback(
    async (activityId: number) => {
      if (!gameState.sessionId) return;

      try {
        console.log('🤖 Training Base AI:', {
          activityId,
          sessionId: gameState.sessionId,
          contextTags: gameState.contextTags.slice(0, 3)
        });

        const response = await fetch(API_ENDPOINTS.gameTrain, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            session_id: gameState.sessionId,
            chosen_activity_id: activityId,
            context_tags: gameState.contextTags,
          }),
        });

        if (response.ok) {
          console.log('✅ Base AI training successful');
        } else {
          console.warn('⚠️ Base AI training failed:', response.status);
        }
      } catch (error) {
        console.error('❌ Base AI training error:', error);
      }
    },
    [gameState.sessionId, gameState.contextTags]
  );

  const handleChoice = useCallback(
    async (winnerPosition: 'left' | 'right') => {
      const winner = winnerPosition === 'left' ? gameState.currentLeft : gameState.currentRight;
      const loser = winnerPosition === 'left' ? gameState.currentRight : gameState.currentLeft;

      if (!winner || !loser) return;

      // Remove loser from pool
      const updatedPool = gameState.pool.filter((activity) => activity.id !== loser.id);

      // Train Session AI with embedding
      const winnerEmbedding = getActivityEmbedding(winner.id);
      if (winnerEmbedding) {
        trainSessionAI(gameState.contextTags, winner.id, 1.0, winnerEmbedding);
      } else {
        console.warn(`No embedding found for winner activity ${winner.id}, skipping Session AI training`);
      }

      // Train Base AI via API
      await trainBaseAI(winner.id);

      // Re-rank remaining activities after training
      const rerankedPool = rankActivities(updatedPool, gameState.contextTags, embeddingsCache);

      // Check if we need more recommendations
      if (rerankedPool.length <= 1) {
        await fetchMoreRecommendations();
      } else {
        // Keep the winner in place, replace only the loser with next best-ranked
        const remainingPool = rerankedPool.filter((activity) => activity.id !== winner.id);
        const nextPair = displayNextPair(remainingPool);
        
        setGameState((prev) => ({
          ...prev,
          pool: rerankedPool,
          currentLeft: winnerPosition === 'left' ? winner : nextPair.left,
          currentRight: winnerPosition === 'right' ? winner : nextPair.right,
        }));
      }
    },
    [gameState, trainSessionAI, trainBaseAI, fetchMoreRecommendations, getActivityEmbedding, rankActivities, embeddingsCache, displayNextPair]
  );

  return {
    pool: gameState.pool,
    currentLeft: gameState.currentLeft,
    currentRight: gameState.currentRight,
    handleChoice,
    isLoadingMore,
    initializeGame,
  };
}



