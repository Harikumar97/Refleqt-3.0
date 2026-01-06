/**
 * Safety-Critical Assertion Utilities
 * Power of Ten Rule 5: Minimum 2 assertions per function
 */

export class AssertionError extends Error {
  constructor(message: string, public readonly context?: unknown) {
    super(message);
    this.name = 'AssertionError';
  }
}

export function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new AssertionError(`Assertion failed: ${message}`);
  }
}

export function assertDefined<T>(
  value: T | null | undefined,
  message: string
): asserts value is T {
  assert(value !== null && value !== undefined, message);
}

export function assertInRange(value: number, min: number, max: number, message: string): void {
  assert(value >= min && value <= max, `${message} (value: ${value}, range: [${min}, ${max}])`);
}

export function assertNonEmptyString(value: string, message: string): asserts value is string {
  assert(typeof value === 'string' && value.length > 0, message);
}

export function assertSafeInteger(value: number, message: string): void {
  assert(Number.isSafeInteger(value), `${message} (value: ${value})`);
}
