// Explosion configuration interface
export interface ExplosionConfig {
  id: string;
  name: string;
  particleCount: number;
  particleSpeed: number;
  particleSize: number;
  duration: number;
  colors: string[];
  effects: {
    hasShockwave: boolean;
    hasFlash: boolean;
    hasSmoke: boolean;
    hasSparks: boolean;
  };
  description: string;
}

// Explosion configurations for different bullet types
export const EXPLOSION_CONFIGS: Record<string, ExplosionConfig> = {
  normal: {
    id: 'normal',
    name: 'Standard Explosion',
    particleCount: 8,
    particleSpeed: 150,
    particleSize: 4,
    duration: 800,
    colors: ['#ff4444', '#ff6666', '#ff8888', '#ffaaaa'],
    effects: {
      hasShockwave: false,
      hasFlash: true,
      hasSmoke: false,
      hasSparks: false,
    },
    description: 'Basic explosion with simple particle effects',
  },

  special: {
    id: 'special',
    name: 'Spectacular Explosion',
    particleCount: 20,
    particleSpeed: 200,
    particleSize: 6,
    duration: 1200,
    colors: ['#ff6b35', '#ff8c42', '#ffad4f', '#ffce5c', '#ffef69'],
    effects: {
      hasShockwave: true,
      hasFlash: true,
      hasSmoke: true,
      hasSparks: true,
    },
    description: 'Massive explosion with multiple effects and particles',
  },

  sniper: {
    id: 'sniper',
    name: 'Precise Explosion',
    particleCount: 6,
    particleSpeed: 300,
    particleSize: 3,
    duration: 600,
    colors: ['#00ffff', '#33ffff', '#66ffff', '#99ffff'],
    effects: {
      hasShockwave: false,
      hasFlash: true,
      hasSmoke: false,
      hasSparks: true,
    },
    description: 'Fast, precise explosion with minimal particles',
  },

  shotgun: {
    id: 'shotgun',
    name: 'Spread Explosion',
    particleCount: 12,
    particleSpeed: 180,
    particleSize: 5,
    duration: 900,
    colors: ['#ff8800', '#ffaa33', '#ffcc66', '#ffee99'],
    effects: {
      hasShockwave: false,
      hasFlash: true,
      hasSmoke: true,
      hasSparks: false,
    },
    description: 'Wide spread explosion with smoke effects',
  },

  laser: {
    id: 'laser',
    name: 'Energy Explosion',
    particleCount: 15,
    particleSpeed: 250,
    particleSize: 4,
    duration: 1000,
    colors: ['#ff0080', '#ff3399', '#ff66b3', '#ff99cc', '#ffcce6'],
    effects: {
      hasShockwave: true,
      hasFlash: true,
      hasSmoke: false,
      hasSparks: true,
    },
    description: 'High-energy explosion with shockwave and sparks',
  },
};

// Helper function to get explosion config by bullet type
export function getExplosionConfig(bulletType: string): ExplosionConfig {
  const config = EXPLOSION_CONFIGS[bulletType];
  if (!config) {
    return EXPLOSION_CONFIGS.normal; // Fallback to normal explosion
  }
  return config;
}

// Helper function to get all explosion configs
export function getAllExplosionConfigs(): ExplosionConfig[] {
  return Object.values(EXPLOSION_CONFIGS);
} 