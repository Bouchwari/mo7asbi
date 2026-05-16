import { AsyncStorageTransactionRepository } from '@infrastructure/persistence/AsyncStorageTransactionRepository';
import { AsyncStorageGoalRepository }        from '@infrastructure/persistence/AsyncStorageGoalRepository';
import { AsyncStorageSettingsRepository }    from '@infrastructure/persistence/AsyncStorageSettingsRepository';
import { AddTransactionUseCase }             from '@application/transaction/use-cases/AddTransactionUseCase';
import { GetTransactionStatsUseCase }        from '@application/transaction/use-cases/GetTransactionStatsUseCase';
import { DeleteTransactionUseCase }          from '@application/transaction/use-cases/DeleteTransactionUseCase';
import { CreateGoalUseCase, DepositToGoalUseCase, WithdrawFromGoalUseCase, DeleteGoalUseCase } from '@application/goal/use-cases/GoalUseCases';
import { GetGoalsUseCase }          from '@application/goal/use-cases/GetGoalsUseCase';
import { GetUserSettingsUseCase }   from '@application/settings/use-cases/GetUserSettingsUseCase';
import { UpdateSalaryUseCase }      from '@application/settings/use-cases/UpdateSalaryUseCase';
import { UpdatePaydayUseCase }      from '@application/settings/use-cases/UpdatePaydayUseCase';

// ─── Repositories (singletons) ────────────────────────────────────────────────

const transactionRepository = new AsyncStorageTransactionRepository();
const goalRepository        = new AsyncStorageGoalRepository();
const settingsRepository    = new AsyncStorageSettingsRepository();

// ─── Use cases ────────────────────────────────────────────────────────────────

const addTransaction      = new AddTransactionUseCase(transactionRepository);
const getTransactionStats = new GetTransactionStatsUseCase(transactionRepository);
const deleteTransaction   = new DeleteTransactionUseCase(transactionRepository);
const getGoals            = new GetGoalsUseCase(goalRepository);
const createGoal          = new CreateGoalUseCase(goalRepository);
const depositToGoal       = new DepositToGoalUseCase(goalRepository);
const withdrawFromGoal    = new WithdrawFromGoalUseCase(goalRepository);
const deleteGoal          = new DeleteGoalUseCase(goalRepository);
const getUserSettings     = new GetUserSettingsUseCase(settingsRepository);
const updateSalary        = new UpdateSalaryUseCase(settingsRepository);
const updatePayday        = new UpdatePaydayUseCase(settingsRepository);

// ─── Container ────────────────────────────────────────────────────────────────

export const container = {
  addTransaction,
  getTransactionStats,
  deleteTransaction,
  getGoals,
  createGoal,
  depositToGoal,
  withdrawFromGoal,
  deleteGoal,
  getUserSettings,
  updateSalary,
  updatePayday,
} as const;
