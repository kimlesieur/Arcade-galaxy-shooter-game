import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Group, Path, Skia, Rect } from '@shopify/react-native-skia';
import { EnemyShip } from './types';

interface MinimalGameRendererProps {
  playerX: number;
  playerY: number;
  screenWidth: number;
  screenHeight: number;
}

const ENEMY_WIDTH = 30;
const ENEMY_HEIGHT = 20;
const ENEMY_SPEED = 100; // pixels per second
const ENEMY_SPAWN_INTERVAL = 1200; // ms

export default function GameRenderer({
  playerX,
  playerY,
  screenWidth,
  screenHeight,
}: MinimalGameRendererProps) {
  // Create player ship path
  const playerShipPath = useMemo(() => {
    const path = Skia.Path.Make();
    path.moveTo(0, 0);
    path.lineTo(-15, 20);
    path.lineTo(-8, 15);
    path.lineTo(0, 25);
    path.lineTo(8, 15);
    path.lineTo(15, 20);
    path.close();
    return path;
  }, []);

  // Enemy state
  const [enemies, setEnemies] = useState<EnemyShip[]>([
  ]);
  const lastFrameTime = useRef<number | null>(null);
  const spawnTimer = useRef<number>(0);

  // Game loop
  useEffect(() => {
    let animationFrameId: number;
    let running = true;

    const loop = (timestamp: number) => {
      if (!running) return;
      if (lastFrameTime.current === null) {
        lastFrameTime.current = timestamp;
        animationFrameId = requestAnimationFrame(loop);
        return;
      }
      const delta = (timestamp - lastFrameTime.current) / 1000; // seconds
      lastFrameTime.current = timestamp;
      spawnTimer.current += delta * 1000; // ms

      // Move and remove enemies
      setEnemies(prev => {
        let updated = prev.map(enemy => ({
          ...enemy,
          y: enemy.y + enemy.speed * delta / screenHeight,
        }));
        updated = updated.filter(enemy => (enemy.y * screenHeight) < (screenHeight + ENEMY_HEIGHT));
        return updated;
      });

      // Spawn new enemy if enough time has passed
      if (spawnTimer.current >= ENEMY_SPAWN_INTERVAL) {
        spawnTimer.current -= ENEMY_SPAWN_INTERVAL;
        setEnemies(prev => [
          ...prev,
          {
            id: Math.random().toString(36).substr(2, 9),
            x: Math.random(),
            y: 0,
            speed: ENEMY_SPEED,
          },
        ]);
      }

      animationFrameId = requestAnimationFrame(loop);
    };
    animationFrameId = requestAnimationFrame(loop);
    return () => {
      running = false;
      cancelAnimationFrame(animationFrameId);
    };
  }, [screenHeight]);

  return (
    <>
      {/* Render enemies */}
      {enemies.map(enemy => (
        <Group
          key={enemy.id}
          transform={[
            { translateX: enemy.x * screenWidth },
            { translateY: enemy.y * screenHeight },
          ]}
        >
          <Rect x={-ENEMY_WIDTH / 2} y={0} width={ENEMY_WIDTH} height={ENEMY_HEIGHT} color="#ff3333" />
        </Group>
      ))}
      {/* Player ship */}
      <Group
        transform={[
          { translateX: playerX },
          { translateY: playerY },
        ]}
      >
        <Path path={playerShipPath} color="#00ffff" />
      </Group>
    </>
  );
}