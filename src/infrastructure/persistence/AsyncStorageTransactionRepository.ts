import AsyncStorage from '@react-native-async-storage/async-storage';
import { ITransactionRepository } from '@domain/transaction/repositories/ITransactionRepository';
import { Transaction, TransactionPrimitive } from '@domain/transaction/entities/Transaction';

const STORAGE_KEY = '@hasabi:transactions';

export class AsyncStorageTransactionRepository implements ITransactionRepository {
  private async readAll(): Promise<TransactionPrimitive[]> {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as TransactionPrimitive[];
  }

  private async writeAll(primitives: TransactionPrimitive[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(primitives));
  }

  async findAll(): Promise<Transaction[]> {
    const primitives = await this.readAll();
    return primitives
      .map((p) => Transaction.fromPrimitive(p))
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  async findById(id: string): Promise<Transaction | null> {
    const primitives = await this.readAll();
    const found = primitives.find((p) => p.id === id);
    return found ? Transaction.fromPrimitive(found) : null;
  }

  async findByMonth(year: number, month: number): Promise<Transaction[]> {
    const all = await this.findAll();
    return all.filter((tx) => {
      const d = tx.date;
      return d.getFullYear() === year && d.getMonth() + 1 === month;
    });
  }

  async save(transaction: Transaction): Promise<void> {
    const primitives = await this.readAll();
    const primitive  = transaction.toPrimitive();
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
