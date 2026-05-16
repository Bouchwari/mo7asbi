import { ValueObject } from '@domain/shared/ValueObject';
import { SupportedCurrency } from '@domain/shared/value-objects/Money';

export interface UserSettingsPrimitive {
  monthlySalary: number;
  currency:      SupportedCurrency;
  payday:        number;
}

interface UserSettingsProps {
  monthlySalary: number;
  currency:      SupportedCurrency;
  payday:        number;
}

export class UserSettings extends ValueObject<UserSettingsProps> {
  private constructor(props: UserSettingsProps) {
    super(props);
  }

  static default(): UserSettings {
    return new UserSettings({ monthlySalary: 0, currency: 'MAD', payday: 0 });
  }

  static fromPrimitive(p: UserSettingsPrimitive): UserSettings {
    return new UserSettings({
      monthlySalary: p.monthlySalary,
      currency:      p.currency,
      payday:        p.payday,
    });
  }

  get monthlySalary(): number          { return this.props.monthlySalary; }
  get currency(): SupportedCurrency    { return this.props.currency; }
  get payday(): number                 { return this.props.payday; }
  get hasSalary(): boolean             { return this.props.monthlySalary > 0; }
  get hasPayday(): boolean             { return this.props.payday > 0; }

  withMonthlySalary(salary: number): UserSettings {
    return new UserSettings({ ...this.props, monthlySalary: salary });
  }

  withPayday(day: number): UserSettings {
    return new UserSettings({ ...this.props, payday: day });
  }

  toPrimitive(): UserSettingsPrimitive {
    return {
      monthlySalary: this.props.monthlySalary,
      currency:      this.props.currency,
      payday:        this.props.payday,
    };
  }
}
