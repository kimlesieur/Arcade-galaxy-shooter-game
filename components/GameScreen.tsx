import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { Canvas } from '@shopify/react-native-skia';
import {
  GestureHandlerRootView,
  GestureDetector,
  Gesture,
} from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import GameRenderer from './game/GameRenderer';
import Starfield from './game/Starfield';
import { Bullet, EnemyShip } from './game/types';
import { isOffScreen, checkCollision } from './game/utils';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function GameScreen() {
  const [playerX, setPlayerX] = useState(SCREEN_WIDTH / 2);
  const playerY = SCREEN_HEIGHT - 180;

  // Ref to always have latest player position
  const playerPosRef = React.useRef({ x: playerX, y: playerY });
  React.useEffect(() => {
    playerPosRef.current.x = playerX;
    playerPosRef.current.y = playerY;
  }, [playerX, playerY]);

  // Bullet state
  const [bullets, setBullets] = useState<Bullet[]>([]);

  // Shoot bullet function (now uses ref for position)
  const shootBullet = () => {
    setBullets((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substr(2, 9),
        x: playerPosRef.current.x,
        y: playerPosRef.current.y - 30, // just above the ship
        velocityX: 0,
        velocityY: -500, // pixels per second, upward
        isPlayer: true,
        damage: 1,
        radius: 6,
      },
    ]);
  };

  // Automatic shooting effect (no playerX/playerY in deps)
  React.useEffect(() => {
    const interval = setInterval(() => {
      shootBullet();
    }, 450); // fire every 450ms
    return () => clearInterval(interval);
  }, []);

  // Enemy state
  const [enemies, setEnemies] = useState<EnemyShip[]>([]);
  const ENEMY_WIDTH = 30;
  const ENEMY_HEIGHT = 20;
  const ENEMY_SPEED = 100;
  const ENEMY_SPAWN_INTERVAL = 1200;
  const spawnTimer = React.useRef(0);
  const lastFrameTime = React.useRef<number | null>(null);

  // Score state
  const [score, setScore] = useState(0);

  // Game loop for enemies and collision
  React.useEffect(() => {
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
        let updated = prev.map((enemy) => ({
          ...enemy,
          y: enemy.y + (enemy.speed * delta) / SCREEN_HEIGHT,
        }));
        updated = updated.filter(
          (enemy) => enemy.y * SCREEN_HEIGHT < SCREEN_HEIGHT + ENEMY_HEIGHT,
        );
        return updated;
      });

      // Spawn new enemy if enough time has passed
      if (spawnTimer.current >= ENEMY_SPAWN_INTERVAL) {
        spawnTimer.current -= ENEMY_SPAWN_INTERVAL;
        setEnemies((prev) => [
          ...prev,
          {
            id: Math.random().toString(36).substr(2, 9),
            x: Math.random(),
            y: 0,
            speed: ENEMY_SPEED,
          },
        ]);
      }

      // Collision detection and scoring
      setEnemies((prevEnemies) => {
        const newEnemies = [...prevEnemies];
        setBullets((prevBullets) => {
          const newBullets = [...prevBullets];
          for (let i = newEnemies.length - 1; i >= 0; i--) {
            const enemy = newEnemies[i];
            const enemyX = enemy.x * SCREEN_WIDTH;
            const enemyY = enemy.y * SCREEN_HEIGHT;
            for (let j = newBullets.length - 1; j >= 0; j--) {
              const bullet = newBullets[j];
              if (
                checkCollision(
                  bullet.x - bullet.radius,
                  bullet.y - bullet.radius,
                  bullet.radius * 2,
                  bullet.radius * 2,
                  enemyX - ENEMY_WIDTH / 2,
                  enemyY,
                  ENEMY_WIDTH,
                  ENEMY_HEIGHT
                )
              ) {
                // Remove enemy and bullet
                newEnemies.splice(i, 1);
                newBullets.splice(j, 1);
                setScore((s) => s + 1);
                break;
              }
            }
          }
          return newBullets;
        });
        return newEnemies;
      });

      animationFrameId = requestAnimationFrame(loop);
    };
    animationFrameId = requestAnimationFrame(loop);
    return () => {
      running = false;
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Game loop for bullets
  React.useEffect(() => {
    let animationFrameId: number;
    let lastTime: number | null = null;
    const loop = (time: number) => {
      if (lastTime === null) {
        lastTime = time;
        animationFrameId = requestAnimationFrame(loop);
        return;
      }
      const delta = (time - lastTime) / 1000; // seconds
      lastTime = time;
      setBullets((prev) =>
        prev
          .map((b) => ({ ...b, y: b.y + b.velocityY * delta }))
          .filter((b) => !isOffScreen(b.x, b.y, SCREEN_WIDTH, SCREEN_HEIGHT))
      );
      animationFrameId = requestAnimationFrame(loop);
    };
    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Pan gesture for moving the player ship
  const panGesture = Gesture.Pan().onUpdate((event) => {
    const newX = Math.max(30, Math.min(SCREEN_WIDTH - 30, event.absoluteX));
    runOnJS(setPlayerX)(newX);
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={panGesture}>
        <View style={{ flex: 1 }}>
          <View style={styles.container}>
            <Starfield
              width={SCREEN_WIDTH}
              height={SCREEN_HEIGHT}
              starCount={20}
            />
            {/* Score Display */}
            <View style={{ position: 'absolute', top: 40, left: 20, zIndex: 10 }}>
              <View style={{ backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 8, padding: 8 }}>
                <Text style={{ color: '#fff', fontSize: 22, fontWeight: 'bold' }}>Score: {score}</Text>
              </View>
            </View>
            <Canvas style={{ flex: 1 }}>
              <GameRenderer
                playerX={playerX}
                playerY={playerY}
                screenWidth={SCREEN_WIDTH}
                screenHeight={SCREEN_HEIGHT}
                bullets={bullets}
                enemies={enemies}
              />
            </Canvas>
          </View>
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a23',
    position: 'relative', // Ensure children with absolute positioning are placed correctly
  },
});
