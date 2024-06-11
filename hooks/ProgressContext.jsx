// context/ProgressContext.js
import React, { createContext, useState, useContext } from "react";

const ProgressContext = createContext();

export const ProgressProvider = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [text, setText] = useState("");

  const showProgress = (message) => {
    setText(message);
    setIsVisible(true);
  };

  const hideProgress = () => {
    setIsVisible(false);
    setText("");
  };

  return (
    <ProgressContext.Provider value={{ isVisible, text, showProgress, hideProgress }}>
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  return useContext(ProgressContext);
};
