// Application configuration

export const API_BASE_URL = 'https://whatnow-backend-71bz.onrender.com';

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



