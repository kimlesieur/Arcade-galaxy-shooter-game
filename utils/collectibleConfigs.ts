import { Collectible } from '../components/game/types';

// Base collectible configuration interface
export interface CollectibleConfig {
  id: string;
  name: string;
  type: 'health' | 'shield' | 'sniper' | 'shotgun' | 'laser';
  speed: number; // downward speed in units per second
  color: string; // color for rendering
  bonusValue: number; // bonus value
  duration: number; // duration in milliseconds (0 for permanent)
  spawnChance: number; // chance of spawning (0-1)
  description: string;
}

// Collectible configurations
export const COLLECTIBLE_CONFIGS: Record<string, CollectibleConfig> = {
  health: {
    id: 'health',
    name: 'Health Pack',
    type: 'health',
    speed: 60, // Slower than enemies for easier collection
    color: '#00ff00', // Green
    bonusValue: 1, // +1 health
    duration: 0, // Permanent
    spawnChance: 0.10, // 50% chance
    description: 'Restores 1 health point',
  },

  shield: {
    id: 'shield',
    name: 'Shield Generator',
    type: 'shield',
    speed: 60,
    color: '#0080ff', // Blue
    bonusValue: 1, // Shield level (placeholder for now)
    duration: 0, // Permanent (will be implemented later)
    spawnChance: 0.50, // 10% chance
    description: 'Provides shield protection (coming soon)',
  },

  sniper: {
    id: 'sniper',
    name: 'Sniper Ammo',
    type: 'sniper',
    speed: 60,
    color: '#00ffff', // Cyan
    bonusValue: 1,
    duration: 15000, // 15 seconds
    spawnChance: 0.20, // 20% chance (increased from 12%)
    description: 'Sniper weapon for 15 seconds',
  },

  shotgun: {
    id: 'shotgun',
    name: 'Shotgun Ammo',
    type: 'shotgun',
    speed: 60,
    color: '#ff8800', // Orange
    bonusValue: 1,
    duration: 15000, // 15 seconds
    spawnChance: 0.20, // 20% chance (increased from 12%)
    description: 'Shotgun weapon for 15 seconds',
  },

  laser: {
    id: 'laser',
    name: 'Laser Ammo',
    type: 'laser',
    speed: 60,
    color: '#ff0080', // Pink
    bonusValue: 1,
    duration: 15000, // 15 seconds
    spawnChance: 0, // 15% chance (increased from 10%)
    description: 'Laser weapon for 15 seconds',
  },
};

// Helper function to create a collectible from a config
export function createCollectibleFromConfig(
  configId: string,
  x: number,
  y: number = 0
): Collectible {
  const config = COLLECTIBLE_CONFIGS[configId];
  if (!config) {
    throw new Error(`Unknown collectible config: ${configId}`);
  }

  return {
    id: Math.random().toString(36).substr(2, 9),
    x,
    y,
    speed: config.speed,
    type: config.type,
    color: config.color,
    bonusValue: config.bonusValue,
    duration: config.duration,
    spawnChance: config.spawnChance,
  };
}

// Helper function to get collectible config by ID
export function getCollectibleConfig(configId: string): CollectibleConfig {
  const config = COLLECTIBLE_CONFIGS[configId];
  if (!config) {
    throw new Error(`Unknown collectible config: ${configId}`);
  }
  return config;
}

// Helper function to get all available collectible configs
export function getAllCollectibleConfigs(): CollectibleConfig[] {
  return Object.values(COLLECTIBLE_CONFIGS);
}

// Helper function to get collectible configs by type
export function getCollectibleConfigsByType(type: 'health' | 'shield' | 'weapon'): CollectibleConfig[] {
  return getAllCollectibleConfigs().filter(config => {
    if (type === 'health') {
      return config.type === 'health';
    } else if (type === 'shield') {
      return config.type === 'shield';
    } else if (type === 'weapon') {
      return ['normal', 'special', 'sniper', 'shotgun', 'laser'].includes(config.type);
    }
    return false;
  });
}

// Helper function to select a random collectible based on spawn chances
export function selectRandomCollectible(): CollectibleConfig {
  const configs = getAllCollectibleConfigs();
  const random = Math.random();
  let cumulativeChance = 0;
  
  for (const config of configs) {
    cumulativeChance += config.spawnChance;
    if (random <= cumulativeChance) {
      return config;
    }
  }
  
  // Fallback to first config if no match (shouldn't happen with proper probabilities)
  return configs[0];
} 