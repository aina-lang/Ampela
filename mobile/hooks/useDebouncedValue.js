import { useEffect, useState } from "react";

/** Valeur recopiée après un délai sans changement (saisie de recherche). */
export const useDebouncedValue = (value, delayMs = 350) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
};
