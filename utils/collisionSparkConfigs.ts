// Collision spark effect types enum
export enum CollisionSparkType {
  DEFAULT = 'default',
  INTENSE = 'intense',
  SUBTLE = 'subtle',
}

// Collision spark configuration interface
export interface CollisionSparkConfig {
  id: CollisionSparkType;
  name: string;
  particleCount: number;
  particleSpeed: number;
  particleSize: number;
  duration: number;
  colors: string[];
  hasFlash: boolean;
  hasSmallSparks: boolean;
  description: string;
}

// Collision spark configurations
export const COLLISION_SPARK_CONFIGS: Record<CollisionSparkType, CollisionSparkConfig> = {
  [CollisionSparkType.DEFAULT]: {
    id: CollisionSparkType.DEFAULT,
    name: 'Default Collision Sparks',
    particleCount: 15,
    particleSpeed: 250,
    particleSize: 4,
    duration: 800,
    colors: ['#ffff00', '#ffff80', '#ffffff', '#fffacd', '#f0e68c', '#ffeb3b', '#ffd700'],
    hasFlash: true,
    hasSmallSparks: true,
    description: 'Bright yellow/white sparks with flash effect',
  },

  [CollisionSparkType.INTENSE]: {
    id: CollisionSparkType.INTENSE,
    name: 'Intense Collision Sparks',
    particleCount: 20,
    particleSpeed: 300,
    particleSize: 5,
    duration: 1000,
    colors: ['#ffff00', '#ffeb3b', '#ffd700', '#ffffff', '#fff8dc', '#fafad2'],
    hasFlash: true,
    hasSmallSparks: true,
    description: 'More particles with higher speed and longer duration',
  },

  [CollisionSparkType.SUBTLE]: {
    id: CollisionSparkType.SUBTLE,
    name: 'Subtle Collision Sparks',
    particleCount: 12,
    particleSpeed: 150,
    particleSize: 3,
    duration: 400,
    colors: ['#ffff80', '#ffffff', '#fffacd'],
    hasFlash: false,
    hasSmallSparks: false,
    description: 'Minimal spark effect for subtle feedback',
  },
};

// Helper function to get collision spark config
export function getCollisionSparkConfig(configId: CollisionSparkType = CollisionSparkType.DEFAULT): CollisionSparkConfig {
  const config = COLLISION_SPARK_CONFIGS[configId];
  if (!config) {
    return COLLISION_SPARK_CONFIGS[CollisionSparkType.DEFAULT]; // Fallback to default
  }
  return config;
}

// Helper function to get all collision spark configs
export function getAllCollisionSparkConfigs(): CollisionSparkConfig[] {
  return Object.values(COLLISION_SPARK_CONFIGS);
} 