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
  showGameOverOverlay: boolean; // New state to control when to show the overlay
  // Special missile state
  isSpecialMissileCharging: boolean;
  specialMissileChargeProgress: number;
  triggerSpecialFireEffect: boolean;
  // Collectible state
  activeWeaponType: string; // Current active weapon type
  weaponEndTime: number | null; // When the current weapon expires
  hasShield: boolean; // Whether player has shield protection
}

interface GameActions {
  setPlayerX: (x: number) => void;
  setScore: (score: number) => void;
  setPlayerHealth: (health: number) => void;
  setGameOver: (gameOver: boolean) => void;
  setShowGameOverOverlay: (show: boolean) => void;
  resetGame: () => void;
  decrementHealth: () => void;
  addScore: (points: number) => void;
  // Special missile actions
  setIsSpecialMissileCharging: (charging: boolean) => void;
  setSpecialMissileChargeProgress: (progress: number) => void;
  setTriggerSpecialFireEffect: (trigger: boolean) => void;
  resetSpecialMissile: () => void;
  triggerFireEffect: () => void;
  // Collectible actions
  setActiveWeaponType: (weaponType: string) => void;
  setWeaponEndTime: (endTime: number | null) => void;
  setHasShield: (hasShield: boolean) => void;
  resetCollectibles: () => void;
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
      showGameOverOverlay: false,
      // Special missile state
      isSpecialMissileCharging: false,
      specialMissileChargeProgress: 0,
      triggerSpecialFireEffect: false,
      // Collectible state
      activeWeaponType: '',
      weaponEndTime: null,
      hasShield: false,

      // Actions
      setPlayerX: (x: number) => set({ playerX: x }),
      
      setScore: (score: number) => set({ score }),
      
      setPlayerHealth: (health: number) => set({ playerHealth: health }),
      
      setGameOver: (gameOver: boolean) => set({ gameOver }),
      
      setShowGameOverOverlay: (show: boolean) => set({ showGameOverOverlay: show }),
      
      resetGame: () => set({
        score: 0,
        playerHealth: 3,
        gameOver: false,
        showGameOverOverlay: false,
        playerX: SCREEN_WIDTH / 2,
        // Reset special missile state
        isSpecialMissileCharging: false,
        specialMissileChargeProgress: 0,
        triggerSpecialFireEffect: false,
        // Reset collectible state
        activeWeaponType: '',
        weaponEndTime: null,
        hasShield: false,
      }),
      
      decrementHealth: () => {
        const { playerHealth } = get();
        const newHealth = playerHealth - 1;
        set({ 
          playerHealth: newHealth,
          gameOver: newHealth <= 0,
          showGameOverOverlay: false // Don't show overlay immediately, wait for explosion
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

      // Collectible actions
      setActiveWeaponType: (weaponType: string) => set({ activeWeaponType: weaponType }),
      setWeaponEndTime: (endTime: number | null) => set({ weaponEndTime: endTime }),
      setHasShield: (hasShield: boolean) => set({ hasShield }),
      resetCollectibles: () => set({
        activeWeaponType: '',
        weaponEndTime: null,
        hasShield: false,
      }),
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