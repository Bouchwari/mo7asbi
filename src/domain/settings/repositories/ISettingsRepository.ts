import { UserSettings } from '@domain/settings/value-objects/UserSettings';

export interface ISettingsRepository {
  get():                   Promise<UserSettings>;
  save(s: UserSettings):   Promise<void>;
}
