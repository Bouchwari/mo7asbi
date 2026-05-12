import { Result } from '@application/shared/Result';
import { SavingsGoal } from '@domain/goal/entities/SavingsGoal';
import { IGoalRepository } from '@domain/goal/repositories/IGoalRepository';

export class GetGoalsUseCase {
  constructor(private readonly repo: IGoalRepository) {}

  async execute(): Promise<Result<SavingsGoal[]>> {
    try {
      const goals = await this.repo.findAll();
      return Result.ok(goals);
    } catch {
      return Result.fail('فشل في تحميل الأهداف');
    }
  }
}
