import { useRef, useEffect, useCallback, useState } from 'react';
import { useGameLogicStore } from '../stores/GameLogicStore';
import { useAudioStore } from '../stores/AudioStore';
import { useSettingsStore } from '../stores/SettingsStore';
import { useGameObjectsStore } from '../stores/GameObjectsStore';
import { createBulletFromConfig, getMissileConfig } from '../utils/missileConfigs';
import * as Haptics from 'expo-haptics';

export const useGameLogic = () => {
  // Get all game state and actions directly from the store
  const {
    playerX,
    playerY,
    score,
    playerHealth,
    gameOver,
    showGameOverOverlay,
    setPlayerX,
    setShowGameOverOverlay,
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
    barriers,
    collectibles,
    explosions,
    collisionSparks,
    startGameLoop,
    stopGameLoop,
    checkBulletEnemyCollisions,
    checkPlayerEnemyCollisions,
    checkPlayerBarrierCollisions,
    checkBulletBarrierCollisions,
    checkPlayerCollectibleCollisions,
    addBullet,
    removeExplosion,
    removeCollisionSpark,
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

    // Check player-barrier collisions
    checkPlayerBarrierCollisions({
      playerX,
      playerY,
      decrementHealth,
      playCollisionSound,
    });

    // Check bullet-barrier collisions
    checkBulletBarrierCollisions({
      addScore,
    });

    // Check player-collectible collisions
    checkPlayerCollectibleCollisions({
      playerX,
      playerY,
      onCollectHealth: () => {
        // Add health (max 5)
        const newHealth = Math.min(playerHealth + 1, 5);
        useGameLogicStore.getState().setPlayerHealth(newHealth);
      },
      onCollectShield: () => {
        // For now, just log that shield was collected
        console.log('Shield collected! Shield system not yet implemented.');
      },
      onCollectWeapon: (weaponType: string) => {
        // Set active weapon type and duration
        console.log('Weapon collected!', weaponType);
        const endTime = Date.now() + 15000; // 15 seconds
        useGameLogicStore.getState().setActiveWeaponType(weaponType);
        useGameLogicStore.getState().setWeaponEndTime(endTime);
      },
    });
  }, [gameOver, playerX, playerY, bullets, enemies, barriers, collectibles, checkBulletEnemyCollisions, checkPlayerEnemyCollisions, checkPlayerBarrierCollisions, checkBulletBarrierCollisions, checkPlayerCollectibleCollisions, addScore, decrementHealth, playCollisionSound, playerHealth]);

  // Missile type selection state
  const [currentMissileType, setCurrentMissileType] = useState('normal');

  // Get active weapon type from store
  const { activeWeaponType, weaponEndTime, setActiveWeaponType, setWeaponEndTime } = useGameLogicStore();

  // Handle weapon expiration
  useEffect(() => {
    if (weaponEndTime && Date.now() > weaponEndTime) {
      setActiveWeaponType('');
      setWeaponEndTime(null);
    }
  }, [weaponEndTime, setActiveWeaponType, setWeaponEndTime]);

  // Automatic shooting with selected missile type
  useEffect(() => {
    if (gameOver || isSpecialMissileCharging) return;
    
    // Use active weapon type if available, otherwise use current missile type
    const weaponType = activeWeaponType || currentMissileType;
    const config = getMissileConfig(weaponType);
    const interval = setInterval(() => {
      const bullet = createBulletFromConfig(weaponType, playerPosRef.current.x, playerPosRef.current.y - 30);
      addBullet(bullet);
      playShootSound();
    }, config.fireRate);
    
    return () => clearInterval(interval);
  }, [gameOver, isSpecialMissileCharging, currentMissileType, activeWeaponType, addBullet, playShootSound]);

  // Enhanced shoot special missile function
  const shootSpecialMissile = () => {
    const bullet = createBulletFromConfig('special', playerPosRef.current.x, playerPosRef.current.y - 30);
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
    showGameOverOverlay,
    playerPosRef,
    
    // Game objects
    bullets,
    enemies,
    barriers,
    collectibles,
    explosions,
    collisionSparks,
    
    // Special missile state
    isSpecialMissileCharging,
    specialMissileChargeProgress,
    triggerSpecialFireEffect,
    
    // Missile selection
    currentMissileType,
    setCurrentMissileType,
    
    // Actions
    setPlayerX,
    setShowGameOverOverlay,
    handleRestart,
    shootSpecialMissile,
    removeExplosion,
    removeCollisionSpark,
    
    // Special missile actions
    setIsSpecialMissileCharging,
    setSpecialMissileChargeProgress,
  };
}; 