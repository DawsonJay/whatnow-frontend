import { useState, useCallback } from 'react';
import type { BaseAIWeights, Activity } from '../types';
import { GAME_CONFIG } from '../config';
import { buildContextVector } from '../utils/contextVector';

interface SessionAI {
  weights: BaseAIWeights | null;
  learningRate: number;
}

export function useSessionAI() {
  const [sessionAI, setSessionAI] = useState<SessionAI>({
    weights: null,
    learningRate: GAME_CONFIG.sessionAILearningRate,
  });

  const initializeSessionAI = useCallback((baseAIWeights: BaseAIWeights | null) => {
    console.log('🔄 Initializing Session AI with weights:', baseAIWeights);
    if (baseAIWeights) {
      // Deep copy the weights to avoid mutating the original
      const copiedWeights: BaseAIWeights = {
        coef: baseAIWeights.coef.map(row => [...row]),
        intercept: [...baseAIWeights.intercept],
        classes: [...baseAIWeights.classes],
        is_fitted: baseAIWeights.is_fitted,
      };
      
      setSessionAI((prev) => ({
        ...prev,
        weights: copiedWeights,
      }));
      console.log('✅ Session AI initialized with weights');
    } else {
      console.warn('❌ No base AI weights provided to Session AI');
    }
  }, []);

  const predictScore = useCallback((
    contextVector: number[],
    activityEmbedding: number[],
    weights: BaseAIWeights
  ): number => {
    // Calculate dot product of context and embedding
    const dotProduct = contextVector.reduce((sum, val, i) => sum + val * activityEmbedding[i], 0);
    
    // Apply weights: score = dot(context, embedding) * coef[0] + intercept[0]
    const score = dotProduct * weights.coef[0][0] + weights.intercept[0];
    
    return score;
  }, []);

  const updateWeights = useCallback((
    contextVector: number[],
    activityEmbedding: number[],
    reward: number,
    weights: BaseAIWeights,
    learningRate: number
  ): void => {
    // Calculate current prediction
    const prediction = predictScore(contextVector, activityEmbedding, weights);
    
    // Calculate error
    const error = reward - prediction;
    
    // Calculate gradient and update weights
    for (let i = 0; i < contextVector.length; i++) {
      const gradient = learningRate * error * contextVector[i];
      weights.coef[0][i] += gradient;
    }
    
    // Update intercept
    weights.intercept[0] += learningRate * error;
  }, [predictScore]);

  const trainSessionAI = useCallback(
    (contextTags: string[], activityId: number, reward: number) => {
      if (!sessionAI.weights) {
        console.warn('Session AI weights not initialized');
        return;
      }

      // Build context vector from tags
      const contextVector = buildContextVector(contextTags);
      
      // For now, we need the activity embedding to train
      // This will be provided by the embeddings cache
      console.log('Session AI training:', {
        contextTags,
        activityId,
        reward,
        learningRate: sessionAI.learningRate,
        contextVectorLength: contextVector.length,
      });
      
      // Note: We need the activity embedding to actually train
      // This will be implemented when we integrate with embeddings cache
    },
    [sessionAI]
  );

  const rankActivities = useCallback((
    activities: Activity[],
    contextTags: string[],
    embeddingsCache: Map<number, Activity>
  ): Activity[] => {
    if (!sessionAI.weights) {
      console.warn('Session AI weights not initialized, returning original order');
      return activities;
    }

    const contextVector = buildContextVector(contextTags);
    
    // Score and sort activities
    const scoredActivities = activities
      .map(activity => {
        const cachedActivity = embeddingsCache.get(activity.id);
        const embedding = cachedActivity?.embedding;
        
        if (!embedding) {
          console.warn(`No embedding found for activity ${activity.id}`);
          return { activity, score: 0 };
        }
        
        const score = predictScore(contextVector, embedding, sessionAI.weights!);
        return { activity, score };
      })
      .sort((a, b) => b.score - a.score) // Sort by score descending
      .map(item => item.activity);
    
    return scoredActivities;
  }, [sessionAI.weights, predictScore]);

  return {
    sessionAI,
    initializeSessionAI,
    trainSessionAI,
    rankActivities,
  };
}



