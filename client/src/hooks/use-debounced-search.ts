"use client";

import { useEffect, useState } from "react";

/**
 * Custom hook for debounced search with better UX
 * Returns both the immediate input value and the debounced search value
 * This allows the input to update instantly while debouncing the actual search query
 *
 * @param options - Hook options
 * @param options.initialValue - Initial search value (default: "")
 * @param options.delay - Debounce delay in milliseconds (default: 500ms)
 * @returns Object with searchInput (immediate), search (debounced), and setSearchInput function
 */
export function useDebouncedSearch({
  initialValue = "",
  delay = 500,
}: { initialValue?: string; delay?: number } = {}) {
  const [searchInput, setSearchInput] = useState(initialValue);
  const [search, setSearch] = useState(initialValue);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [searchInput, delay]);

  return {
    searchInput,
    search,
    setSearchInput,
  };
}
