/**
 * Safety-Critical Utilities
 * Power of Ten Rules for safe iteration
 */

import { assert } from './assert';
import { BOUNDS } from './constants';

export type SafeResult<T, E = Error> =
  | { success: true; value: T }
  | { success: false; error: E };

export function ok<T>(value: T): SafeResult<T> {
  return { success: true, value };
}

export function err<E = Error>(error: E): SafeResult<never, E> {
  return { success: false, error };
}

export function safeIterate<T>(
  items: T[],
  callback: (item: T, index: number) => void,
  maxIterations: number = BOUNDS.MAX_ITERATIONS
): SafeResult<void> {
  const limit = Math.min(items.length, maxIterations);

  for (let i = 0; i < limit; i++) {
    const item = items[i];
    if (item === undefined) {
      return err(new Error(`Item at index ${i} is undefined`));
    }
    callback(item, i);
  }

  return ok(undefined);
}

export function clamp(value: number, min: number, max: number): number {
  assert(min <= max, 'Min must be <= max');
  return Math.max(min, Math.min(max, value));
}

export function safeParseInt(value: string): SafeResult<number> {
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    return err(new Error(`Failed to parse "${value}" as integer`));
  }
  return ok(parsed);
}

export function safeJsonParse<T>(json: string): SafeResult<T> {
  try {
    return ok(JSON.parse(json) as T);
  } catch (error) {
    return err(error instanceof Error ? error : new Error('JSON parse failed'));
  }
}
