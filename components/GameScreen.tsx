import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity, Platform } from 'react-native';
import { Canvas } from '@shopify/react-native-skia';
import { useSharedValue, runOnJS, useFrameCallback } from 'react-native-reanimated';
import { GestureHandlerRootView, GestureDetector, Gesture } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import GameRenderer from './game/GameRenderer';
import { GameState, Enemy, Projectile, Explosion, PowerUp } from './game/types';
import { checkCollision, isOffScreen, spawnEnemyWave } from './game/utils';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const INITIAL_GAME_STATE: GameState = {
  score: 0,
  lives: 3,
  level: 1,
  gameStatus: 'playing',
  playerX: SCREEN_WIDTH / 2,
  playerY: SCREEN_HEIGHT - 80,
  lastFireTime: 0,
  fireRate: 200,
  enemySpawnTimer: 0,
  waveSpawnTimer: 0,
  currentWave: 1,
  enemiesRemaining: 0,
};

export default function GameScreen() {
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [explosions, setExplosions] = useState<Explosion[]>([]);
  const [powerUps, setPowerUps] = useState<PowerUp[]>([]);

  const playerX = useSharedValue(SCREEN_WIDTH / 2);
  const currentTime = useSharedValue(0);

  // const triggerHaptic = useCallback(() => {
  //   if (Platform.OS !== 'web') {
  //     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  //   }
  // }, []);

  // const restartGame = useCallback(() => {
  //   setGameState(INITIAL_GAME_STATE);
  //   setEnemies([]);
  //   setProjectiles([]);
  //   setExplosions([]);
  //   setPowerUps([]);
  //   playerX.value = SCREEN_WIDTH / 2;
  //   currentTime.value = 0;
  // }, [playerX, currentTime]);

  // const updateGameState = useCallback((updates: Partial<GameState>) => {
  //   setGameState(prev => ({ ...prev, ...updates }));
  // }, []);

  // const addExplosion = useCallback((x: number, y: number, type: 'enemy' | 'player' = 'enemy') => {
  //   const explosion: Explosion = {
  //     id: (Date.now() + Math.random()).toString(),
  //     x,
  //     y,
  //     scale: 0,
  //     opacity: 1,
  //     particles: Array.from({ length: 8 }, (_, i) => ({
  //       angle: (i * Math.PI * 2) / 8,
  //       speed: 50 + Math.random() * 50,
  //       x: 0,
  //       y: 0,
  //     })),
  //     type,
  //     createdAt: currentTime.value,
  //   };
  //   setExplosions(prev => [...prev, explosion]);
  //   triggerHaptic();
  // }, [currentTime, triggerHaptic]);

  // const spawnProjectile = useCallback((x: number, y: number, isPlayer: boolean = true) => {
  //   const projectile: Projectile = {
  //     id: (Date.now() + Math.random()).toString(),
  //     x,
  //     y,
  //     velocityX: 0,
  //     velocityY: isPlayer ? -400 : 200,
  //     isPlayer,
  //     damage: 1,
  //     radius: 3,
  //   };
  //   setProjectiles(prev => [...prev, projectile]);
  // }, []);

  // const spawnPowerUp = useCallback((x: number, y: number) => {
  //   if (Math.random() < 0.15) { // 15% chance
  //     const types: PowerUp['type'][] = ['extraLife', 'rapidFire', 'shield'];
  //     const powerUp: PowerUp = {
  //       id: (Date.now() + Math.random()).toString(),
  //       x,
  //       y,
  //       type: types[Math.floor(Math.random() * types.length)],
  //       velocityY: 100,
  //       radius: 15,
  //     };
  //     setPowerUps(prev => [...prev, powerUp]);
  //   }
  // }, []);

  // const panGesture = Gesture.Pan()
  //   .onUpdate((event) => {
  //     const newX = Math.max(30, Math.min(SCREEN_WIDTH - 30, event.absoluteX));
  //     playerX.value = newX;
  //     runOnJS(updateGameState)({ playerX: newX });
  //   });

  // const frameCallback = useFrameCallback((frameInfo) => {
  //   currentTime.value = frameInfo.timestamp;
  //   const deltaTime = frameInfo.timeSincePreviousFrame || 16;
  //   const dt = deltaTime / 1000;

  //   if (gameState.gameStatus !== 'playing') return;

  //   // Auto-fire player projectiles
  //   if (currentTime.value - gameState.lastFireTime > gameState.fireRate) {
  //     runOnJS(spawnProjectile)(gameState.playerX, gameState.playerY, true);
  //     runOnJS(updateGameState)({ lastFireTime: currentTime.value });
  //   }

  //   // Update projectiles
  //   runOnJS(setProjectiles)((prev) => 
  //     prev.map(p => ({
  //       ...p,
  //       y: p.y + p.velocityY * dt,
  //       x: p.x + p.velocityX * dt,
  //     })).filter(p => !isOffScreen(p.x, p.y, SCREEN_WIDTH, SCREEN_HEIGHT))
  //   );

  //   // Update enemies
  //   runOnJS(setEnemies)((prev) => 
  //     prev.map(enemy => ({
  //       ...enemy,
  //       y: enemy.y + enemy.velocityY * dt,
  //       x: enemy.x + enemy.velocityX * dt,
  //     })).filter(enemy => {
  //       if (enemy.y > SCREEN_HEIGHT + 50) {
  //         // Enemy escaped - lose a life
  //         setGameState(prevState => {
  //           const newLives = prevState.lives - 1;
  //           return {
  //             ...prevState,
  //             lives: newLives,
  //             gameStatus: newLives <= 0 ? 'gameOver' : 'playing',
  //           };
  //         });
  //         return false;
  //       }
  //       return true;
  //     })
  //   );

  //   // Update explosions
  //   runOnJS(setExplosions)((prev) =>
  //     prev.map(explosion => ({
  //       ...explosion,
  //       scale: Math.min(2, explosion.scale + dt * 4),
  //       opacity: Math.max(0, explosion.opacity - dt * 2),
  //       particles: explosion.particles.map(particle => ({
  //         ...particle,
  //         x: particle.x + Math.cos(particle.angle) * particle.speed * dt,
  //         y: particle.y + Math.sin(particle.angle) * particle.speed * dt,
  //       })),
  //     })).filter(explosion => explosion.opacity > 0)
  //   );

  //   // Update power-ups
  //   runOnJS(setPowerUps)((prev) =>
  //     prev.map(powerUp => ({
  //       ...powerUp,
  //       y: powerUp.y + powerUp.velocityY * dt,
  //     })).filter(powerUp => !isOffScreen(powerUp.x, powerUp.y, SCREEN_WIDTH, SCREEN_HEIGHT))
  //   );

  //   // Collision detection
  //   runOnJS(setProjectiles)((prevProjectiles) => {
  //     const remainingProjectiles: Projectile[] = [];
      
  //     prevProjectiles.forEach(projectile => {
  //       let projectileDestroyed = false;

  //       if (projectile.isPlayer) {
  //         // Check collision with enemies
  //         setEnemies(prevEnemies => {
  //           return prevEnemies.map(enemy => {
  //             if (checkCollision(
  //               projectile.x - projectile.radius, projectile.y - projectile.radius,
  //               projectile.radius * 2, projectile.radius * 2,
  //               enemy.x, enemy.y, enemy.width, enemy.height
  //             )) {
  //               projectileDestroyed = true;
  //               const newHealth = enemy.health - projectile.damage;
                
  //               if (newHealth <= 0) {
  //                 // Enemy destroyed
  //                 runOnJS(addExplosion)(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 'enemy');
  //                 runOnJS(spawnPowerUp)(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
  //                 setGameState(prevState => ({
  //                   ...prevState,
  //                   score: prevState.score + enemy.points,
  //                   enemiesRemaining: Math.max(0, prevState.enemiesRemaining - 1),
  //                 }));
  //                 return { ...enemy, health: 0 }; // Will be filtered out
  //               }
                
  //               return { ...enemy, health: newHealth };
  //             }
  //             return enemy;
  //           }).filter(enemy => enemy.health > 0);
  //         });
  //       }

  //       if (!projectileDestroyed) {
  //         remainingProjectiles.push(projectile);
  //       }
  //     });

  //     return remainingProjectiles;
  //   });

  //   // Check power-up collection
  //   runOnJS(setPowerUps)((prevPowerUps) => {
  //     return prevPowerUps.filter(powerUp => {
  //       if (checkCollision(
  //         gameState.playerX - 30, gameState.playerY - 20,
  //         60, 40,
  //         powerUp.x - powerUp.radius, powerUp.y - powerUp.radius,
  //         powerUp.radius * 2, powerUp.radius * 2
  //       )) {
  //         // Apply power-up effect
  //         setGameState(prevState => {
  //           switch (powerUp.type) {
  //             case 'extraLife':
  //               return { ...prevState, lives: prevState.lives + 1 };
  //             case 'rapidFire':
  //               return { ...prevState, fireRate: Math.max(50, prevState.fireRate * 0.5) };
  //             case 'shield':
  //               return prevState; // TODO: Implement shield
  //             default:
  //               return prevState;
  //           }
  //         });
  //         return false; // Remove power-up
  //       }
  //       return true;
  //     });
  //   });

  //   // Spawn enemies
  //   if (currentTime.value - gameState.waveSpawnTimer > 3000) { // Every 3 seconds
  //     spawnEnemyWave(gameState.currentWave, SCREEN_WIDTH, (newEnemies) => {
  //       runOnJS(setEnemies)(prev => [...prev, ...(Array.isArray(newEnemies) ? newEnemies : [])]);
  //       runOnJS(setGameState)(prevState => ({
  //         ...prevState,
  //         waveSpawnTimer: currentTime.value,
  //         enemiesRemaining: prevState.enemiesRemaining + (Array.isArray(newEnemies) ? newEnemies.length : 0),
  //         currentWave: prevState.currentWave + 1,
  //       }));
  //     });
  //   }

  //   // Check win condition
  //   if (gameState.enemiesRemaining === 0 && enemies.length === 0 && gameState.currentWave > 5) {
  //     runOnJS(updateGameState)({ gameStatus: 'won' });
  //   }
  // });

  // useEffect(() => {
  //   // Initial enemy spawn
  //   spawnEnemyWave(1, SCREEN_WIDTH, (newEnemies) => {
  //     setEnemies(newEnemies);
  //     updateGameState({ enemiesRemaining: newEnemies.length });
  //   });
  // }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.gameArea}>
        {/* <GestureDetector gesture={panGesture}>
          <Canvas style={styles.canvas}>
            <GameRenderer
              gameState={gameState}
              enemies={enemies}
              projectiles={projectiles}
              explosions={explosions}
              powerUps={powerUps}
              screenWidth={SCREEN_WIDTH}
              screenHeight={SCREEN_HEIGHT}
              currentTime={currentTime}
            />
          </Canvas>
        </GestureDetector> */}
        
        {/* HUD */}
        <View style={styles.hud}>
          <Text style={styles.scoreText}>Score: {gameState.score}</Text>
          <Text style={styles.livesText}>Lives: {gameState.lives}</Text>
          <Text style={styles.levelText}>Wave: {gameState.currentWave}</Text>
        </View>

        {/* Game Over Overlay */}
        {(gameState.gameStatus === 'gameOver' || gameState.gameStatus === 'won') && (
          <View style={styles.overlay}>
            <Text style={styles.gameOverText}>
              {gameState.gameStatus === 'won' ? 'YOU WIN!' : 'GAME OVER'}
            </Text>
            <Text style={styles.finalScoreText}>Final Score: {gameState.score}</Text>
            <TouchableOpacity style={styles.restartButton} onPress={() => console.log('restart')}>
              <Text style={styles.restartButtonText}>Play Again</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  gameArea: {
    flex: 1,
    position: 'relative',
  },
  canvas: {
    flex: 1,
  },
  hud: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  scoreText: {
    color: '#00ffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  livesText: {
    color: '#ff4444',
    fontSize: 18,
    fontWeight: 'bold',
  },
  levelText: {
    color: '#ffff00',
    fontSize: 18,
    fontWeight: 'bold',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  gameOverText: {
    color: '#ff4444',
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  finalScoreText: {
    color: '#00ffff',
    fontSize: 24,
    marginBottom: 40,
  },
  restartButton: {
    backgroundColor: '#00ffff',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
  },
  restartButtonText: {
    color: '#000',
    fontSize: 20,
    fontWeight: 'bold',
  },
});