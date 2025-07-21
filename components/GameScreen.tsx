import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import GameUI from './interface/GameUI';
import GameCanvas from './interface/GameCanvas';
import ExplosionOverlay from './interface/ExplosionOverlay';
import CollisionSparkOverlay from './interface/CollisionSparkOverlay';
import SpecialMissileButton from './interface/SpecialMissileButton';
import MissileSelector from './interface/MissileSelector';
import PlayerExplosionOverlay from './effects/PlayerExplosionOverlay';
import { useGameLogic } from '../hooks/useGameLogic';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function GameScreen() {
  const {
    playerX,
    playerY,
    score,
    playerHealth,
    gameOver,
    showGameOverOverlay,
    bullets,
    enemies,
    barriers,
    collectibles,
    explosions,
    collisionSparks,
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
    removeCollisionSpark,
    setShowGameOverOverlay,
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
            showGameOverOverlay={showGameOverOverlay}
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
            barriers={barriers}
            collectibles={collectibles}
            isSpecialMissileCharging={isSpecialMissileCharging}
            specialMissileChargeProgress={specialMissileChargeProgress}
            triggerSpecialFireEffect={triggerSpecialFireEffect}
          />
          
          {/* Explosion Effects Overlay */}
          <ExplosionOverlay
            explosions={explosions}
            onExplosionFinish={removeExplosion}
          />
          
          {/* Collision Spark Effects Overlay */}
          <CollisionSparkOverlay
            collisionSparks={collisionSparks}
            onSparkFinish={removeCollisionSpark}
          />
          
          {/* Player Explosion Overlay */}
          <PlayerExplosionOverlay
            isGameOver={gameOver}
            playerX={playerX}
            playerY={playerY}
            onExplosionComplete={React.useCallback(() => {
              setShowGameOverOverlay(true);
              console.log('Player explosion complete - showing game over overlay');
            }, [setShowGameOverOverlay])}
            variant="advanced"
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
