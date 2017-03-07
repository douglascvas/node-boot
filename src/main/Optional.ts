function requireNotNull(value) {
  if (value == null) {
    throw new Error("Value must not be null");
  }
  return value;
}

export class Optional<E> {
  private constructor(private value: E|null) {
    this.value = value;
  }

  public static of<T>(value: T): Optional<T> {
    return new Optional<T>(requireNotNull(value));
  }

  public static ofNullable<T>(value: T): Optional<T> {
    return new Optional<T>(value);
  }

  public isPresent(): boolean {
    return this.value !== null && this.value !== undefined;
  }

  public static empty<T>(): Optional<any> {
    return new Optional<T>(null);
  }

  public orElse(value: E): E {
    return value != null ? value : this.value;
  }

  public get(): E {
    if (this.value == null) {
      throw new Error("No value present");
    }
    return this.value;
  }
}