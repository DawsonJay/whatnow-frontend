// Type definitions for WhatNow application

export interface Activity {
  id: number;
  name: string;
  embedding?: number[]; // 384-dim vector from embeddings endpoint
}

export interface GameStartResponse {
  session_id: string;
  recommendations: Activity[];
  base_ai_weights: BaseAIWeights | null;
}

export interface BaseAIWeights {
  coef: number[][];  // Match backend format
  intercept: number[];
  classes: number[];
  is_fitted: boolean;
}

export interface EmbeddingsResponse {
  activities: Activity[];
  total: number;
  embedding_dimension: number;
}

export interface TrainRequest {
  session_id: string;
  chosen_activity_id: number;
  context_tags: string[];
}

export interface SelectedTags {
  weather: string | null;
  time: string | null;
  season: string | null;
  intensity: string | null;
  mood: string[];
}

export interface TagGroup {
  title: string;
  tags: string[];
  exclusive: boolean;
}

export type TagGroups = {
  weather: TagGroup;
  time: TagGroup;
  season: TagGroup;
  intensity: TagGroup;
  mood: TagGroup;
};



