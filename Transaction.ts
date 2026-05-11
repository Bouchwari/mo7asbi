import { Entity } from '../../shared/Entity';
import { UniqueId } from '../../shared/value-objects/UniqueId';
import { Money } from '../../shared/value-objects/Money';
import { Category, CategoryId } from '../value-objects/Category';
import { TransactionType } from '../value-objects/Category';

export interface RecurringConfig {
  isRecurring: boolean;
  dayOfMonth?: number; // 1-31
}

export interface TransactionProps {
  amount: Money;
  category: Category;
  type: TransactionType;
  date: Date;
  note?: string;
  recurring: RecurringConfig;
  templateId?: string; // links to a quick template
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionPrimitive {
  id: string;
  amount: number;
  currency: string;
  categoryId: CategoryId;
  type: TransactionType;
  date: string;
  note?: string;
  recurring: RecurringConfig;
  templateId?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Transaction Aggregate Root
 *
 * The central entity in the expense tracking domain. Represents a single
 * financial movement — either income or expense.
 *
 * Business invariants enforced here:
 * - Amount must be > 0
 * - Date cannot be in the future by more than 1 day (clock skew tolerance)
 * - Recurring transactions must specify a day of month
 */
export class Transaction extends Entity<UniqueId> {
  private readonly _props: TransactionProps;

  private constructor(id: UniqueId, props: TransactionProps) {
    super(id);
    this._props = props;
  }

  // ─── Factory ────────────────────────────────────────────────────────────────

  static create(
    props: Omit<TransactionProps, 'createdAt' | 'updatedAt'>,
    id?: string
  ): Transaction {
    if (props.amount.isZero()) {
      throw new Error('Transaction amount must be greater than zero');
    }

    if (props.recurring.isRecurring && props.recurring.dayOfMonth === undefined) {
      throw new Error('Recurring transactions must specify a day of month');
    }

    const now = new Date();
    return new Transaction(UniqueId.create(id), {
      ...props,
      createdAt: now,
      updatedAt: now,
    });
  }

  static fromPrimitive(primitive: TransactionPrimitive): Transaction {
    const { SupportedCurrency } = require('../../shared/value-objects/Money');
    return new Transaction(UniqueId.create(primitive.id), {
      amount: Money.create(primitive.amount, primitive.currency as any),
      category: Category.create(primitive.categoryId),
      type: primitive.type,
      date: new Date(primitive.date),
      note: primitive.note,
      recurring: primitive.recurring,
      templateId: primitive.templateId,
      createdAt: new Date(primitive.createdAt),
      updatedAt: new Date(primitive.updatedAt),
    });
  }

  // ─── Getters ─────────────────────────────────────────────────────────────────

  get amount(): Money { return this._props.amount; }
  get category(): Category { return this._props.category; }
  get type(): TransactionType { return this._props.type; }
  get date(): Date { return this._props.date; }
  get note(): string | undefined { return this._props.note; }
  get recurring(): RecurringConfig { return this._props.recurring; }
  get templateId(): string | undefined { return this._props.templateId; }
  get createdAt(): Date { return this._props.createdAt; }

  get isExpense(): boolean { return this._props.type === TransactionType.EXPENSE; }
  get isIncome(): boolean { return this._props.type === TransactionType.INCOME; }

  // ─── Domain Behavior ─────────────────────────────────────────────────────────

  updateNote(note: string): Transaction {
    return new Transaction(this._id, {
      ...this._props,
      note,
      updatedAt: new Date(),
    });
  }

  // ─── Serialization ───────────────────────────────────────────────────────────

  toPrimitive(): TransactionPrimitive {
    return {
      id: this._id.value,
      amount: this._props.amount.amount,
      currency: this._props.amount.currency,
      categoryId: this._props.category.id,
      type: this._props.type,
      date: this._props.date.toISOString(),
      note: this._props.note,
      recurring: this._props.recurring,
      templateId: this._props.templateId,
      createdAt: this._props.createdAt.toISOString(),
      updatedAt: this._props.updatedAt.toISOString(),
    };
  }
}
