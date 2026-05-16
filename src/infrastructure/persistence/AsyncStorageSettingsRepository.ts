import AsyncStorage from '@react-native-async-storage/async-storage';
import { ISettingsRepository } from '@domain/settings/repositories/ISettingsRepository';
import { UserSettings, UserSettingsPrimitive } from '@domain/settings/value-objects/UserSettings';

const STORAGE_KEY = '@hasabi:settings';

export class AsyncStorageSettingsRepository implements ISettingsRepository {
  async get(): Promise<UserSettings> {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return UserSettings.default();
    return UserSettings.fromPrimitive(JSON.parse(raw) as UserSettingsPrimitive);
  }

  async save(settings: UserSettings): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings.toPrimitive()));
  }
}
