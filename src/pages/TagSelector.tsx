import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SelectedTags, TagGroups } from '../types';
import { GAME_CONFIG } from '../config';
import TagGroup from '../components/TagGroup';
import { getThemeClasses } from '../theme';

const TAG_GROUPS: TagGroups = {
  weather: {
    title: 'Weather',
    tags: ['sunny', 'cloudy', 'raining', 'snowy', 'stormy'],
    exclusive: true,
  },
  time: {
    title: 'Time',
    tags: ['morning', 'afternoon', 'evening', 'night'],
    exclusive: true,
  },
  season: {
    title: 'Season',
    tags: ['spring', 'summer', 'autumn', 'winter'],
    exclusive: true,
  },
  intensity: {
    title: 'Intensity',
    tags: ['chill', 'tired', 'exciting', 'energetic', 'intense'],
    exclusive: true,
  },
  mood: {
    title: 'Mood (Select Multiple)',
    tags: [
      'stressed', 'motivated', 'adventurous', 'nostalgic', 'romantic',
      'playful', 'focused', 'distracted', 'inspired', 'friendly',
      'shy', 'curious', 'analytical', 'emotional', 'burnt_out',
      'artistic', 'practical', 'hungry', 'natural', 'urban',
      'anxious', 'overwhelmed', 'upset', 'happy', 'festive',
    ],
    exclusive: false,
  },
};

export default function TagSelector() {
  const navigate = useNavigate();
  const [selectedTags, setSelectedTags] = useState<SelectedTags>({
    weather: null,
    time: null,
    season: null,
    intensity: null,
    mood: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const theme = getThemeClasses();

  const handleTagSelect = (group: keyof SelectedTags, tag: string) => {
    setSelectedTags((prev) => {
      if (group === 'mood') {
        const isSelected = prev.mood.includes(tag);
        return {
          ...prev,
          mood: isSelected ? prev.mood.filter((t) => t !== tag) : [...prev.mood, tag],
        };
      } else {
        return {
          ...prev,
          [group]: prev[group] === tag ? null : tag,
        };
      }
    });
  };

  const getTotalTags = () => {
    return (
      (selectedTags.weather ? 1 : 0) +
      (selectedTags.time ? 1 : 0) +
      (selectedTags.season ? 1 : 0) +
      (selectedTags.intensity ? 1 : 0) +
      selectedTags.mood.length
    );
  };

  const canStartGame = () => {
    const totalTags = getTotalTags();
    return totalTags >= GAME_CONFIG.minTags && totalTags <= GAME_CONFIG.maxTags;
  };

  const handleStartGame = () => {
    if (!canStartGame()) return;

    setIsLoading(true);

    // Build context tags array
    const contextTags = [
      selectedTags.weather,
      selectedTags.time,
      selectedTags.season,
      selectedTags.intensity,
      ...selectedTags.mood,
    ].filter((tag): tag is string => tag !== null && tag !== undefined);

    // Navigate to game page with tags in URL
    const tagsParam = contextTags.join(',');
    navigate(`/game?tags=${encodeURIComponent(tagsParam)}`);
  };

  const totalTags = getTotalTags();

  return (
    <div className={`min-h-screen ${theme.background} flex items-center justify-center p-4`}>
      <div className={`w-full max-w-4xl ${theme.card} overflow-hidden`}>
        {/* Header */}
        <div className={`bg-gradient-to-r from-[#D4A574] to-[#C8965C] text-white p-6 text-center`}>
          <h1 className="text-4xl font-light mb-1">WhatNow</h1>
          <p className="text-base opacity-90">AI-powered activity recommendations</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Tag Groups */}
          {(Object.keys(TAG_GROUPS) as Array<keyof SelectedTags>).map((groupKey) => (
            <TagGroup
              key={groupKey}
              title={TAG_GROUPS[groupKey].title}
              tags={TAG_GROUPS[groupKey].tags}
              selected={selectedTags[groupKey]}
              onTagSelect={(tag) => handleTagSelect(groupKey, tag)}
            />
          ))}

          {/* Selection Info */}
          <div className={`${theme.card} p-4`}>
            <h4 className={`font-semibold ${theme.textPrimary} mb-3 text-base`}>Selection Rules</h4>
            <ul className={`text-sm ${theme.textSecondary} space-y-1`}>
              <li>• Select any combination of tags (minimum {GAME_CONFIG.minTags}, maximum {GAME_CONFIG.maxTags} total)</li>
              <li>• You can select from any group: Weather, Time, Season, Intensity, or Mood</li>
              <li>• Mix and match however you want!</li>
            </ul>
            <div className={`mt-3 text-sm font-medium ${theme.textPrimary}`}>
              Selected: {totalTags} / {GAME_CONFIG.maxTags} tags
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={handleStartGame}
            disabled={!canStartGame() || isLoading}
            className={`w-full py-3 px-6 text-base font-medium transition-all duration-300 ${
              canStartGame() && !isLoading
                ? `${theme.buttonPrimary}`
                : 'bg-gray-300 text-gray-500 cursor-not-allowed rounded-full'
            }`}
          >
            {isLoading ? 'Starting Game...' : 'Get AI Recommendations'}
          </button>
        </div>
      </div>
    </div>
  );
}

