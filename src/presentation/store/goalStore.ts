import { create } from 'zustand';
import { container } from '@src/container';
import { SavingsGoal } from '@domain/goal/entities/SavingsGoal';
import { CreateGoalDTO, GoalTransactionDTO } from '@application/goal/use-cases/GoalUseCases';

interface GoalState {
  goals:     SavingsGoal[];
  isLoading: boolean;
  error:     string | null;

  loadGoals:      () => Promise<void>;
  createGoal:     (dto: CreateGoalDTO)        => Promise<{ success: boolean; error?: string }>;
  depositToGoal:  (dto: GoalTransactionDTO)   => Promise<{ success: boolean; error?: string }>;
  withdrawFromGoal:(dto: GoalTransactionDTO)  => Promise<{ success: boolean; error?: string }>;
  deleteGoal:     (id: string)                => Promise<{ success: boolean; error?: string }>;
}

export const useGoalStore = create<GoalState>((set, get) => ({
  goals:     [],
  isLoading: false,
  error:     null,

  loadGoals: async () => {
    set({ isLoading: true, error: null });
    try {
      const goals = await container.goalRepository.findAll();
      set({ goals, isLoading: false });
    } catch {
      set({ error: 'فشل في تحميل الأهداف', isLoading: false });
    }
  },

  createGoal: async (dto) => {
    const result = await container.createGoal.execute(dto);
    if (result.isFailure) return { success: false, error: result.error };
    await get().loadGoals();
    return { success: true };
  },

  depositToGoal: async (dto) => {
    const result = await container.depositToGoal.execute(dto);
    if (result.isFailure) return { success: false, error: result.error };
    await get().loadGoals();
    return { success: true };
  },

  withdrawFromGoal: async (dto) => {
    const result = await container.withdrawFromGoal.execute(dto);
    if (result.isFailure) return { success: false, error: result.error };
    await get().loadGoals();
    return { success: true };
  },

  deleteGoal: async (id) => {
    const result = await container.deleteGoal.execute(id);
    if (result.isFailure) return { success: false, error: result.error };
    await get().loadGoals();
    return { success: true };
  },
}));
