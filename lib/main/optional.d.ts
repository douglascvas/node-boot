export declare class Optional<E> {
    private value;
    private constructor(value);
    static of<T>(value: T): Optional<T>;
    static ofNullable<T>(value: T): Optional<T>;
    isPresent(): boolean;
    static empty<T>(): Optional<any>;
    orElse(value: E): E;
    get(): E;
}
