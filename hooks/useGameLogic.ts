import { useRef, useEffect, useCallback } from 'react';
import { useGameLogicStore } from '../stores/GameLogicStore';
import { useAudioStore } from '../stores/AudioStore';
import { useSettingsStore } from '../stores/SettingsStore';
import { useGameObjectsStore } from '../stores/GameObjectsStore';
import { Bullet } from '../components/game/types';
import * as Haptics from 'expo-haptics';

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

  // Get game objects state and actions
  const {
    bullets,
    enemies,
    explosions,
    startGameLoop,
    stopGameLoop,
    checkBulletEnemyCollisions,
    checkPlayerEnemyCollisions,
    addBullet,
    resetAll: resetGameObjects,
  } = useGameObjectsStore();

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

  // Game loop management
  useEffect(() => {
    if (gameOver) {
      stopGameLoop();
    } else {
      startGameLoop();
    }

    return () => {
      stopGameLoop();
    };
  }, [gameOver, startGameLoop, stopGameLoop]);

  // Collision detection
  useEffect(() => {
    if (gameOver) return;
    
    // Check bullet-enemy collisions
    checkBulletEnemyCollisions({
      addScore,
    });
    
    // Check player-enemy collisions
    checkPlayerEnemyCollisions({
      playerX,
      playerY,
      decrementHealth,
      playCollisionSound,
    });
  }, [gameOver, playerX, playerY, bullets, enemies, checkBulletEnemyCollisions, checkPlayerEnemyCollisions, addScore, decrementHealth, playCollisionSound]);

  // Automatic shooting
  useEffect(() => {
    if (gameOver || isSpecialMissileCharging) return;
    
    const interval = setInterval(() => {
      const bullet: Bullet = {
        id: Math.random().toString(36).substr(2, 9),
        x: playerPosRef.current.x,
        y: playerPosRef.current.y - 30,
        velocityX: 0,
        velocityY: -500,
        isPlayer: true,
        damage: 1,
        radius: 6,
        type: 'normal',
      };
      addBullet(bullet);
      playShootSound();
    }, 700);
    
    return () => clearInterval(interval);
  }, [gameOver, isSpecialMissileCharging, addBullet, playShootSound]);

  // Enhanced shoot special missile function
  const shootSpecialMissile = () => {
    const bullet: Bullet = {
      id: Math.random().toString(36).substr(2, 9),
      x: playerPosRef.current.x,
      y: playerPosRef.current.y - 30,
      velocityX: 0,
      velocityY: -600,
      isPlayer: true,
      damage: 3,
      radius: 10,
      type: 'special',
    };
    addBullet(bullet);
    playSpecialMissileSound();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    triggerFireEffect();
  };

  // Enhanced restart function
  const handleRestart = () => {
    resetGameState();
    resetGameObjects();
    resetSpecialMissile();
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
  };
}; 