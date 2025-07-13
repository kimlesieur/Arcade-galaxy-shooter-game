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
  type: 'red' | 'purple'; // enemy type
  color: string; // color for rendering
}

export type Bullet = Projectile;
