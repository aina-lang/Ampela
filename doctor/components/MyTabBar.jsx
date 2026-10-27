import React, { useEffect, useState } from "react";
import { SIZES } from "@/constants";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  Animated,
  Easing,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDiscoveryTheme } from "@/components/discovery";

const BAR_HEIGHT = 64;
const BAR_PADDING_H = 8;
const INDICATOR_HEIGHT = 46;

/**
 * Tab bar flottante — barre blanche en pilule avec un indicateur pastel
 * qui glisse doucement sous l'onglet actif. Icônes accent quand actives,
 * gris doux sinon.
 */
function MyTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const { accentColor, accentContainer } = useDiscoveryTheme();
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [translateY] = useState(() => new Animated.Value(0));

  // Largeur réelle de la barre, mesurée au layout (plus fiable que SIZES.width)
  const [barWidth, setBarWidth] = useState(SIZES.width - 20);

  // Position de l'indicateur pastel qui glisse entre les onglets.
  const [indicatorX] = useState(() => new Animated.Value(BAR_PADDING_H + 8));

  const numRoutes = state.routes.length;
  const innerWidth = barWidth - BAR_PADDING_H * 2;
  const tabWidth = numRoutes > 0 ? innerWidth / numRoutes : 0;
  const indicatorWidth = Math.max(tabWidth - 16, 40);

  useEffect(() => {
    if (!tabWidth) return;

    const targetX =
      BAR_PADDING_H + tabWidth * state.index + (tabWidth - indicatorWidth) / 2;

    Animated.timing(indicatorX, {
      toValue: targetX,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [state.index, tabWidth, indicatorWidth, indicatorX]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
        Animated.timing(translateY, {
          toValue: 120,
          duration: 300,
          easing: Easing.ease,
          useNativeDriver: true,
        }).start();
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          easing: Easing.ease,
          useNativeDriver: true,
        }).start();
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, [translateY]);

  return (
    <View
      style={[
        styles.safeArea,
        // Collée au bord : juste de quoi ne pas chevaucher la barre de
        // gestes sur les téléphones qui en ont une.
        { bottom: Math.max(insets.bottom - 14, 4) },
      ]}
    >
      <Animated.View
        style={[
          styles.tabContainer,
          {
            transform: [{ translateY }],
          },
        ]}
        onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
      >
        {/* Indicateur pastel qui glisse sous l'onglet actif */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.indicator,
            {
              width: indicatorWidth,
              backgroundColor: accentContainer,
              transform: [{ translateX: indicatorX }],
            },
          ]}
        />

        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const icon = options.tabBarIcon;
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

          const hideOnKeyboard = options.tabBarHideOnKeyboard;

          if (isKeyboardVisible && hideOnKeyboard) return null;

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabButton}
            >
              <Ionicons
                name={icon}
                size={22}
                color={isFocused ? accentColor : "#B9B3BE"}
              />
            </TouchableOpacity>
          );
        })}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    width: SIZES.width,
    position: "absolute",
    zIndex: 1,
  },
  tabContainer: {
    width: SIZES.width - 20,
    height: BAR_HEIGHT,
    backgroundColor: "white",
    shadowColor: "#8A7A85",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
    borderRadius: 32,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: BAR_PADDING_H,
    marginHorizontal: 10,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    zIndex: 2,
  },
  indicator: {
    position: "absolute",
    left: 0,
    top: (BAR_HEIGHT - INDICATOR_HEIGHT) / 2,
    height: INDICATOR_HEIGHT,
    borderRadius: INDICATOR_HEIGHT / 2,
    zIndex: 1,
  },
});

export default MyTabBar;
