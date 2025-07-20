import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Canvas } from '@shopify/react-native-skia';
import GameRenderer from '../game/GameRenderer';
import Starfield from '../background/Starfield';
import { Bullet, EnemyShip } from '../game/types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface GameCanvasProps {
  playerX: number;
  playerY: number;
  bullets: Bullet[];
  enemies: EnemyShip[];
  isSpecialMissileCharging: boolean;
  specialMissileChargeProgress: number;
  triggerSpecialFireEffect: boolean;
}

export default function GameCanvas({
  playerX,
  playerY,
  bullets,
  enemies,
  isSpecialMissileCharging,
  specialMissileChargeProgress,
  triggerSpecialFireEffect,
}: GameCanvasProps) {
  return (
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
          enemies={enemies}
          isSpecialMissileCharging={isSpecialMissileCharging}
          specialMissileChargeProgress={specialMissileChargeProgress}
          triggerSpecialFireEffect={triggerSpecialFireEffect}
        />
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a23',
    position: 'relative',
  },
}); 