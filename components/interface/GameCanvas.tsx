import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Canvas } from '@shopify/react-native-skia';
import GameRenderer from '../game/GameRenderer';
import FractalGalaxyShader from '../background/FractalGalaxyShader';
import { Bullet, EnemyShip, Barrier, Collectible } from '../game/types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface GameCanvasProps {
  playerX: number;
  playerY: number;
  bullets: Bullet[];
  enemies: EnemyShip[];
  barriers: Barrier[];
  collectibles: Collectible[];
  isSpecialMissileCharging: boolean;
  specialMissileChargeProgress: number;
  triggerSpecialFireEffect: boolean;
}

export default function GameCanvas({
  playerX,
  playerY,
  bullets,
  enemies,
  barriers,
  collectibles,
  isSpecialMissileCharging,
  specialMissileChargeProgress,
  triggerSpecialFireEffect,
}: GameCanvasProps) {
  return (
    <View style={styles.container}>
      <FractalGalaxyShader
        width={SCREEN_WIDTH * 2}
        height={SCREEN_HEIGHT * 3}
      />
      <Canvas style={{ flex: 1 }}>
        <GameRenderer
          playerX={playerX}
          playerY={playerY}
          screenWidth={SCREEN_WIDTH}
          screenHeight={SCREEN_HEIGHT}
          bullets={bullets}
          enemies={enemies}
          barriers={barriers}
          collectibles={collectibles}
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