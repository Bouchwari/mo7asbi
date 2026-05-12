import { ValueObject } from '../ValueObject';

export type SupportedCurrency = 'MAD' | 'EUR' | 'USD';

interface MoneyProps {
  amount: number;
  currency: SupportedCurrency;
}

const CURRENCY_SYMBOLS: Record<SupportedCurrency, string> = {
  MAD: 'د.م',
  EUR: '€',
  USD: '$',
} as const;

export class Money extends ValueObject<MoneyProps> {
  private constructor(props: MoneyProps) {
    super(props);
  }

  static create(amount: number, currency: SupportedCurrency = 'MAD'): Money {
    if (!isFinite(amount) || amount < 0) {
      throw new Error('Money amount must be a finite non-negative number');
    }
    return new Money({ amount: Math.round(amount * 100) / 100, currency });
  }

  static zero(currency: SupportedCurrency = 'MAD'): Money {
    return new Money({ amount: 0, currency });
  }

  get amount(): number {
    return this.props.amount;
  }

  get currency(): SupportedCurrency {
    return this.props.currency;
  }

  get currencySymbol(): string {
    return CURRENCY_SYMBOLS[this.currency];
  }

  add(other: Money): Money {
    this.assertSameCurrency(other);
    return Money.create(Math.round((this.amount + other.amount) * 100) / 100, this.currency);
  }

  subtract(other: Money): Money {
    this.assertSameCurrency(other);
    return Money.create(Math.max(0, Math.round((this.amount - other.amount) * 100) / 100), this.currency);
  }

  isGreaterThan(other: Money): boolean {
    this.assertSameCurrency(other);
    return this.amount > other.amount;
  }

  isZero(): boolean {
    return this.amount === 0;
  }

  format(): string {
    const rounded = Math.round(this.amount * 100) / 100;
    const str = rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(2);
    return `${str} ${this.currencySymbol}`;
  }

  private assertSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new Error(`Cannot operate on different currencies: ${this.currency} and ${other.currency}`);
    }
  }
}
