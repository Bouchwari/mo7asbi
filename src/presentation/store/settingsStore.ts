import { create } from 'zustand';
import { container } from '@src/container';
import { UserSettings } from '@domain/settings/value-objects/UserSettings';

interface SettingsState {
  settings:  UserSettings;
  isLoading: boolean;
  error:     string | null;

  loadSettings:  () => Promise<void>;
  updateSalary:  (amount: number) => Promise<{ success: boolean; error?: string }>;
  updatePayday:  (day: number)    => Promise<{ success: boolean; error?: string }>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings:  UserSettings.default(),
  isLoading: false,
  error:     null,

  loadSettings: async () => {
    set({ isLoading: true, error: null });
    const result = await container.getUserSettings.execute();
    if (result.isFailure) {
      set({ error: result.error, isLoading: false });
      return;
    }
    set({ settings: result.value, isLoading: false });
  },

  updateSalary: async (amount) => {
    const result = await container.updateSalary.execute(amount);
    if (result.isFailure) return { success: false, error: result.error };
    set({ settings: result.value });
    return { success: true };
  },

  updatePayday: async (day) => {
    const result = await container.updatePayday.execute(day);
    if (result.isFailure) return { success: false, error: result.error };
    set({ settings: result.value });
    return { success: true };
  },
}));
