import { create } from 'zustand';

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

export const useSettingsStore = create<SettingsStore>((set) => ({
  // Initial state
  isSoundOn: true,
  isHapticFeedbackOn: true,

  // Actions
  toggleSound: () => set((state) => ({ isSoundOn: !state.isSoundOn })),
  toggleHapticFeedback: () => set((state) => ({ isHapticFeedbackOn: !state.isHapticFeedbackOn })),
  setSoundOn: (isOn: boolean) => set({ isSoundOn: isOn }),
  setHapticFeedbackOn: (isOn: boolean) => set({ isHapticFeedbackOn: isOn }),
})); 