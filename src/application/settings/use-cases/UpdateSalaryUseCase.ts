import { Result } from '@application/shared/Result';
import { ISettingsRepository } from '@domain/settings/repositories/ISettingsRepository';
import { UserSettings } from '@domain/settings/value-objects/UserSettings';

export class UpdateSalaryUseCase {
  constructor(private readonly repo: ISettingsRepository) {}

  async execute(amount: number): Promise<Result<UserSettings>> {
    if (!isFinite(amount) || amount < 0) {
      return Result.fail('أدخل مبلغاً صحيحاً');
    }
    try {
      const updated = (await this.repo.get()).withMonthlySalary(amount);
      await this.repo.save(updated);
      return Result.ok(updated);
    } catch {
      return Result.fail('فشل في حفظ الراتب');
    }
  }
}
