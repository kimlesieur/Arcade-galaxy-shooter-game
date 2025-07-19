import { useEffect, useCallback } from 'react';
import { Bullet, EnemyShip } from '../components/game/types';
import { checkCollision } from '../components/game/utils';
import { PLAYER_WIDTH, PLAYER_HEIGHT, ENEMY_WIDTH, ENEMY_HEIGHT } from '../utils/constants';
import * as Haptics from 'expo-haptics';
import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const useCollisionDetection = (
  gameOver: boolean,
  playerX: number,
  playerY: number,
  bullets: Bullet[],
  enemies: EnemyShip[],
  setBullets: React.Dispatch<React.SetStateAction<Bullet[]>>,
  setEnemies: React.Dispatch<React.SetStateAction<EnemyShip[]>>,
  addExplosion: (x: number, y: number, type: 'red' | 'purple') => void,
  addScore: (points: number) => void,
  decrementHealth: () => void,
  playCollisionSound: () => void,
  purpleEnemyCountRef: React.MutableRefObject<number>
) => {
  // Memoize collision detection functions to avoid recreating them on every render
  const checkBulletEnemyCollisions = useCallback(() => {
    if (gameOver || bullets.length === 0 || enemies.length === 0) return;

    const newBullets = [...bullets];
    const newEnemies = [...enemies];
    let bulletsChanged = false;
    let enemiesChanged = false;

    // Process bullets
    for (let j = newBullets.length - 1; j >= 0; j--) {
      const bullet = newBullets[j];
      const isSpecialMissile = bullet.type === 'special';
      let bulletDestroyed = false;

      // Check collision with all enemies
      for (let i = newEnemies.length - 1; i >= 0; i--) {
        const enemy = newEnemies[i];
        const enemyX = enemy.x * SCREEN_WIDTH;
        const enemyY = enemy.y * SCREEN_HEIGHT;

        // Regular collision detection for all bullets
        const collisionDetected = checkCollision(
          bullet.x - bullet.radius,
          bullet.y - bullet.radius,
          bullet.radius * 2,
          bullet.radius * 2,
          enemyX - ENEMY_WIDTH / 2,
          enemyY,
          ENEMY_WIDTH,
          ENEMY_HEIGHT
        );

        if (collisionDetected) {
          // Remove enemy
          if (enemy.type === 'purple') {
            purpleEnemyCountRef.current = Math.max(0, purpleEnemyCountRef.current - 1);
          }
          newEnemies.splice(i, 1);
          enemiesChanged = true;

          // Scoring - defer to next tick to avoid setState during render
          if (isSpecialMissile) {
            setTimeout(() => {
              addScore(enemy.type === 'purple' ? 5 : 3);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            }, 0);
          } else {
            setTimeout(() => {
              addScore(enemy.type === 'purple' ? 2 : 1);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }, 0);
          }

          // Create explosion - defer to next tick
          setTimeout(() => {
            addExplosion(enemyX, enemyY, enemy.type);
          }, 0);

          // For regular bullets, destroy the bullet and break
          if (!isSpecialMissile) {
            newBullets.splice(j, 1);
            bulletsChanged = true;
            bulletDestroyed = true;
            break;
          }
          // For special missiles, continue checking other enemies
        }
      }

      // Remove special missile if it was destroyed
      if (isSpecialMissile && bulletDestroyed) {
        newBullets.splice(j, 1);
        bulletsChanged = true;
      }
    }

    // Only update state if there were changes
    if (bulletsChanged) {
      setBullets(newBullets);
    }
    if (enemiesChanged) {
      setEnemies(newEnemies);
    }
  }, [gameOver, bullets, enemies, addScore, addExplosion, purpleEnemyCountRef, setBullets, setEnemies]);

  const checkPlayerEnemyCollisions = useCallback(() => {
    if (gameOver || enemies.length === 0) return;

    const newEnemies = [...enemies];
    let enemiesChanged = false;

    for (let i = newEnemies.length - 1; i >= 0; i--) {
      const enemy = newEnemies[i];
      const enemyX = enemy.x * SCREEN_WIDTH;
      const enemyY = enemy.y * SCREEN_HEIGHT;

      // Enemy-player collision (rectangle-rectangle)
      if (
        checkCollision(
          playerX - PLAYER_WIDTH / 2,
          playerY - PLAYER_HEIGHT / 2,
          PLAYER_WIDTH,
          PLAYER_HEIGHT,
          enemyX - ENEMY_WIDTH / 2,
          enemyY,
          ENEMY_WIDTH,
          ENEMY_HEIGHT
        )
      ) {
        // Remove enemy and decrement health
        if (enemy.type === 'purple') {
          purpleEnemyCountRef.current = Math.max(0, purpleEnemyCountRef.current - 1);
        }
        newEnemies.splice(i, 1);
        enemiesChanged = true;
        
        // Haptic feedback on collision
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
        // Play collision sound and decrement health - defer to next tick
        setTimeout(() => {
          playCollisionSound();
          decrementHealth();
        }, 0);
      }
    }

    // Only update state if there were changes
    if (enemiesChanged) {
      setEnemies(newEnemies);
    }
  }, [gameOver, enemies, playerX, playerY, decrementHealth, playCollisionSound, purpleEnemyCountRef, setEnemies]);

  // Run collision detection on every render cycle instead of animation loop
  useEffect(() => {
    if (gameOver) return;
    
    checkBulletEnemyCollisions();
    checkPlayerEnemyCollisions();
  }, [gameOver, checkBulletEnemyCollisions, checkPlayerEnemyCollisions]);
}; 