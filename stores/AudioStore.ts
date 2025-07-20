import { create } from 'zustand';
import { Audio } from 'expo-av';

interface AudioState {
  // Audio instances
  backgroundMusic: Audio.Sound | null;
  shootSound: Audio.Sound | null;
  collisionSound: Audio.Sound | null;
  specialMissileSound: Audio.Sound | null;
  
  // Audio state
  isMusicPlaying: boolean;
  isLoaded: boolean;
  isLoading: boolean;
}

interface AudioActions {
  // Loading and initialization
  loadAudio: () => Promise<void>;
  unloadAudio: () => Promise<void>;
  
  // Background music
  playBackgroundMusic: () => Promise<void>;
  stopBackgroundMusic: () => Promise<void>;
  restartBackgroundMusic: () => Promise<void>;
  
  // Sound effects
  playShootSound: () => Promise<void>;
  playCollisionSound: () => Promise<void>;
  playSpecialMissileSound: () => Promise<void>;
  
  // State management
  setMusicPlaying: (playing: boolean) => void;
  setLoaded: (loaded: boolean) => void;
  setIsLoading: (loading: boolean) => void;
}

export const useAudioStore = create<AudioState & AudioActions>((set, get) => ({
  // Initial state
  backgroundMusic: null,
  shootSound: null,
  collisionSound: null,
  specialMissileSound: null,
  isMusicPlaying: false,
  isLoaded: false,
  isLoading: false,

  // Loading and initialization
  loadAudio: async () => {
    const { isLoaded, isLoading } = get();
    if (isLoaded || isLoading) return;
    
    set({ isLoading: true });
    
    try {
      const { sound: shootSound } = await Audio.Sound.createAsync(
        require('../assets/sounds/shoot.wav'),
        { isLooping: false, volume: 0.7 }
      );
      
      const { sound: collisionSound } = await Audio.Sound.createAsync(
        require('../assets/sounds/collision.wav'),
        { isLooping: false, volume: 0.7 }
      );
      
      const { sound: specialMissileSound } = await Audio.Sound.createAsync(
        require('../assets/sounds/shoot.wav'), // Using same sound for now
        { isLooping: false, volume: 1.0 }
      );
      
      set({
        shootSound,
        collisionSound,
        specialMissileSound,
        isLoaded: true,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to load audio:', error);
      set({ isLoading: false });
    }
  },

  unloadAudio: async () => {
    const { backgroundMusic, shootSound, collisionSound, specialMissileSound } = get();
    
    try {
      if (backgroundMusic) {
        await backgroundMusic.unloadAsync();
      }
      if (shootSound) {
        await shootSound.unloadAsync();
      }
      if (collisionSound) {
        await collisionSound.unloadAsync();
      }
      if (specialMissileSound) {
        await specialMissileSound.unloadAsync();
      }
      
      set({
        backgroundMusic: null,
        shootSound: null,
        collisionSound: null,
        specialMissileSound: null,
        isMusicPlaying: false,
        isLoaded: false,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to unload audio:', error);
    }
  },

  // Background music
  playBackgroundMusic: async () => {
    const { isLoaded } = get();
    if (!isLoaded) return;
    
    try {
      const { backgroundMusic } = get();
      
      // Unload existing music if any
      if (backgroundMusic) {
        await backgroundMusic.unloadAsync();
      }
      
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/sounds/theme_2.wav'),
        { shouldPlay: true, isLooping: true, volume: 0.2 }
      );
      
      set({ backgroundMusic: sound, isMusicPlaying: true });
      await sound.playAsync();
    } catch (error) {
      console.error('Failed to play background music:', error);
    }
  },

  stopBackgroundMusic: async () => {
    try {
      const { backgroundMusic } = get();
      if (backgroundMusic) {
        await backgroundMusic.stopAsync();
        set({ isMusicPlaying: false });
      }
    } catch (error) {
      console.error('Failed to stop background music:', error);
    }
  },

  restartBackgroundMusic: async () => {
    const { isLoaded } = get();
    if (!isLoaded) return;
    
    try {
      const { backgroundMusic } = get();
      if (backgroundMusic) {
        await backgroundMusic.replayAsync();
        set({ isMusicPlaying: true });
      }
    } catch (error) {
      console.error('Failed to restart background music:', error);
    }
  },

  // Sound effects
  playShootSound: async () => {
    const { shootSound, isLoaded } = get();
    if (!isLoaded || !shootSound) return;
    
    try {
      await shootSound.replayAsync();
    } catch (error) {
      console.error('Failed to play shoot sound:', error);
    }
  },

  playCollisionSound: async () => {
    const { collisionSound, isLoaded } = get();
    if (!isLoaded || !collisionSound) return;
    
    try {
      await collisionSound.replayAsync();
    } catch (error) {
      console.error('Failed to play collision sound:', error);
    }
  },

  playSpecialMissileSound: async () => {
    const { specialMissileSound, isLoaded } = get();
    if (!isLoaded || !specialMissileSound) return;
    
    try {
      await specialMissileSound.replayAsync();
    } catch (error) {
      console.error('Failed to play special missile sound:', error);
    }
  },

  // State management
  setMusicPlaying: (playing: boolean) => set({ isMusicPlaying: playing }),
  setLoaded: (loaded: boolean) => set({ isLoaded: loaded }),
  setIsLoading: (loading: boolean) => set({ isLoading: loading }),
})); 