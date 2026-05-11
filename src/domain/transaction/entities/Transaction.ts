import { Entity } from '@domain/shared/Entity';
import { UniqueId } from '@domain/shared/value-objects/UniqueId';
import { Money, SupportedCurrency } from '@domain/shared/value-objects/Money';
import { Category, CategoryId, TransactionType } from '../value-objects/Category';

export interface RecurringConfig {
  isRecurring: boolean;
  dayOfMonth?: number;
}

export interface TransactionProps {
  amount:      Money;
  category:    Category;
  type:        TransactionType;
  date:        Date;
  note?:       string;
  recurring:   RecurringConfig;
  templateId?: string;
  createdAt:   Date;
  updatedAt:   Date;
}

export interface TransactionPrimitive {
  id:          string;
  amount:      number;
  currency:    SupportedCurrency;
  categoryId:  CategoryId;
  type:        TransactionType;
  date:        string;
  note?:       string;
  recurring:   RecurringConfig;
  templateId?: string;
  createdAt:   string;
  updatedAt:   string;
}

export class Transaction extends Entity<UniqueId> {
  private readonly _props: TransactionProps;

  private constructor(id: UniqueId, props: TransactionProps) {
    super(id);
    this._props = props;
  }

  static create(
    props: Omit<TransactionProps, 'createdAt' | 'updatedAt'>,
    id?: string,
  ): Transaction {
    if (props.amount.isZero()) {
      throw new Error('Transaction amount must be greater than zero');
    }
    if (props.recurring.isRecurring && props.recurring.dayOfMonth === undefined) {
      throw new Error('Recurring transactions must specify a day of month');
    }
    const now = new Date();
    return new Transaction(UniqueId.create(id), { ...props, createdAt: now, updatedAt: now });
  }

  static fromPrimitive(p: TransactionPrimitive): Transaction {
    return new Transaction(UniqueId.create(p.id), {
      amount:     Money.create(p.amount, p.currency),
      category:   Category.create(p.categoryId),
      type:       p.type,
      date:       new Date(p.date),
      note:       p.note,
      recurring:  p.recurring,
      templateId: p.templateId,
      createdAt:  new Date(p.createdAt),
      updatedAt:  new Date(p.updatedAt),
    });
  }

  get amount(): Money        { return this._props.amount; }
  get category(): Category   { return this._props.category; }
  get type(): TransactionType { return this._props.type; }
  get date(): Date           { return this._props.date; }
  get note(): string | undefined { return this._props.note; }
  get recurring(): RecurringConfig { return this._props.recurring; }
  get templateId(): string | undefined { return this._props.templateId; }
  get createdAt(): Date      { return this._props.createdAt; }

  get isExpense(): boolean { return this._props.type === TransactionType.EXPENSE; }
  get isIncome(): boolean  { return this._props.type === TransactionType.INCOME; }

  updateNote(note: string): Transaction {
    return new Transaction(this._id, { ...this._props, note, updatedAt: new Date() });
  }

  toPrimitive(): TransactionPrimitive {
    return {
      id:         this._id.value,
      amount:     this._props.amount.amount,
      currency:   this._props.amount.currency,
      categoryId: this._props.category.id,
      type:       this._props.type,
      date:       this._props.date.toISOString(),
      note:       this._props.note,
      recurring:  this._props.recurring,
      templateId: this._props.templateId,
      createdAt:  this._props.createdAt.toISOString(),
      updatedAt:  this._props.updatedAt.toISOString(),
    };
  }
}
