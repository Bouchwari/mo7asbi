import { Result } from '@application/shared/Result';
import { ISettingsRepository } from '@domain/settings/repositories/ISettingsRepository';
import { UserSettings } from '@domain/settings/value-objects/UserSettings';

export class GetUserSettingsUseCase {
  constructor(private readonly repo: ISettingsRepository) {}

  async execute(): Promise<Result<UserSettings>> {
    try {
      return Result.ok(await this.repo.get());
    } catch {
      return Result.fail('فشل في تحميل الإعدادات');
    }
  }
}
