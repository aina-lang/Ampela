import { useEffect, useState } from "react";

let visitedRoute = null;
let listeners = [];

const notifyListeners = () => {
  listeners.forEach((listener) => listener(visitedRoute));
};

export const setVisitedRoute = (route) => {
  visitedRoute = route;
  notifyListeners();
};

export const getVisitedRoute = () => visitedRoute;

export const clearVisitedRoute = () => {
  visitedRoute = null;
  notifyListeners();
};

export const useVisitedRoute = () => {
  const [route, setRoute] = useState(visitedRoute);

  useEffect(() => {
    const listener = (newRoute) => setRoute(newRoute);
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  return route;
};
