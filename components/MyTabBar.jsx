import React, { useEffect, useState, useRef } from "react";
import { COLORS, SIZES } from "@/constants";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  View,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Keyboard,
  Animated,
  Easing,
} from "react-native";
import { useSelector } from "@legendapp/state/react";
import { preferenceState } from "@/legendstate/AmpelaStates";

const DROP_SIZE = 50;
const BAR_HEIGHT = 64;
const BAR_PADDING_H = 8;

function MyTabBar({ state, descriptors, navigation }) {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const translateY = useRef(new Animated.Value(0)).current;
  const { theme } = useSelector(() => preferenceState.get());

  // Largeur réelle de la barre, mesurée au layout (plus fiable que SIZES.width)
  const [barWidth, setBarWidth] = useState(SIZES.width - 20);

  // Position + rotation de la goutte unique qui se déplace entre les onglets
  const dropX = useRef(new Animated.Value(0)).current;
  const dropRotate = useRef(new Animated.Value(-45)).current; // -45deg = pointe vers le bas

  const numRoutes = state.routes.length;
  const innerWidth = barWidth - BAR_PADDING_H * 2;
  const tabWidth = numRoutes > 0 ? innerWidth / numRoutes : 0;

  useEffect(() => {
    if (!tabWidth) return;

    const centerX = tabWidth * (state.index + 0.5);
    const targetX = centerX - DROP_SIZE / 2;

    // -1 (tout à gauche) -> 0 (centre) -> 1 (tout à droite)
    const normalized =
      numRoutes > 1 ? (state.index / (numRoutes - 1)) * 2 - 1 : 0;
    // pointe: gauche = 45deg (pointe à gauche), centre = -45deg (pointe en bas), droite = -135deg (pointe à droite)
    const targetRotate = -45 - 90 * normalized;

    Animated.parallel([
      Animated.spring(dropX, {
        toValue: targetX,
        friction: 8,
        tension: 120,
        useNativeDriver: true,
      }),
      Animated.spring(dropRotate, {
        toValue: targetRotate,
        friction: 8,
        tension: 120,
        useNativeDriver: true,
      }),
    ]).start();
  }, [state.index, tabWidth, numRoutes, dropX, dropRotate]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
        Animated.timing(translateY, {
          toValue: 100,
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

  const dropColor = theme === "orange" ? COLORS.accent800 : COLORS.accent500;
  const dropTop = (BAR_HEIGHT - DROP_SIZE) / 2;

  const rotateInterpolated = dropRotate.interpolate({
    inputRange: [-180, 180],
    outputRange: ["-180deg", "180deg"],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View
        style={[
          styles.tabContainer,
          {
            transform: [{ translateY }],
          },
        ]}
        onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
      >
        {/* Goutte unique qui glisse et tourne selon sa position */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.drop,
            {
              top: dropTop,
              backgroundColor: dropColor,
              transform: [
                { translateX: dropX },
                { rotate: rotateInterpolated },
              ],
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

          const iconColor = isFocused ? "white" : "#bdb9b9";

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
              <Ionicons name={icon} size={22} color={iconColor} />
            </TouchableOpacity>
          );
        })}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    width: SIZES.width,
    position: "absolute",
    bottom: 10,
    zIndex: 1,
  },
  tabContainer: {
    width: SIZES.width - 20,
    height: BAR_HEIGHT,
    backgroundColor: "white",
    shadowColor: "black",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
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
  drop: {
    position: "absolute",
    left: 0,
    width: DROP_SIZE,
    height: DROP_SIZE,
    borderTopLeftRadius: DROP_SIZE / 2,
    borderTopRightRadius: DROP_SIZE / 2,
    borderBottomRightRadius: DROP_SIZE / 2,
    borderBottomLeftRadius: 0,
    zIndex: 1,
  },
});

export default MyTabBar;