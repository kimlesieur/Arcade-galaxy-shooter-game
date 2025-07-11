import React, { useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Canvas } from '@shopify/react-native-skia';
import { GestureHandlerRootView, GestureDetector, Gesture } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import GameRenderer from './game/GameRenderer';
import Starfield from './game/Starfield';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function GameScreen() {
  const [playerX, setPlayerX] = useState(SCREEN_WIDTH / 2);
  const playerY = SCREEN_HEIGHT - 180;

  // Pan gesture for moving the player ship
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      const newX = Math.max(30, Math.min(SCREEN_WIDTH - 30, event.absoluteX));
      runOnJS(setPlayerX)(newX);
    });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={panGesture}>
        <View style={styles.container}>
          <Starfield width={SCREEN_WIDTH} height={SCREEN_HEIGHT} starCount={20} />
          <Canvas style={{ flex: 1 }}>
            <GameRenderer
              playerX={playerX}
              playerY={playerY}
              screenWidth={SCREEN_WIDTH}
              screenHeight={SCREEN_HEIGHT}
            />
          </Canvas>
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