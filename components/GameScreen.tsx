import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import GameUI from './interface/GameUI';
import GameCanvas from './interface/GameCanvas';
import ExplosionOverlay from './interface/ExplosionOverlay';
import SpecialMissileButton from './interface/SpecialMissileButton';
import MissileSelector from './interface/MissileSelector';
import { useGameLogic } from '../hooks/useGameLogic';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function GameScreen() {
  const {
    playerX,
    playerY,
    score,
    playerHealth,
    gameOver,
    bullets,
    enemies,
    explosions,
    isSpecialMissileCharging,
    specialMissileChargeProgress,
    triggerSpecialFireEffect,
    setPlayerX,
    handleRestart,
    shootSpecialMissile,
    setIsSpecialMissileCharging,
    setSpecialMissileChargeProgress,
    currentMissileType,
    setCurrentMissileType,
    removeExplosion,
  } = useGameLogic();

  // Pan gesture for player movement
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (!gameOver) {
        const newX = Math.max(30, Math.min(SCREEN_WIDTH - 30, event.absoluteX));
        runOnJS(setPlayerX)(newX);
      }
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
          
          {/* Missile Selector */}
          <MissileSelector
            currentMissileType={currentMissileType}
            onMissileTypeChange={setCurrentMissileType}
            disabled={gameOver}
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
  },
});
