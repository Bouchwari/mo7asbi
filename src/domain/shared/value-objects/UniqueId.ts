import { ValueObject } from '../ValueObject';

interface UniqueIdProps {
  value: string;
}

function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export class UniqueId extends ValueObject<UniqueIdProps> {
  private constructor(props: UniqueIdProps) {
    super(props);
  }

  static create(value?: string): UniqueId {
    return new UniqueId({ value: value ?? generateId() });
  }

  get value(): string {
    return this.props.value;
  }
}
