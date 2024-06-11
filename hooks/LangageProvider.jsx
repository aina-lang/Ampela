import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '@/constants/i18n';

export const LanguageContext = createContext();

const LanguageProvider = ({ children }) => {
  const [locale, setLocale] = useState(i18n._locale);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const loadLocale = async () => {
      try {
        const storedLocale = await AsyncStorage.getItem('user-locale');
        if (storedLocale) {
          i18n.locale = storedLocale;
          setLocale(storedLocale);
        }
      } catch (error) {
        console.error('Failed to load locale from AsyncStorage:', error);
      }
    };
    loadLocale();
  }, []);

  const changeLanguage = async (lang) => {
    setLoading(true);
    try {
      i18n._locale = lang;
      console.log(i18n);
      setLocale(lang);
      await AsyncStorage.setItem('user-locale', lang);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Failed to save locale to AsyncStorage:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LanguageContext.Provider value={{ locale, changeLanguage, loading, refreshKey }}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageProvider;
