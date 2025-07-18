import { useState, useEffect, useRef } from 'react';
import { Dimensions } from 'react-native';
import { EnemyShip } from '../components/game/types';
import { ENEMY_WIDTH, ENEMY_HEIGHT } from '../utils/constants';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const useEnemies = (
  gameOver: boolean,
  playerX: number,
  playerY: number,
  decrementHealth: () => void,
  playCollisionSound: () => void
) => {
  const [enemies, setEnemies] = useState<EnemyShip[]>([]);
  const ENEMY_SPEED = 100;
  const ENEMY_SPAWN_INTERVAL = 1200;
  const spawnTimer = useRef(0);
  const lastFrameTime = useRef<number | null>(null);
  const purpleEnemyCountRef = useRef(0);

  // Game loop for enemies and collision
  useEffect(() => {
    if (gameOver) return;
    let animationFrameId: number;
    let running = true;
    
    const loop = (timestamp: number) => {
      if (!running) return;
      if (lastFrameTime.current === null) {
        lastFrameTime.current = timestamp;
        animationFrameId = requestAnimationFrame(loop);
        return;
      }
      const delta = (timestamp - lastFrameTime.current) / 1000;
      lastFrameTime.current = timestamp;
      spawnTimer.current += delta * 1000;

      // Move and remove enemies
      setEnemies((prev) => {
        let updated: EnemyShip[] = prev.map((enemy) => ({
          ...enemy,
          y: enemy.y + (enemy.speed * delta) / SCREEN_HEIGHT,
        }));
        
        // Remove enemies that are off screen, and handle purple enemy effect
        updated = updated.filter((enemy) => {
          if (enemy.y * SCREEN_HEIGHT >= SCREEN_HEIGHT + ENEMY_HEIGHT) {
            if (enemy.type === 'purple') {
              decrementHealth();
              playCollisionSound();
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            }
            return false; // remove enemy
          }
          return true;
        });
        return updated;
      });

      // Spawn new enemy if enough time has passed
      if (spawnTimer.current >= ENEMY_SPAWN_INTERVAL) {
        spawnTimer.current -= ENEMY_SPAWN_INTERVAL;
        setEnemies((prev) => {
          // Calculate current purple ratio
          const totalEnemies = prev.length;
          const purpleEnemies = purpleEnemyCountRef.current;
          let type: 'red' | 'purple' = 'red';
          let color = '#ff3333';
          // Only allow 10% purple enemies
          if (totalEnemies > 0 && purpleEnemies / totalEnemies < 0.1 && Math.random() < 0.1) {
            type = 'purple';
            color = '#a259e6';
            purpleEnemyCountRef.current += 1;
          }
          return [
            ...prev,
            {
              id: Math.random().toString(36).substr(2, 9),
              x: Math.random(),
              y: 0,
              speed: ENEMY_SPEED,
              type,
              color,
            },
          ];
        });
      }

      animationFrameId = requestAnimationFrame(loop);
    };
    
    animationFrameId = requestAnimationFrame(loop);
    return () => {
      running = false;
      cancelAnimationFrame(animationFrameId);
    };
  }, [gameOver, playerX, playerY, decrementHealth, playCollisionSound]);

  const resetEnemies = () => {
    setEnemies([]);
    purpleEnemyCountRef.current = 0;
    spawnTimer.current = 0;
    lastFrameTime.current = null;
  };

  return {
    enemies,
    setEnemies,
    resetEnemies,
    purpleEnemyCountRef,
  };
}; 