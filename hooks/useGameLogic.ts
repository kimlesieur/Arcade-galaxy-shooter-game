import { useGameState } from './useGameState';
import { useAudio } from './useAudio';
import { useBullets } from './useBullets';
import { useEnemies } from './useEnemies';
import { useCollisionDetection } from './useCollisionDetection';
import { useSpecialMissile } from './useSpecialMissile';
import { useExplosions } from './useExplosions';

export const useGameLogic = () => {
  // Core game state
  const {
    playerX,
    playerY,
    score,
    playerHealth,
    gameOver,
    playerPosRef,
    setPlayerX,
    resetGame: resetGameState,
    decrementHealth,
    addScore,
  } = useGameState();

  // Audio management
  const {
    playShootSound,
    playCollisionSound,
    playSpecialMissileSound,
    restartMusic,
  } = useAudio(gameOver);

  // Special missile system
  const {
    isSpecialMissileCharging,
    specialMissileChargeProgress,
    triggerSpecialFireEffect,
    setIsSpecialMissileCharging,
    setSpecialMissileChargeProgress,
    resetSpecialMissile,
    triggerFireEffect,
  } = useSpecialMissile();

  // Bullet management
  const {
    bullets,
    setBullets,
    shootSpecialMissile: shootSpecialMissileFromHook,
    resetBullets,
  } = useBullets(
    gameOver,
    isSpecialMissileCharging,
    playerPosRef,
    playShootSound,
    playSpecialMissileSound
  );

  // Enemy management
  const {
    enemies,
    setEnemies,
    resetEnemies,
    purpleEnemyCountRef,
  } = useEnemies(
    gameOver,
    playerX,
    playerY,
    decrementHealth,
    playCollisionSound
  );

  // Explosion management
  const {
    explosions,
    addExplosion,
    removeExplosion,
    resetExplosions,
  } = useExplosions();

  // Collision detection
  useCollisionDetection(
    gameOver,
    playerX,
    playerY,
    bullets,
    enemies,
    setBullets,
    setEnemies,
    addExplosion,
    addScore,
    decrementHealth,
    playCollisionSound,
    purpleEnemyCountRef
  );

  // Enhanced shoot special missile function
  const shootSpecialMissile = () => {
    shootSpecialMissileFromHook();
    triggerFireEffect();
  };

  // Enhanced restart function
  const handleRestart = () => {
    resetGameState();
    resetBullets();
    resetEnemies();
    resetSpecialMissile();
    resetExplosions();
    restartMusic();
  };

  return {
    // Game state
    playerX,
    playerY,
    score,
    playerHealth,
    gameOver,
    playerPosRef,
    
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
    
    // Explosion actions
    removeExplosion,
  };
}; 