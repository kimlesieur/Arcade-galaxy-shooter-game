// Enemy configuration interface
export interface EnemyConfig {
  id: string;
  name: string;
  speed: number; // Speed in units per second
  health: number;
  points: number;
  color: string;
  spawnChance: number;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

// Enemy configurations for different types
export const ENEMY_CONFIGS: Record<string, EnemyConfig> = {
  red: {
    id: 'red',
    name: 'Basic Fighter',
    speed: 80, // Slower, easier to hit
    health: 1,
    points: 1,
    color: '#ff3333',
    spawnChance: 0.4,
    description: 'Standard enemy with moderate speed',
    difficulty: 'easy',
  },

  purple: {
    id: 'purple',
    name: 'Elite Fighter',
    speed: 120, // Faster, more challenging
    health: 2,
    points: 2,
    color: '#a259e6',
    spawnChance: 0.1,
    description: 'Fast enemy with higher health and points',
    difficulty: 'hard',
  },

  blue: {
    id: 'blue',
    name: 'Interceptor',
    speed: 100, // Medium speed
    health: 1,
    points: 1,
    color: '#4a90e2',
    spawnChance: 0.2,
    description: 'Balanced enemy with standard stats',
    difficulty: 'medium',
  },

  green: {
    id: 'green',
    name: 'Scout',
    speed: 140, // Very fast
    health: 1,
    points: 2,
    color: '#7ed321',
    spawnChance: 0.15,
    description: 'Fast but fragile enemy',
    difficulty: 'medium',
  },

  orange: {
    id: 'orange',
    name: 'Heavy Fighter',
    speed: 60, // Slow but tough
    health: 3,
    points: 3,
    color: '#f5a623',
    spawnChance: 0.15,
    description: 'Slow but heavily armored enemy',
    difficulty: 'hard',
  },
};

// Helper function to get enemy config by type
export const getEnemyConfig = (type: string): EnemyConfig => {
  return ENEMY_CONFIGS[type] || ENEMY_CONFIGS.red; // Default to red if type not found
};

// Helper function to get all enemy types
export const getEnemyTypes = (): string[] => {
  return Object.keys(ENEMY_CONFIGS);
};

// Helper function to display enemy configuration summary
export const getEnemyConfigSummary = (): string => {
  return Object.values(ENEMY_CONFIGS)
    .map(config => `${config.name} (${config.id}): Speed=${config.speed}, Health=${config.health}, Points=${config.points}`)
    .join('\n');
}; 