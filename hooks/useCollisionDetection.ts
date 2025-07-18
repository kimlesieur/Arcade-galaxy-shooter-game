import { useEffect } from 'react';
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
  useEffect(() => {
    if (gameOver) return;
    let animationFrameId: number;
    let running = true;
    
    const loop = () => {
      if (!running) return;
      
      // Collision detection and scoring
      setBullets((prevBullets) => {
        const newBullets = [...prevBullets];
        
        setEnemies((prevEnemies) => {
          const newEnemies = [...prevEnemies];
          
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
                
                // Scoring
                if (isSpecialMissile) {
                  addScore(enemy.type === 'purple' ? 5 : 3);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                } else {
                  addScore(enemy.type === 'purple' ? 2 : 1);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                }
                
                // Create explosion
                addExplosion(enemyX, enemyY, enemy.type);
                
                // For regular bullets, destroy the bullet and break
                if (!isSpecialMissile) {
                  newBullets.splice(j, 1);
                  bulletDestroyed = true;
                  break;
                }
                // For special missiles, continue checking other enemies
              }
            }
            
            // Remove special missile if it was destroyed
            if (isSpecialMissile && bulletDestroyed) {
              newBullets.splice(j, 1);
            }
          }
          
          return newEnemies;
        });
        
        return newBullets;
      });
      
      // Enemy-player collision detection
      setEnemies((prevEnemies) => {
        const newEnemies = [...prevEnemies];
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
            // Haptic feedback on collision
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
            // Play collision sound
            playCollisionSound();
            decrementHealth();
          }
        }
        return newEnemies;
      });

      animationFrameId = requestAnimationFrame(loop);
    };
    
    animationFrameId = requestAnimationFrame(loop);
    return () => {
      running = false;
      cancelAnimationFrame(animationFrameId);
    };
  }, [gameOver, playerX, playerY, bullets, enemies]);
}; 