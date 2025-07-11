import React, { useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Canvas } from '@shopify/react-native-skia';
import {
  GestureHandlerRootView,
  GestureDetector,
  Gesture,
} from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import GameRenderer from './game/GameRenderer';
import Starfield from './game/Starfield';
import { Bullet } from './game/types';
import { isOffScreen } from './game/utils';

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
    }, 200); // fire every 200ms
    return () => clearInterval(interval);
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
            <Canvas style={{ flex: 1 }}>
              <GameRenderer
                playerX={playerX}
                playerY={playerY}
                screenWidth={SCREEN_WIDTH}
                screenHeight={SCREEN_HEIGHT}
                bullets={bullets}
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
