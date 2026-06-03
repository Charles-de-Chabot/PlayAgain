"use client";

import { useState, useEffect } from "react";

/**
 * Custom hook that delays updating a state value until a specified delay has passed.
 * Useful for rate-limiting expensive operations like network requests during text input.
 *
 * @template T - The type of the value being debounced.
 * @param value - The input value to debounce.
 * @param delay - The delay duration in milliseconds (defaults to 300ms).
 * @returns The debounced value.
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
