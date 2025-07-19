import { useRef, useEffect } from 'react';
import { Audio } from 'expo-av';
import { useSettingsStore } from '../stores/SettingsStore';

export const useAudio = (gameOver: boolean) => {
  const { isSoundOn, isMusicOn } = useSettingsStore();
  const soundRef = useRef<Audio.Sound | null>(null);
  const shootSoundRef = useRef<Audio.Sound | null>(null);
  const collisionSoundRef = useRef<Audio.Sound | null>(null);
  const specialMissileSoundRef = useRef<Audio.Sound | null>(null);

  // Preload sound effects on mount
  useEffect(() => {
    async function loadEffects() {
      if (!shootSoundRef.current) {
        const { sound } = await Audio.Sound.createAsync(
          require('../assets/sounds/shoot.wav'),
          { isLooping: false, volume: 0.7 }
        );
        shootSoundRef.current = sound;
      }
      if (!collisionSoundRef.current) {
        const { sound } = await Audio.Sound.createAsync(
          require('../assets/sounds/collision.wav'),
          { isLooping: false, volume: 0.7 }
        );
        collisionSoundRef.current = sound;
      }
      if (!specialMissileSoundRef.current) {
        const { sound } = await Audio.Sound.createAsync(
          require('../assets/sounds/shoot.wav'), // Using same sound for now
          { isLooping: false, volume: 1.0 }
        );
        specialMissileSoundRef.current = sound;
      }
    }
    loadEffects();
    
    return () => {
      if (shootSoundRef.current) {
        shootSoundRef.current.unloadAsync();
        shootSoundRef.current = null;
      }
      if (collisionSoundRef.current) {
        collisionSoundRef.current.unloadAsync();
        collisionSoundRef.current = null;
      }
      if (specialMissileSoundRef.current) {
        specialMissileSoundRef.current.unloadAsync();
        specialMissileSoundRef.current = null;
      }
    };
  }, []);

  // Play background music when game starts, stop when game over
  useEffect(() => {
    async function playMusic() {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/sounds/theme_2.wav'),
        { shouldPlay: true, isLooping: true, volume: 0.2 }
      );
      soundRef.current = sound;
      await sound.playAsync();
    }
    
    if (!gameOver && isMusicOn) {
      playMusic();
    } else {
      if (soundRef.current) {
        soundRef.current.stopAsync();
      }
    }
    
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    };
  }, [gameOver, isMusicOn]);

  const playShootSound = () => {
    if (shootSoundRef.current && isSoundOn) {
      shootSoundRef.current.replayAsync();
    }
  };

  const playCollisionSound = () => {
    if (collisionSoundRef.current && isSoundOn) {
      collisionSoundRef.current.replayAsync();
    }
  };

  const playSpecialMissileSound = () => {
    if (specialMissileSoundRef.current && isSoundOn) {
      specialMissileSoundRef.current.replayAsync();
    }
  };

  const restartMusic = () => {
    if (soundRef.current && isMusicOn) {
      soundRef.current.replayAsync();
    }
  };

  return {
    playShootSound,
    playCollisionSound,
    playSpecialMissileSound,
    restartMusic,
  };
}; 