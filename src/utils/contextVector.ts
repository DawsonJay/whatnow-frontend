// Context vector builder for Session AI
// Builds 43-dimensional one-hot encoded vector from tags

// Tag positions: weather(0-4), time(5-8), season(9-12), intensity(13-17), mood(18-42)
const TAG_MAPPINGS = {
  weather: {
    'sunny': 0,
    'cloudy': 1,
    'raining': 2,
    'snowy': 3,
    'stormy': 4,
  },
  time: {
    'morning': 5,
    'afternoon': 6,
    'evening': 7,
    'night': 8,
  },
  season: {
    'spring': 9,
    'summer': 10,
    'autumn': 11,
    'winter': 12,
  },
  intensity: {
    'chill': 13,
    'tired': 14,
    'exciting': 15,
    'energetic': 16,
    'intense': 17,
  },
  mood: {
    'stressed': 18,
    'motivated': 19,
    'adventurous': 20,
    'nostalgic': 21,
    'romantic': 22,
    'playful': 23,
    'focused': 24,
    'distracted': 25,
    'inspired': 26,
    'friendly': 27,
    'shy': 28,
    'curious': 29,
    'analytical': 30,
    'emotional': 31,
    'burnt_out': 32,
    'artistic': 33,
    'practical': 34,
    'hungry': 35,
    'natural': 36,
    'urban': 37,
    'anxious': 38,
    'overwhelmed': 39,
    'upset': 40,
    'happy': 41,
    'festive': 42,
  },
};

export function buildContextVector(tags: string[]): number[] {
  const vector = new Array(43).fill(0);
  
  for (const tag of tags) {
    // Check each category for the tag
    for (const [category, mappings] of Object.entries(TAG_MAPPINGS)) {
      if (tag in mappings) {
        const index = mappings[tag as keyof typeof mappings];
        vector[index] = 1;
        break; // Tag can only be in one category
      }
    }
  }
  
  return vector;
}
