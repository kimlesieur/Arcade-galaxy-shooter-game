import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity } from 'react-native';
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

  // Score state
  const [score, setScore] = useState(0);
  // Player health state
  const [playerHealth, setPlayerHealth] = useState(3); // Start with 3 health
  // Game over state
  const [gameOver, setGameOver] = useState(false);

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
    if (gameOver) return;
    const interval = setInterval(() => {
      shootBullet();
    }, 700); // fire every 700ms
    return () => clearInterval(interval);
  }, [gameOver]);

  // Enemy state
  const [enemies, setEnemies] = useState<EnemyShip[]>([]);
  const ENEMY_WIDTH = 30;
  const ENEMY_HEIGHT = 20;
  const ENEMY_SPEED = 100;
  const ENEMY_SPAWN_INTERVAL = 1200;
  const spawnTimer = React.useRef(0);
  const lastFrameTime = React.useRef<number | null>(null);
  // Track purple enemy count
  const purpleEnemyCountRef = React.useRef(0);

  // Add a restart handler
  const handleRestart = () => {
    setScore(0);
    setPlayerHealth(3);
    setGameOver(false);
    setPlayerX(SCREEN_WIDTH / 2);
    setBullets([]);
    setEnemies([]);
    purpleEnemyCountRef.current = 0;
    spawnTimer.current = 0;
    lastFrameTime.current = null;
  };

  // Game loop for enemies and collision
  React.useEffect(() => {
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
              setPlayerHealth((h) => {
                const newHealth = h - 1;
                if (newHealth <= 0) setGameOver(true);
                return newHealth;
              });
              purpleEnemyCountRef.current = Math.max(0, purpleEnemyCountRef.current - 1);
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

      // Collision detection and scoring
      setEnemies((prevEnemies) => {
        const newEnemies = [...prevEnemies];
        setBullets((prevBullets) => {
          const newBullets = [...prevBullets];
          for (let i = newEnemies.length - 1; i >= 0; i--) {
            const enemy = newEnemies[i];
            const enemyX = enemy.x * SCREEN_WIDTH;
            const enemyY = enemy.y * SCREEN_HEIGHT;
            // Bullet-enemy collision
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
                if (enemy.type === 'purple') {
                  purpleEnemyCountRef.current = Math.max(0, purpleEnemyCountRef.current - 1);
                }
                newEnemies.splice(i, 1);
                newBullets.splice(j, 1);
                setScore((s) => s + (enemy.type === 'purple' ? 2 : 1));
                break;
              }
            }
            // Enemy-player collision (rectangle-rectangle)
            // Player ship: center at (playerX, playerY), size 40x40
            const PLAYER_WIDTH = 40;
            const PLAYER_HEIGHT = 40;
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
              setPlayerHealth((h) => {
                const newHealth = h - 1;
                if (newHealth <= 0) setGameOver(true);
                return newHealth;
              });
              // Only one collision per enemy per frame
              continue;
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
  }, [gameOver]);

  // Game loop for bullets
  React.useEffect(() => {
    if (gameOver) return;
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
  }, [gameOver]);

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
            {/* Health Display */}
            <View style={{ position: 'absolute', top: 40, right: 20, zIndex: 10 }}>
              <View style={{ backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 8, padding: 8 }}>
                <Text style={{ color: '#fff', fontSize: 22, fontWeight: 'bold' }}>Health: {playerHealth}</Text>
              </View>
            </View>
            {/* Game Over Overlay */}
            {gameOver && (
              <View style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0,0,0,0.7)',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 100,
              }}>
                <Text style={{ color: '#fff', fontSize: 40, fontWeight: 'bold', marginBottom: 20 }}>Game Over</Text>
                <Text style={{ color: '#fff', fontSize: 24, marginBottom: 40 }}>Score: {score}</Text>
                <TouchableOpacity
                  onPress={handleRestart}
                  style={{
                    backgroundColor: '#fff',
                    paddingVertical: 14,
                    paddingHorizontal: 40,
                    borderRadius: 8,
                    marginBottom: 10,
                  }}
                >
                  <Text style={{ color: '#0a0a23', fontSize: 22, fontWeight: 'bold' }}>Restart</Text>
                </TouchableOpacity>
              </View>
            )}
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
