import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface GameState {
  playerX: number;
  playerY: number;
  score: number;
  playerHealth: number;
  gameOver: boolean;
  // Special missile state
  isSpecialMissileCharging: boolean;
  specialMissileChargeProgress: number;
  triggerSpecialFireEffect: boolean;
}

interface GameActions {
  setPlayerX: (x: number) => void;
  setScore: (score: number) => void;
  setPlayerHealth: (health: number) => void;
  setGameOver: (gameOver: boolean) => void;
  resetGame: () => void;
  decrementHealth: () => void;
  addScore: (points: number) => void;
  // Special missile actions
  setIsSpecialMissileCharging: (charging: boolean) => void;
  setSpecialMissileChargeProgress: (progress: number) => void;
  setTriggerSpecialFireEffect: (trigger: boolean) => void;
  resetSpecialMissile: () => void;
  triggerFireEffect: () => void;
}

export const useGameLogicStore = create<GameState & GameActions>()(
  persist(
    (set, get) => ({
      // Initial state
      playerX: SCREEN_WIDTH / 2,
      playerY: SCREEN_HEIGHT - 180,
      score: 0,
      playerHealth: 3,
      gameOver: false,
      // Special missile state
      isSpecialMissileCharging: false,
      specialMissileChargeProgress: 0,
      triggerSpecialFireEffect: false,

      // Actions
      setPlayerX: (x: number) => set({ playerX: x }),
      
      setScore: (score: number) => set({ score }),
      
      setPlayerHealth: (health: number) => set({ playerHealth: health }),
      
      setGameOver: (gameOver: boolean) => set({ gameOver }),
      
      resetGame: () => set({
        score: 0,
        playerHealth: 3,
        gameOver: false,
        playerX: SCREEN_WIDTH / 2,
        // Reset special missile state
        isSpecialMissileCharging: false,
        specialMissileChargeProgress: 0,
        triggerSpecialFireEffect: false,
      }),
      
      decrementHealth: () => {
        const { playerHealth } = get();
        const newHealth = playerHealth - 1;
        set({ 
          playerHealth: newHealth,
          gameOver: newHealth <= 0 
        });
      },
      
      addScore: (points: number) => {
        const { score } = get();
        set({ score: score + points });
      },

      // Special missile actions
      setIsSpecialMissileCharging: (charging: boolean) => set({ isSpecialMissileCharging: charging }),
      
      setSpecialMissileChargeProgress: (progress: number) => set({ specialMissileChargeProgress: progress }),
      
      setTriggerSpecialFireEffect: (trigger: boolean) => set({ triggerSpecialFireEffect: trigger }),
      
      resetSpecialMissile: () => set({
        isSpecialMissileCharging: false,
        specialMissileChargeProgress: 0,
        triggerSpecialFireEffect: false,
      }),
      
      triggerFireEffect: () => {
        set({ triggerSpecialFireEffect: true });
        setTimeout(() => set({ triggerSpecialFireEffect: false }), 500);
      },
    }),
    {
      name: 'game-logic-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist score and playerHealth, not game state or special missile state
      partialize: (state) => ({
        score: state.score,
        playerHealth: state.playerHealth,
      }),
    }
  )
); 