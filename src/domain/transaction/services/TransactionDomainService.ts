import { Transaction } from '../entities/Transaction';
import { Money, SupportedCurrency } from '@domain/shared/value-objects/Money';
import { CategoryId } from '../value-objects/Category';

export interface MonthStats {
  totalIncome:  Money;
  totalExpense: Money;
  balance:      Money;
  byCategory:   Map<CategoryId, Money>;
  dailyTotals:  Map<string, Money>;
}

export class TransactionDomainService {
  computeMonthStats(
    transactions: Transaction[],
    currency: SupportedCurrency = 'MAD',
  ): MonthStats {
    let totalIncome  = Money.zero(currency);
    let totalExpense = Money.zero(currency);
    const byCategory = new Map<CategoryId, Money>();
    const dailyTotals = new Map<string, Money>();

    for (const tx of transactions) {
      const day = tx.date.toISOString().slice(0, 10);

      if (tx.isIncome) {
        totalIncome = totalIncome.add(tx.amount);
      } else {
        totalExpense = totalExpense.add(tx.amount);
        byCategory.set(
          tx.category.id,
          (byCategory.get(tx.category.id) ?? Money.zero(currency)).add(tx.amount),
        );
        dailyTotals.set(
          day,
          (dailyTotals.get(day) ?? Money.zero(currency)).add(tx.amount),
        );
      }
    }

    const balance = totalIncome.subtract(totalExpense);
    return { totalIncome, totalExpense, balance, byCategory, dailyTotals };
  }
}
