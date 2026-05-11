export class Result<T> {
  private readonly _isSuccess: boolean;
  private readonly _error: string | null;
  private readonly _value: T | null;

  private constructor(isSuccess: boolean, error: string | null, value: T | null) {
    this._isSuccess = isSuccess;
    this._error     = error;
    this._value     = value;
  }

  get isSuccess(): boolean { return this._isSuccess; }
  get isFailure(): boolean { return !this._isSuccess; }

  get value(): T {
    if (!this._isSuccess || this._value === null) {
      throw new Error('Cannot access value of a failed Result');
    }
    return this._value;
  }

  get error(): string {
    if (this._isSuccess || this._error === null) {
      throw new Error('Cannot access error of a successful Result');
    }
    return this._error;
  }

  static ok<U>(value: U): Result<U> {
    return new Result<U>(true, null, value);
  }

  static fail<U>(error: string): Result<U> {
    return new Result<U>(false, error, null);
  }
}
