import { Result } from '@application/shared/Result';
import { SavingsGoal } from '@domain/goal/entities/SavingsGoal';
import { IGoalRepository } from '@domain/goal/repositories/IGoalRepository';
import { Money, SupportedCurrency } from '@domain/shared/value-objects/Money';

export interface CreateGoalDTO {
  name:         string;
  targetAmount: number;
  currency:     SupportedCurrency;
  emoji:        string;
  deadline?:    Date;
}

export interface GoalTransactionDTO {
  goalId:   string;
  amount:   number;
  currency: SupportedCurrency;
}

export class CreateGoalUseCase {
  constructor(private readonly repo: IGoalRepository) {}

  async execute(dto: CreateGoalDTO): Promise<Result<SavingsGoal>> {
    if (dto.targetAmount <= 0) return Result.fail('المبلغ المستهدف يجب أن يكون أكبر من صفر');
    if (!dto.name.trim())      return Result.fail('اسم الهدف مطلوب');
    try {
      const goal = SavingsGoal.create({
        name:         dto.name.trim(),
        targetAmount: Money.create(dto.targetAmount, dto.currency),
        emoji:        dto.emoji,
        deadline:     dto.deadline,
      });
      await this.repo.save(goal);
      return Result.ok(goal);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'خطأ غير متوقع';
      return Result.fail(message);
    }
  }
}

export class DepositToGoalUseCase {
  constructor(private readonly repo: IGoalRepository) {}

  async execute(dto: GoalTransactionDTO): Promise<Result<SavingsGoal>> {
    if (dto.amount <= 0) return Result.fail('المبلغ يجب أن يكون أكبر من صفر');
    try {
      const goal = await this.repo.findById(dto.goalId);
      if (!goal) return Result.fail('الهدف غير موجود');
      const updated = goal.deposit(Money.create(dto.amount, dto.currency));
      await this.repo.save(updated);
      return Result.ok(updated);
    } catch {
      return Result.fail('فشل في إضافة المبلغ');
    }
  }
}

export class WithdrawFromGoalUseCase {
  constructor(private readonly repo: IGoalRepository) {}

  async execute(dto: GoalTransactionDTO): Promise<Result<SavingsGoal>> {
    if (dto.amount <= 0) return Result.fail('المبلغ يجب أن يكون أكبر من صفر');
    try {
      const goal = await this.repo.findById(dto.goalId);
      if (!goal) return Result.fail('الهدف غير موجود');
      const updated = goal.withdraw(Money.create(dto.amount, dto.currency));
      await this.repo.save(updated);
      return Result.ok(updated);
    } catch {
      return Result.fail('فشل في سحب المبلغ');
    }
  }
}

export class DeleteGoalUseCase {
  constructor(private readonly repo: IGoalRepository) {}

  async execute(id: string): Promise<Result<void>> {
    if (!id) return Result.fail('معرف الهدف مطلوب');
    try {
      await this.repo.delete(id);
      return Result.ok(undefined);
    } catch {
      return Result.fail('فشل في حذف الهدف');
    }
  }
}
