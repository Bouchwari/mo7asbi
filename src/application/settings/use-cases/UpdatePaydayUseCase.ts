import { Result } from '@application/shared/Result';
import { ISettingsRepository } from '@domain/settings/repositories/ISettingsRepository';
import { UserSettings } from '@domain/settings/value-objects/UserSettings';

export class UpdatePaydayUseCase {
  constructor(private readonly repo: ISettingsRepository) {}

  async execute(day: number): Promise<Result<UserSettings>> {
    if (!Number.isInteger(day) || day < 1 || day > 31) {
      return Result.fail('يوم غير صالح، اختر بين 1 و 31');
    }
    try {
      const updated = (await this.repo.get()).withPayday(day);
      await this.repo.save(updated);
      return Result.ok(updated);
    } catch {
      return Result.fail('فشل في حفظ يوم الاستلام');
    }
  }
}
