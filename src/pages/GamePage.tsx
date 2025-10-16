import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { GameStartResponse } from '../types';
import { API_ENDPOINTS, GAME_CONFIG } from '../config';
import { useGameState } from '../hooks/useGameState';
import { useEmbeddings } from '../context/EmbeddingsContext';
import ActivityCard from '../components/ActivityCard';
import LoadingChecklist from '../components/LoadingChecklist';
import { getThemeClasses } from '../theme';

export default function GamePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const theme = getThemeClasses();

  // Get context tags from URL (memoized to prevent infinite loops)
  const contextTags = useMemo(() => {
    const tags = searchParams.get('tags')?.split(',') || [];
    return tags.filter((tag) => tag && tag.trim() !== '');
  }, [searchParams]);

  const { currentLeft, currentRight, handleChoice, isLoadingMore, initializeGame } = useGameState();
  const { isLoading: embeddingsLoading, error: embeddingsError } = useEmbeddings();

  useEffect(() => {
    // Validate tags
    if (contextTags.length < GAME_CONFIG.minTags) {
      navigate('/', { replace: true });
      return;
    }

    // Wait for embeddings to load before initializing game
    if (embeddingsLoading) {
      return;
    }

    if (embeddingsError) {
      setError(`Failed to load embeddings: ${embeddingsError}`);
      return;
    }

    initializeGameWithAPI();
  }, [contextTags, navigate, embeddingsLoading, embeddingsError]);

  const initializeGameWithAPI = async () => {
    try {
      setIsInitializing(true);
      setError(null);

      const response = await fetch(API_ENDPOINTS.gameStart, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contextTags),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const data: GameStartResponse = await response.json();

      if (!data.session_id || !data.recommendations || !Array.isArray(data.recommendations)) {
        throw new Error('Invalid response format from API');
      }

      initializeGame(data, contextTags);
    } catch (err) {
      console.error('Error initializing game:', err);
      setError(err instanceof Error ? err.message : 'Failed to start game');
    } finally {
      setIsInitializing(false);
    }
  };

  const handleBackToTags = () => {
    navigate('/', { replace: true });
  };

  if (isInitializing) {
    return (
      <div className={`min-h-screen ${theme.background} flex items-center justify-center p-4`}>
        <div className={`${theme.card} max-w-lg w-full mx-auto`}>
          <LoadingChecklist 
            message="Preparing your personalized recommendations..."
            onComplete={() => {
              // Optional: Add any completion logic here
              console.log('Loading checklist completed');
            }}
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${theme.background} flex items-center justify-center p-4`}>
        <div className={`${theme.card} p-8 max-w-md w-full text-center`}>
          <h2 className={`text-2xl font-bold ${theme.status.error} mb-4`}>Error</h2>
          <p className={`${theme.textPrimary} mb-6`}>{error}</p>
          <button
            onClick={handleBackToTags}
            className={`${theme.buttonPrimary}`}
          >
            ← Back to Tags
          </button>
        </div>
      </div>
    );
  }

  if (!currentLeft || !currentRight) {
    return (
      <div className={`min-h-screen ${theme.background} flex items-center justify-center`}>
        <LoadingSpinner message="Loading activities..." />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme.background} flex items-center justify-center p-2 sm:p-4`}>
      <div className={`w-full max-w-4xl ${theme.card} overflow-hidden min-h-[calc(100vh-1rem)] sm:min-h-[calc(100vh-2rem)] flex flex-col`}>
        {/* Header */}
        <div className={`bg-gradient-to-r from-[#D4A574] to-[#C8965C] text-white p-4 sm:p-6`}>
          <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
            <button
              onClick={handleBackToTags}
              className="bg-white text-[#2D2D2D] font-medium px-3 py-2 sm:px-4 rounded-full transition-all duration-150 hover:brightness-95 active:scale-95 text-sm sm:text-base"
            >
              ← Back to Tags
            </button>
            
            <div className="flex flex-wrap gap-1 sm:gap-2">
              {contextTags.map((tag) => (
                <span
                  key={tag}
                  className="bg-white text-[#2D2D2D] px-2 py-1 sm:px-3 rounded-full text-xs font-medium"
                >
                  {tag.replace('_', ' ')}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Content - Full height with centered cards */}
        <div className="flex-1 flex items-center justify-center p-3 sm:p-6">
          {/* Comparison Container */}
          <div className="flex flex-col items-center justify-center gap-3 sm:gap-6 w-full max-w-2xl">
            <ActivityCard activity={currentLeft} onChoose={() => handleChoice('left')} />

            <div className="flex justify-center items-center">
              <div className="text-2xl sm:text-4xl font-bold text-[#D4A574]">VS</div>
            </div>

            <ActivityCard activity={currentRight} onChoose={() => handleChoice('right')} />
          </div>
        </div>
      </div>
    </div>
  );
}



