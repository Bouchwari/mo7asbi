import { Result } from '@application/shared/Result';
import { ITransactionRepository } from '@domain/transaction/repositories/ITransactionRepository';

export class DeleteTransactionUseCase {
  constructor(private readonly repo: ITransactionRepository) {}

  async execute(id: string): Promise<Result<void>> {
    if (!id) return Result.fail('معرف المعاملة مطلوب');
    try {
      await this.repo.delete(id);
      return Result.ok(undefined);
    } catch {
      return Result.fail('فشل في حذف المعاملة');
    }
  }
}
