export interface GameState {
  score: number;
  lives: number;
  level: number;
  gameStatus: 'playing' | 'paused' | 'gameOver' | 'won';
  playerX: number;
  playerY: number;
  lastFireTime: number;
  fireRate: number;
  enemySpawnTimer: number;
  waveSpawnTimer: number;
  currentWave: number;
  enemiesRemaining: number;
}

export interface Enemy {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  velocityX: number;
  velocityY: number;
  health: number;
  maxHealth: number;
  type: 'basic' | 'fast' | 'tank' | 'boss';
  color: string;
  points: number;
  lastFireTime?: number;
  fireRate?: number;
}

export interface Projectile {
  id: string;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  isPlayer: boolean;
  damage: number;
  radius: number;
  type?: 'normal' | 'special' | 'sniper' | 'shotgun' | 'laser'; // Different missile types
  collisionRadiusMultiplier: number; // Multiplier for collision detection radius
}

export interface Explosion {
  id: string;
  x: number;
  y: number;
  scale: number;
  opacity: number;
  particles: {
    angle: number;
    speed: number;
    x: number;
    y: number;
  }[];
  type: 'enemy' | 'player';
  bulletType?: 'normal' | 'special' | 'sniper' | 'shotgun' | 'laser'; // What caused the explosion
  createdAt: number;
}

export interface PowerUp {
  id: string;
  x: number;
  y: number;
  type: 'extraLife' | 'rapidFire' | 'shield';
  velocityY: number;
  radius: number;
}

export interface Star {
  x: number;
  y: number;
  speed: number;
  size: number;
  opacity: number;
}

export interface EnemyShip {
  id: string;
  x: number; // horizontal position (0-1, as a fraction of screen width)
  y: number; // vertical position (0-1, as a fraction of screen height)
  speed: number; // downward speed in units per second
  type: 'red' | 'purple' | 'blue' | 'green' | 'orange'; // enemy type
  color: string; // color for rendering
  health: number; // current health
  maxHealth: number; // maximum health
  points: number; // points awarded when destroyed
}

export interface Barrier {
  id: string;
  y: number; // vertical position (0-1, as a fraction of screen height)
  speed: number; // downward speed in units per second
  type: 'classic' | 'fire' | 'laser' | 'electric' | 'plasma'; // barrier type
  color: string; // color for rendering
  damage: number; // damage dealt to player on collision
  openingPosition: number; // horizontal position of the opening (0-1, as a fraction of screen width)
  openingWidth: number; // width of the opening (0-1, as a fraction of screen width)
  segmentCount: number; // number of barrier segments
  segmentWidth: number; // width of each segment (0-1, as a fraction of screen width)
  segmentGap: number; // gap between segments (0-1, as a fraction of screen width)
  segmentHeight: number; // height of each segment (0-1, as a fraction of screen height)
}

export type Bullet = Projectile;
