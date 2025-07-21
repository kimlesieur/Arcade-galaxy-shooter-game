// Barrier configuration interface
export interface BarrierConfig {
  id: string;
  name: string;
  speed: number; // Speed in units per second
  damage: number; // Damage dealt to player on collision
  color: string;
  spawnChance: number;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  properties: {
    segmentCount: number; // Number of barrier segments
    segmentWidth: number; // Width of each segment (0-1, as fraction of screen width)
    segmentGap: number; // Gap between segments (0-1, as fraction of screen width)
    openingWidth: number; // Width of the opening (0-1, as fraction of screen width)
    segmentHeight: number; // Height of each segment (0-1, as fraction of screen height)
  };
}

// Barrier configurations for different types
export const BARRIER_CONFIGS: Record<string, BarrierConfig> = {
  classic: {
    id: 'classic',
    name: 'Classic Barrier',
    speed: 60, // Slow moving
    damage: 1,
    color: '#888888',
    spawnChance: 0.3,
    description: 'Standard barrier with moderate difficulty',
    difficulty: 'easy',
    properties: {
      segmentCount: 8,
      segmentWidth: 0.08,
      segmentGap: 0.02,
      openingWidth: 0.25,
      segmentHeight: 0.03,
    },
  },

  fire: {
    id: 'fire',
    name: 'Fire Barrier',
    speed: 60, // Medium speed
    damage: 2,
    color: '#ff4444',
    spawnChance: 0.25,
    description: 'Hot barrier that deals extra damage',
    difficulty: 'medium',
    properties: {
      segmentCount: 10,
      segmentWidth: 0.06,
      segmentGap: 0.015,
      openingWidth: 0.25,
      segmentHeight: 0.035,
    },
  },

  laser: {
    id: 'laser',
    name: 'Laser Barrier',
    speed: 60, // Fast moving
    damage: 3,
    color: '#00ffff',
    spawnChance: 0.2,
    description: 'Fast laser barrier with high damage',
    difficulty: 'hard',
    properties: {
      segmentCount: 12,
      segmentWidth: 0.05,
      segmentGap: 0.01,
      openingWidth: 0.25,
      segmentHeight: 0.04,
    },
  },

  electric: {
    id: 'electric',
    name: 'Electric Barrier',
    speed: 60, // Medium speed
    damage: 2,
    color: '#ffff00',
    spawnChance: 0.15,
    description: 'Electric barrier with chain damage',
    difficulty: 'medium',
    properties: {
      segmentCount: 9,
      segmentWidth: 0.07,
      segmentGap: 0.025,
      openingWidth: 0.25,
      segmentHeight: 0.032,
    },
  },

  plasma: {
    id: 'plasma',
    name: 'Plasma Barrier',
    speed: 60, // Fast speed
    damage: 4,
    color: '#ff00ff',
    spawnChance: 0.1,
    description: 'Deadly plasma barrier with maximum damage',
    difficulty: 'hard',
    properties: {
      segmentCount: 14,
      segmentWidth: 0.045,
      segmentGap: 0.008,
      openingWidth: 0.25,
      segmentHeight: 0.045,
    },
  },
};

// Helper function to get barrier config by type
export const getBarrierConfig = (type: string): BarrierConfig => {
  return BARRIER_CONFIGS[type] || BARRIER_CONFIGS.classic; // Default to classic if type not found
};

// Helper function to get all barrier types
export const getBarrierTypes = (): string[] => {
  return Object.keys(BARRIER_CONFIGS);
};

// Helper function to display barrier configuration summary
export const getBarrierConfigSummary = (): string => {
  return Object.values(BARRIER_CONFIGS)
    .map(config => `${config.name} (${config.id}): Speed=${config.speed}, Damage=${config.damage}, Opening=${config.properties.openingWidth}`)
    .join('\n');
}; 