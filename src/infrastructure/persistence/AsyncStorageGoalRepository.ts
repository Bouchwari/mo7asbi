import AsyncStorage from '@react-native-async-storage/async-storage';
import { IGoalRepository } from '@domain/goal/repositories/IGoalRepository';
import { SavingsGoal, SavingsGoalPrimitive } from '@domain/goal/entities/SavingsGoal';

const STORAGE_KEY = '@hasabi:goals';

export class AsyncStorageGoalRepository implements IGoalRepository {
  private async readAll(): Promise<SavingsGoalPrimitive[]> {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavingsGoalPrimitive[];
  }

  private async writeAll(primitives: SavingsGoalPrimitive[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(primitives));
  }

  async findAll(): Promise<SavingsGoal[]> {
    const primitives = await this.readAll();
    return primitives.map((p) => SavingsGoal.fromPrimitive(p));
  }

  async findById(id: string): Promise<SavingsGoal | null> {
    const primitives = await this.readAll();
    const found = primitives.find((p) => p.id === id);
    return found ? SavingsGoal.fromPrimitive(found) : null;
  }

  async save(goal: SavingsGoal): Promise<void> {
    const primitives = await this.readAll();
    const primitive  = goal.toPrimitive();
    const idx = primitives.findIndex((p) => p.id === primitive.id);
    if (idx >= 0) {
      primitives[idx] = primitive;
    } else {
      primitives.push(primitive);
    }
    await this.writeAll(primitives);
  }

  async delete(id: string): Promise<void> {
    const primitives = await this.readAll();
    await this.writeAll(primitives.filter((p) => p.id !== id));
  }
}
