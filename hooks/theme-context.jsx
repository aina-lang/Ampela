import i18n from '@/constants/i18n';
import { updatePreference } from '@/redux/preferenceSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(null);
  const dispatch = useDispatch();

    useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem('user-theme');
        if (storedTheme) {
          i18n.locale = storedTheme;
          setTheme(storedTheme);
        }
      } catch (error) {
        console.error('Failed to load locale from AsyncStorage:', error);
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async(theme) => {
    setTheme(theme);
    await AsyncStorage.setItem('user-theme', theme);
    const preferenceData = {
      theme: theme,
    };
    dispatch(updatePreference(preferenceData));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
