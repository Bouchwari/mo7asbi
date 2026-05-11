import { create } from 'zustand';
import { container } from '@src/container';
import { Transaction } from '@domain/transaction/entities/Transaction';
import { MonthStats } from '@domain/transaction/services/TransactionDomainService';
import { AddTransactionDTO } from '@application/transaction/use-cases/AddTransactionUseCase';

interface TransactionState {
  transactions: Transaction[];
  stats:        MonthStats | null;
  isLoading:    boolean;
  error:        string | null;
  selectedYear:  number;
  selectedMonth: number;

  loadMonth:          (year: number, month: number) => Promise<void>;
  addTransaction:     (dto: AddTransactionDTO) => Promise<{ success: boolean; error?: string }>;
  deleteTransaction:  (id: string) => Promise<{ success: boolean; error?: string }>;
  setSelectedMonth:   (year: number, month: number) => void;
}

const now = new Date();

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions:  [],
  stats:         null,
  isLoading:     false,
  error:         null,
  selectedYear:  now.getFullYear(),
  selectedMonth: now.getMonth() + 1,

  loadMonth: async (year, month) => {
    set({ isLoading: true, error: null });
    const result = await container.getTransactionStats.execute({ year, month });
    if (result.isFailure) {
      set({ error: result.error, isLoading: false });
      return;
    }
    set({
      transactions: result.value.transactions,
      stats:        result.value.stats,
      isLoading:    false,
    });
  },

  addTransaction: async (dto) => {
    const result = await container.addTransaction.execute(dto);
    if (result.isFailure) return { success: false, error: result.error };
    const { selectedYear, selectedMonth } = get();
    await get().loadMonth(selectedYear, selectedMonth);
    return { success: true };
  },

  deleteTransaction: async (id) => {
    const result = await container.deleteTransaction.execute(id);
    if (result.isFailure) return { success: false, error: result.error };
    const { selectedYear, selectedMonth } = get();
    await get().loadMonth(selectedYear, selectedMonth);
    return { success: true };
  },

  setSelectedMonth: (year, month) => {
    set({ selectedYear: year, selectedMonth: month });
    void get().loadMonth(year, month);
  },
}));
