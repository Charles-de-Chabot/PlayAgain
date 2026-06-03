"use client";

import { useEffect, useRef, RefObject } from "react";

/**
 * Custom hook that detects clicks outside of the referenced element and triggers a callback.
 * Typically used for closing dropdowns, modals, context menus, and tooltips.
 *
 * @template T - The type of the HTML element to reference (e.g., HTMLDivElement, HTMLElement).
 * @param callback - The function to execute when a click outside the referenced element is detected.
 * @returns A React ref object to be attached to the element that should detect outside clicks.
 */
export function useOutsideClick<T extends HTMLElement = HTMLElement>(
  callback: () => void
): RefObject<T | null> {
  const ref = useRef<T>(null);

  useEffect(() => {
    /**
     * Document mouse click event handler.
     * Checks if the clicked target is outside of the referenced DOM element.
     * @param event - The mouse event.
     */
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [callback]);

  return ref;
}
