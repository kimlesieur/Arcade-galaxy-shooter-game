import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  isSoundOn: boolean;
  isMusicOn: boolean;
  isHapticFeedbackOn: boolean;
  // Debug settings
  enemiesMultiplier: number;
}

interface SettingsActions {
  toggleSound: () => void;
  toggleMusic: () => void;
  toggleHapticFeedback: () => void;
  setSoundOn: (isOn: boolean) => void;
  setMusicOn: (isOn: boolean) => void;
  setHapticFeedbackOn: (isOn: boolean) => void;
  // Debug actions
  setEnemiesMultiplier: (multiplier: number) => void;
  increaseEnemiesMultiplier: () => void;
  decreaseEnemiesMultiplier: () => void;
}

type SettingsStore = SettingsState & SettingsActions;

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      // Initial state
      isSoundOn: true,
      isMusicOn: true,
      isHapticFeedbackOn: true,
      // Debug settings
      enemiesMultiplier: 1,

      // Actions
      toggleSound: () => set((state) => ({ isSoundOn: !state.isSoundOn })),
      toggleMusic: () => set((state) => ({ isMusicOn: !state.isMusicOn })),
      toggleHapticFeedback: () => set((state) => ({ isHapticFeedbackOn: !state.isHapticFeedbackOn })),
      setSoundOn: (isOn: boolean) => set({ isSoundOn: isOn }),
      setMusicOn: (isOn: boolean) => set({ isMusicOn: isOn }),
      setHapticFeedbackOn: (isOn: boolean) => set({ isHapticFeedbackOn: isOn }),
      
      // Debug actions
      setEnemiesMultiplier: (multiplier: number) => set({ enemiesMultiplier: Math.max(1, Math.min(10, multiplier)) }),
      increaseEnemiesMultiplier: () => {
        const current = get().enemiesMultiplier;
        set({ enemiesMultiplier: Math.min(10, current + 1) });
      },
      decreaseEnemiesMultiplier: () => {
        const current = get().enemiesMultiplier;
        set({ enemiesMultiplier: Math.max(1, current - 1) });
      },
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
); 