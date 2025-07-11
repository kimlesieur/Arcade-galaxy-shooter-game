import { Enemy } from './types';

export function checkCollision(
  x1: number,
  y1: number,
  w1: number,
  h1: number,
  x2: number,
  y2: number,
  w2: number,
  h2: number,
): boolean {
  return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
}

export function isOffScreen(
  x: number,
  y: number,
  screenWidth: number,
  screenHeight: number,
): boolean {
  return x < -50 || x > screenWidth + 50 || y < -50 || y > screenHeight + 50;
}

export function spawnEnemyWave(
  wave: number,
  screenWidth: number,
  callback: (enemies: Enemy[]) => void,
): void {
  const enemies: Enemy[] = [];
  const enemyCount = Math.min(3 + wave, 8);

  for (let i = 0; i < enemyCount; i++) {
    const enemyTypes: Enemy['type'][] = ['basic', 'fast', 'tank'];
    const type =
      enemyTypes[
        Math.floor(
          Math.random() * Math.min(enemyTypes.length, 1 + Math.floor(wave / 2)),
        )
      ];

    let enemy: Enemy;

    switch (type) {
      case 'fast':
        enemy = {
          id: `enemy-${Date.now()}-${i}`,
          x: (screenWidth / (enemyCount + 1)) * (i + 1) - 15,
          y: -30 - i * 50,
          width: 25,
          height: 25,
          velocityX: (Math.random() - 0.5) * 100,
          velocityY: 120 + wave * 10,
          health: 1,
          maxHealth: 1,
          type: 'fast',
          color: '#ffff00',
          points: 15,
        };
        break;

      case 'tank':
        enemy = {
          id: `enemy-${Date.now()}-${i}`,
          x: (screenWidth / (enemyCount + 1)) * (i + 1) - 20,
          y: -40 - i * 60,
          width: 40,
          height: 30,
          velocityX: 0,
          velocityY: 60 + wave * 5,
          health: 3,
          maxHealth: 3,
          type: 'tank',
          color: '#ff4444',
          points: 30,
        };
        break;

      default: // basic
        enemy = {
          id: `enemy-${Date.now()}-${i}`,
          x: (screenWidth / (enemyCount + 1)) * (i + 1) - 15,
          y: -30 - i * 40,
          width: 30,
          height: 20,
          velocityX: 0,
          velocityY: 80 + wave * 8,
          health: 2,
          maxHealth: 2,
          type: 'basic',
          color: '#00ff88',
          points: 10,
        };
        break;
    }

    enemies.push(enemy);
  }

  callback(enemies);
}

export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
