import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  isSoundOn: boolean;
  isHapticFeedbackOn: boolean;
}

interface SettingsActions {
  toggleSound: () => void;
  toggleHapticFeedback: () => void;
  setSoundOn: (isOn: boolean) => void;
  setHapticFeedbackOn: (isOn: boolean) => void;
}

type SettingsStore = SettingsState & SettingsActions;

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      // Initial state
      isSoundOn: true,
      isHapticFeedbackOn: true,

      // Actions
      toggleSound: () => set((state) => ({ isSoundOn: !state.isSoundOn })),
      toggleHapticFeedback: () => set((state) => ({ isHapticFeedbackOn: !state.isHapticFeedbackOn })),
      setSoundOn: (isOn: boolean) => set({ isSoundOn: isOn }),
      setHapticFeedbackOn: (isOn: boolean) => set({ isHapticFeedbackOn: isOn }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
); 