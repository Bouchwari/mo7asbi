import { Result } from '@application/shared/Result';
import { Transaction } from '@domain/transaction/entities/Transaction';
import { ITransactionRepository } from '@domain/transaction/repositories/ITransactionRepository';
import { Money, SupportedCurrency } from '@domain/shared/value-objects/Money';
import { Category, CategoryId, TransactionType } from '@domain/transaction/value-objects/Category';
import { RecurringConfig } from '@domain/transaction/entities/Transaction';

export interface AddTransactionDTO {
  amount:      number;
  currency:    SupportedCurrency;
  categoryId:  CategoryId;
  type:        TransactionType;
  date:        Date;
  note?:       string;
  recurring:   RecurringConfig;
}

export class AddTransactionUseCase {
  constructor(private readonly repo: ITransactionRepository) {}

  async execute(dto: AddTransactionDTO): Promise<Result<Transaction>> {
    if (dto.amount <= 0) {
      return Result.fail('المبلغ يجب أن يكون أكبر من صفر');
    }

    try {
      const tx = Transaction.create({
        amount:   Money.create(dto.amount, dto.currency),
        category: Category.create(dto.categoryId),
        type:     dto.type,
        date:     dto.date,
        note:     dto.note,
        recurring: dto.recurring,
      });
      await this.repo.save(tx);
      return Result.ok(tx);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'خطأ غير متوقع';
      return Result.fail(message);
    }
  }
}
