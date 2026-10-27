import { useEffect, useState } from "react";

// Signal de scroll partagé entre les écrans et l'AppHeader : le header
// devient opaque dès qu'on scrolle, redevient transparent en haut.
let scrolled = false;
let listeners = [];

export const setHeaderScrolled = (value) => {
  if (scrolled === value) return;
  scrolled = value;
  listeners.forEach((listener) => listener(value));
};

/** À passer tel quel à onScroll (avec scrollEventThrottle={16}). */
export const handleHeaderScroll = (event) => {
  setHeaderScrolled(event.nativeEvent.contentOffset.y > 16);
};

export const useHeaderScrolled = () => {
  const [value, setValue] = useState(scrolled);

  useEffect(() => {
    const listener = (next) => setValue(next);
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  return value;
};
