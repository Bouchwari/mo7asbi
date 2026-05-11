import { AsyncStorageTransactionRepository } from '@infrastructure/persistence/AsyncStorageTransactionRepository';
import { AsyncStorageGoalRepository }        from '@infrastructure/persistence/AsyncStorageGoalRepository';
import { AddTransactionUseCase }             from '@application/transaction/use-cases/AddTransactionUseCase';
import { GetTransactionStatsUseCase }        from '@application/transaction/use-cases/GetTransactionStatsUseCase';
import { DeleteTransactionUseCase }          from '@application/transaction/use-cases/DeleteTransactionUseCase';
import { CreateGoalUseCase, DepositToGoalUseCase, WithdrawFromGoalUseCase, DeleteGoalUseCase } from '@application/goal/use-cases/GoalUseCases';

// ─── Repositories (singletons) ────────────────────────────────────────────────

const transactionRepository = new AsyncStorageTransactionRepository();
const goalRepository        = new AsyncStorageGoalRepository();

// ─── Use cases ────────────────────────────────────────────────────────────────

const addTransaction      = new AddTransactionUseCase(transactionRepository);
const getTransactionStats = new GetTransactionStatsUseCase(transactionRepository);
const deleteTransaction   = new DeleteTransactionUseCase(transactionRepository);
const createGoal          = new CreateGoalUseCase(goalRepository);
const depositToGoal       = new DepositToGoalUseCase(goalRepository);
const withdrawFromGoal    = new WithdrawFromGoalUseCase(goalRepository);
const deleteGoal          = new DeleteGoalUseCase(goalRepository);

// ─── Container ────────────────────────────────────────────────────────────────

export const container = {
  // Repositories (only accessed directly by stores when no use case fits)
  goalRepository,

  // Use cases
  addTransaction,
  getTransactionStats,
  deleteTransaction,
  createGoal,
  depositToGoal,
  withdrawFromGoal,
  deleteGoal,
} as const;
