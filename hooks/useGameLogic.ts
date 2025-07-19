import { useRef, useEffect, useCallback } from 'react';
import { useBullets } from './useBullets';
import { useEnemies } from './useEnemies';
import { useCollisionDetection } from './useCollisionDetection';
import { useGameLogicStore } from '../stores/GameLogicStore';
import { useAudioStore } from '../stores/AudioStore';
import { useSettingsStore } from '../stores/SettingsStore';
import { useExplosions } from './useExplosions';

export const useGameLogic = () => {
  // Get all game state and actions directly from the store
  const {
    playerX,
    playerY,
    score,
    playerHealth,
    gameOver,
    setPlayerX,
    resetGame: resetGameState,
    decrementHealth,
    addScore,
    // Special missile state and actions
    isSpecialMissileCharging,
    specialMissileChargeProgress,
    triggerSpecialFireEffect,
    setIsSpecialMissileCharging,
    setSpecialMissileChargeProgress,
    resetSpecialMissile,
    triggerFireEffect,
  } = useGameLogicStore();

  // Get audio state and actions
  const { isSoundOn, isMusicOn } = useSettingsStore();
  const {
    isLoaded,
    isMusicPlaying,
    loadAudio,
    unloadAudio,
    playBackgroundMusic,
    stopBackgroundMusic,
    restartBackgroundMusic,
    playShootSound: playShootSoundFromStore,
    playCollisionSound: playCollisionSoundFromStore,
    playSpecialMissileSound: playSpecialMissileSoundFromStore,
  } = useAudioStore();

  // Ref to always have latest player position
  const playerPosRef = useRef({ x: playerX, y: playerY });
  
  useEffect(() => {
    playerPosRef.current.x = playerX;
    playerPosRef.current.y = playerY;
  }, [playerX, playerY]);

  // Load audio on mount
  useEffect(() => {
    loadAudio();
    
    return () => {
      unloadAudio();
    };
  }, [loadAudio, unloadAudio]);

  // Handle background music based on game state and settings
  useEffect(() => {
    if (!isLoaded) return;
    
    if (!gameOver && isMusicOn && !isMusicPlaying) {
      playBackgroundMusic();
    } else if ((gameOver || !isMusicOn) && isMusicPlaying) {
      stopBackgroundMusic();
    }
  }, [gameOver, isMusicOn, isLoaded, isMusicPlaying, playBackgroundMusic, stopBackgroundMusic]);

  // Wrapper functions that check sound settings and loading state before playing
  // Use useCallback to ensure these functions are stable and reactive to state changes
  const playShootSound = useCallback(() => {
    if (isSoundOn && isLoaded) {
      playShootSoundFromStore();
    }
  }, [isSoundOn, isLoaded, playShootSoundFromStore]);

  const playCollisionSound = useCallback(() => {
    if (isSoundOn && isLoaded) {
      playCollisionSoundFromStore();
    }
  }, [isSoundOn, isLoaded, playCollisionSoundFromStore]);

  const playSpecialMissileSound = useCallback(() => {
    if (isSoundOn && isLoaded) {
      playSpecialMissileSoundFromStore();
    }
  }, [isSoundOn, isLoaded, playSpecialMissileSoundFromStore]);

  const restartMusic = useCallback(() => {
    if (isMusicOn && isLoaded) {
      restartBackgroundMusic();
    }
  }, [isMusicOn, isLoaded, restartBackgroundMusic]);

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