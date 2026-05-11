import { SavingsGoal } from '../entities/SavingsGoal';

export interface IGoalRepository {
  findAll(): Promise<SavingsGoal[]>;
  findById(id: string): Promise<SavingsGoal | null>;
  save(goal: SavingsGoal): Promise<void>;
  delete(id: string): Promise<void>;
}
