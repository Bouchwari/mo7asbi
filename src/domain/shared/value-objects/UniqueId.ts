import { ValueObject } from '../ValueObject';
import { v4 as uuidv4 } from 'uuid';

interface UniqueIdProps {
  value: string;
}

export class UniqueId extends ValueObject<UniqueIdProps> {
  private constructor(props: UniqueIdProps) {
    super(props);
  }

  static create(value?: string): UniqueId {
    return new UniqueId({ value: value ?? uuidv4() });
  }

  get value(): string {
    return this.props.value;
  }
}
