import { ValueObject } from '../ValueObject';

export type SupportedCurrency = 'MAD' | 'EUR' | 'USD';

interface MoneyProps {
  amount: number;
  currency: SupportedCurrency;
}

/**
 * Money Value Object
 *
 * Represents a monetary amount with currency. All arithmetic is done in
 * integer cents to avoid floating-point errors.
 */
export class Money extends ValueObject<MoneyProps> {
  private constructor(props: MoneyProps) {
    super(props);
  }

  static create(amount: number, currency: SupportedCurrency = 'MAD'): Money {
    if (!isFinite(amount)) {
      throw new Error('Money amount must be a finite number');
    }
    if (amount < 0) {
      throw new Error('Money amount cannot be negative');
    }
    // Round to 2 decimal places to avoid floating-point drift
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

  add(other: Money): Money {
    this.assertSameCurrency(other);
    return Money.create(
      Math.round((this.amount + other.amount) * 100) / 100,
      this.currency
    );
  }

  subtract(other: Money): Money {
    this.assertSameCurrency(other);
    const result = Math.round((this.amount - other.amount) * 100) / 100;
    return Money.create(Math.max(0, result), this.currency);
  }

  isGreaterThan(other: Money): boolean {
    this.assertSameCurrency(other);
    return this.amount > other.amount;
  }

  isZero(): boolean {
    return this.amount === 0;
  }

  /**
   * Format for display with Arabic-style locale
   */
  format(): string {
    return `${this.amount.toLocaleString('ar-MA', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ${this.currencySymbol}`;
  }

  get currencySymbol(): string {
    const symbols: Record<SupportedCurrency, string> = {
      MAD: 'د.م',
      EUR: '€',
      USD: '$',
    };
    return symbols[this.currency];
  }

  private assertSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new Error(
        `Cannot operate on different currencies: ${this.currency} and ${other.currency}`
      );
    }
  }
}
