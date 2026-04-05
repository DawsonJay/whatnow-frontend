// Application configuration (empty = same origin behind Caddy)

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export const API_ENDPOINTS = {
  gameStart: `${API_BASE_URL}/activities/game/start`,
  gameTrain: `${API_BASE_URL}/activities/game/train`,
  embeddings: `${API_BASE_URL}/activities/embeddings`,
} as const;

export const GAME_CONFIG = {
  minTags: 3,
  maxTags: 8,
  sessionAILearningRate: 0.8,
  contextDim: 43,
  embeddingDim: 384,
} as const;



