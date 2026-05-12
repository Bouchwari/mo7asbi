import { ValueObject } from '@domain/shared/ValueObject';

export enum TransactionType {
  INCOME  = 'income',
  EXPENSE = 'expense',
}

export enum CategoryId {
  // Expense
  FOOD          = 'food',
  TRANSPORT     = 'transport',
  SHOPPING      = 'shopping',
  ENTERTAINMENT = 'entertainment',
  HEALTH        = 'health',
  EDUCATION     = 'education',
  HOUSING       = 'housing',
  BILLS         = 'bills',
  OTHER_EXPENSE = 'other_expense',
  // Income
  SALARY        = 'salary',
  FREELANCE     = 'freelance',
  GIFT          = 'gift',
  SAVINGS       = 'savings',
  OTHER_INCOME  = 'other_income',
}

export interface CategoryMeta {
  id:    CategoryId;
  type:  TransactionType;
  icon:  string;
  color: string;
}

export const CATEGORIES: Record<CategoryId, CategoryMeta> = {
  [CategoryId.FOOD]:          { id: CategoryId.FOOD,          type: TransactionType.EXPENSE, icon: '🍔', color: '#D97706' },
  [CategoryId.TRANSPORT]:     { id: CategoryId.TRANSPORT,     type: TransactionType.EXPENSE, icon: '🚗', color: '#2563EB' },
  [CategoryId.SHOPPING]:      { id: CategoryId.SHOPPING,      type: TransactionType.EXPENSE, icon: '🛍️', color: '#9333EA' },
  [CategoryId.ENTERTAINMENT]: { id: CategoryId.ENTERTAINMENT, type: TransactionType.EXPENSE, icon: '🎮', color: '#DB2777' },
  [CategoryId.HEALTH]:        { id: CategoryId.HEALTH,        type: TransactionType.EXPENSE, icon: '💊', color: '#DC2626' },
  [CategoryId.EDUCATION]:     { id: CategoryId.EDUCATION,     type: TransactionType.EXPENSE, icon: '📚', color: '#0891B2' },
  [CategoryId.HOUSING]:       { id: CategoryId.HOUSING,       type: TransactionType.EXPENSE, icon: '🏠', color: '#059669' },
  [CategoryId.BILLS]:         { id: CategoryId.BILLS,         type: TransactionType.EXPENSE, icon: '🧾', color: '#CA8A04' },
  [CategoryId.OTHER_EXPENSE]: { id: CategoryId.OTHER_EXPENSE, type: TransactionType.EXPENSE, icon: '💸', color: '#6B7280' },
  [CategoryId.SALARY]:        { id: CategoryId.SALARY,        type: TransactionType.INCOME,  icon: '💼', color: '#16A34A' },
  [CategoryId.FREELANCE]:     { id: CategoryId.FREELANCE,     type: TransactionType.INCOME,  icon: '💻', color: '#0891B2' },
  [CategoryId.GIFT]:          { id: CategoryId.GIFT,          type: TransactionType.INCOME,  icon: '🎁', color: '#D97706' },
  [CategoryId.SAVINGS]:       { id: CategoryId.SAVINGS,       type: TransactionType.INCOME,  icon: '🐷', color: '#16A34A' },
  [CategoryId.OTHER_INCOME]:  { id: CategoryId.OTHER_INCOME,  type: TransactionType.INCOME,  icon: '💰', color: '#6B7280' },
} as const;

interface CategoryProps {
  id: CategoryId;
}

export class Category extends ValueObject<CategoryProps> {
  private constructor(props: CategoryProps) {
    super(props);
  }

  static create(id: CategoryId): Category {
    return new Category({ id });
  }

  get id(): CategoryId {
    return this.props.id;
  }

  get meta(): CategoryMeta {
    return CATEGORIES[this.props.id];
  }
}
