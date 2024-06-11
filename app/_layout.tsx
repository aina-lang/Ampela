import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { Stack, useNavigation } from "expo-router";
import "react-native-reanimated";
import store from "@/redux/store";
import ProgressBar from "@/components/ProgreessBar";
import i18n from "@/constants/i18n";
import { ThemeProvider } from "@/hooks/theme-context";
import LanguageProvider from "@/hooks/LangageProvider";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ProgressProvider } from "@/hooks/ProgressContext";

export default function RootLayout() {
  const [locale, setLocale] = useState(i18n.locale);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    i18n.onChange(() => {
      setLoading(true);
      setLocale(i18n.locale);
      setTimeout(() => {
        setLoading(false);
      }, 200);
    });
  }, [locale]);

  return (
    <GestureHandlerRootView>
      <Provider store={store}>
        <ProgressProvider>
          <LanguageProvider>
            <ThemeProvider>
              {/* <ProgressBar /> */}
              <Stack
                screenOptions={{ headerShown: false }}
                // initialRouteName="discovery"
                key={locale}
              >
                <Stack.Screen
                  name="(drawer)"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="(discovery)"
                  options={{ headerShown: false }}
                />
                <Stack.Screen name="+not-found" />
              </Stack>
            </ThemeProvider>
          </LanguageProvider>
        </ProgressProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}
