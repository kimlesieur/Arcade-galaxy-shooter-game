import { Bullet } from '../components/game/types';

// Base missile configuration interface
export interface MissileConfig {
  id: string;
  name: string;
  radius: number;
  velocityY: number;
  damage: number;
  collisionRadiusMultiplier: number;
  fireRate: number; // milliseconds between shots
  visualEffects: {
    color: string;
    trailLength: number;
    pulseScale: number;
    sizeMultiplier: number;
    particleCount: number;
  };
  audio: {
    soundType: 'shoot' | 'special' | 'laser' | 'shotgun';
    hapticFeedback: 'light' | 'medium' | 'heavy' | 'rigid';
  };
  description: string;
}

// Missile configurations
export const MISSILE_CONFIGS: Record<string, MissileConfig> = {
  normal: {
    id: 'normal',
    name: 'Standard Bullet',
    radius: 6,
    velocityY: -500,
    damage: 1,
    collisionRadiusMultiplier: 1,
    fireRate: 700,
    visualEffects: {
      color: '#ffff00',
      trailLength: 0,
      pulseScale: 1,
      sizeMultiplier: 1,
      particleCount: 0,
    },
    audio: {
      soundType: 'shoot',
      hapticFeedback: 'light',
    },
    description: 'Basic projectile with standard damage and speed',
  },

  special: {
    id: 'special',
    name: 'Special Missile',
    radius: 12,
    velocityY: -600,
    damage: 3,
    collisionRadiusMultiplier: 10,
    fireRate: 0, // Manual fire only
    visualEffects: {
      color: '#ff6b35',
      trailLength: 12,
      pulseScale: 1.2,
      sizeMultiplier: 3.0,
      particleCount: 8,
    },
    audio: {
      soundType: 'special',
      hapticFeedback: 'heavy',
    },
    description: 'Powerful missile with wide area of effect and spectacular visual effects',
  },

  sniper: {
    id: 'sniper',
    name: 'Sniper Bullet',
    radius: 4,
    velocityY: -800,
    damage: 2,
    collisionRadiusMultiplier: 0.5,
    fireRate: 1200,
    visualEffects: {
      color: '#00ffff',
      trailLength: 3,
      pulseScale: 1,
      sizeMultiplier: 0.8,
      particleCount: 0,
    },
    audio: {
      soundType: 'laser',
      hapticFeedback: 'medium',
    },
    description: 'Precise, fast bullet with small hitbox but high damage and accuracy',
  },

  shotgun: {
    id: 'shotgun',
    name: 'Shotgun Spread',
    radius: 8,
    velocityY: -400,
    damage: 1,
    collisionRadiusMultiplier: 1.5,
    fireRate: 1000,
    visualEffects: {
      color: '#ff8800',
      trailLength: 6,
      pulseScale: 1.1,
      sizeMultiplier: 1.2,
      particleCount: 4,
    },
    audio: {
      soundType: 'shotgun',
      hapticFeedback: 'medium',
    },
    description: 'Wide spread projectile with increased collision area and spread effects',
  },

  laser: {
    id: 'laser',
    name: 'Laser Beam',
    radius: 10,
    velocityY: -700,
    damage: 2,
    collisionRadiusMultiplier: 6.0,
    fireRate: 900,
    visualEffects: {
      color: '#ff0080',
      trailLength: 15,
      pulseScale: 1.3,
      sizeMultiplier: 2.0,
      particleCount: 6,
    },
    audio: {
      soundType: 'laser',
      hapticFeedback: 'rigid',
    },
    description: 'High-speed laser with very wide area of effect and continuous beam trail',
  },
};

// Helper function to create a bullet from a missile config
export function createBulletFromConfig(
  configId: string,
  x: number,
  y: number,
  isPlayer: boolean = true
): Bullet {
  const config = MISSILE_CONFIGS[configId];
  if (!config) {
    throw new Error(`Unknown missile config: ${configId}`);
  }

  return {
    id: Math.random().toString(36).substr(2, 9),
    x,
    y,
    velocityX: 0,
    velocityY: config.velocityY,
    isPlayer,
    damage: config.damage,
    radius: config.radius,
    type: configId as 'normal' | 'special',
    collisionRadiusMultiplier: config.collisionRadiusMultiplier,
  };
}

// Helper function to get missile config by ID
export function getMissileConfig(configId: string): MissileConfig {
  const config = MISSILE_CONFIGS[configId];
  if (!config) {
    throw new Error(`Unknown missile config: ${configId}`);
  }
  return config;
}

// Helper function to get all available missile configs
export function getAllMissileConfigs(): MissileConfig[] {
  return Object.values(MISSILE_CONFIGS);
}

// Helper function to get missile configs by type (for filtering)
export function getMissileConfigsByType(type: 'automatic' | 'manual'): MissileConfig[] {
  return getAllMissileConfigs().filter(config => {
    if (type === 'automatic') {
      return config.fireRate > 0; // Automatic missiles have fire rate > 0
    } else {
      return config.fireRate === 0; // Manual missiles have fire rate = 0
    }
  });
} 