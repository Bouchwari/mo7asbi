import { Entity } from '@domain/shared/Entity';
import { UniqueId } from '@domain/shared/value-objects/UniqueId';
import { Money, SupportedCurrency } from '@domain/shared/value-objects/Money';

export interface SavingsGoalProps {
  name:        string;
  targetAmount: Money;
  savedAmount:  Money;
  emoji:       string;
  deadline?:   Date;
  createdAt:   Date;
}

export interface SavingsGoalPrimitive {
  id:           string;
  name:         string;
  targetAmount: number;
  savedAmount:  number;
  currency:     SupportedCurrency;
  emoji:        string;
  deadline?:    string;
  createdAt:    string;
}

export class SavingsGoal extends Entity<UniqueId> {
  private readonly _props: SavingsGoalProps;

  private constructor(id: UniqueId, props: SavingsGoalProps) {
    super(id);
    this._props = props;
  }

  static create(
    props: Omit<SavingsGoalProps, 'savedAmount' | 'createdAt'>,
    id?: string,
  ): SavingsGoal {
    if (props.targetAmount.isZero()) {
      throw new Error('Target amount must be greater than zero');
    }
    return new SavingsGoal(UniqueId.create(id), {
      ...props,
      savedAmount: Money.zero(props.targetAmount.currency),
      createdAt: new Date(),
    });
  }

  static fromPrimitive(p: SavingsGoalPrimitive): SavingsGoal {
    return new SavingsGoal(UniqueId.create(p.id), {
      name:         p.name,
      targetAmount: Money.create(p.targetAmount, p.currency),
      savedAmount:  Money.create(p.savedAmount,  p.currency),
      emoji:        p.emoji,
      deadline:     p.deadline ? new Date(p.deadline) : undefined,
      createdAt:    new Date(p.createdAt),
    });
  }

  get name(): string          { return this._props.name; }
  get targetAmount(): Money   { return this._props.targetAmount; }
  get savedAmount(): Money    { return this._props.savedAmount; }
  get emoji(): string         { return this._props.emoji; }
  get deadline(): Date | undefined { return this._props.deadline; }
  get createdAt(): Date       { return this._props.createdAt; }

  get progressPercent(): number {
    if (this._props.targetAmount.isZero()) return 0;
    return Math.min(100, (this._props.savedAmount.amount / this._props.targetAmount.amount) * 100);
  }

  get isCompleted(): boolean {
    return this._props.savedAmount.amount >= this._props.targetAmount.amount;
  }

  deposit(amount: Money): SavingsGoal {
    return new SavingsGoal(this._id, {
      ...this._props,
      savedAmount: this._props.savedAmount.add(amount),
    });
  }

  withdraw(amount: Money): SavingsGoal {
    return new SavingsGoal(this._id, {
      ...this._props,
      savedAmount: this._props.savedAmount.subtract(amount),
    });
  }

  toPrimitive(): SavingsGoalPrimitive {
    return {
      id:           this._id.value,
      name:         this._props.name,
      targetAmount: this._props.targetAmount.amount,
      savedAmount:  this._props.savedAmount.amount,
      currency:     this._props.targetAmount.currency,
      emoji:        this._props.emoji,
      deadline:     this._props.deadline?.toISOString(),
      createdAt:    this._props.createdAt.toISOString(),
    };
  }
}
