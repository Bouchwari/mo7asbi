import { Result } from '@application/shared/Result';
import { ITransactionRepository } from '@domain/transaction/repositories/ITransactionRepository';
import { TransactionDomainService, MonthStats } from '@domain/transaction/services/TransactionDomainService';
import { Transaction } from '@domain/transaction/entities/Transaction';

export interface GetStatsDTO {
  year:  number;
  month: number;
}

export interface StatsResult {
  stats:        MonthStats;
  transactions: Transaction[];
}

export class GetTransactionStatsUseCase {
  private readonly domainService = new TransactionDomainService();

  constructor(private readonly repo: ITransactionRepository) {}

  async execute(dto: GetStatsDTO): Promise<Result<StatsResult>> {
    try {
      const transactions = await this.repo.findByMonth(dto.year, dto.month);
      const stats = this.domainService.computeMonthStats(transactions);
      return Result.ok({ stats, transactions });
    } catch {
      return Result.fail('فشل في تحميل البيانات');
    }
  }
}
