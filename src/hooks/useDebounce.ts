import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce any fast-changing value.
 * Commonly used for search inputs, resize listeners, or auto-save triggers.
 *
 * @param value The value to debounce
 * @param delayMs Delay in milliseconds (default: 250ms)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delayMs = 250): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delayMs]);

  return debouncedValue;
}
