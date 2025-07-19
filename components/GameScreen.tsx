import React from 'react';
import { View, StyleSheet } from 'react-native';
import {
  GestureHandlerRootView,
  GestureDetector,
  Gesture,
} from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { Dimensions } from 'react-native';

import { useGameLogic } from '../hooks';
import { useGameObjectsStore } from '../stores/GameObjectsStore';
import { GameUI, GameCanvas, ExplosionOverlay, SpecialMissileButton } from './interface';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function GameScreen() {
  const {
    // Game state
    playerX,
    playerY,
    score,
    playerHealth,
    gameOver,
    
    // Game objects
    bullets,
    enemies,
    explosions,
    
    // Special missile state
    isSpecialMissileCharging,
    specialMissileChargeProgress,
    triggerSpecialFireEffect,
    
    // Actions
    setPlayerX,
    handleRestart,
    shootSpecialMissile,
    
    // Special missile actions
    setIsSpecialMissileCharging,
    setSpecialMissileChargeProgress,
  } = useGameLogic();

  // Get removeExplosion from the GameObjectsStore
  const { removeExplosion } = useGameObjectsStore();

  // Pan gesture for moving the player ship
  const panGesture = Gesture.Pan().onUpdate((event) => {
    const newX = Math.max(30, Math.min(SCREEN_WIDTH - 30, event.absoluteX));
    runOnJS(setPlayerX)(newX);
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={panGesture}>
        <View style={styles.container}>
          {/* Game UI Overlay */}
          <GameUI
            score={score}
            playerHealth={playerHealth}
            gameOver={gameOver}
            onRestart={handleRestart}
          />
          
          {/* Game Canvas */}
          <GameCanvas
            playerX={playerX}
            playerY={playerY}
            bullets={bullets}
            enemies={enemies}
            isSpecialMissileCharging={isSpecialMissileCharging}
            specialMissileChargeProgress={specialMissileChargeProgress}
            triggerSpecialFireEffect={triggerSpecialFireEffect}
          />
          
          {/* Explosion Effects Overlay */}
          <ExplosionOverlay
            explosions={explosions}
            onExplosionFinish={removeExplosion}
          />
          
          {/* Special Missile Button */}
          <SpecialMissileButton
            onSpecialMissileReady={shootSpecialMissile}
            onChargingStart={() => setIsSpecialMissileCharging(true)}
            onChargingEnd={() => setIsSpecialMissileCharging(false)}
            onChargeProgress={setSpecialMissileChargeProgress}
            disabled={gameOver}
          />
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a23',
    position: 'relative',
  },
});
