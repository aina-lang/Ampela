import React, { useEffect, useState, useRef } from "react";
import { SIZES } from "@/constants";
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

function MyTabBar({ state, descriptors, navigation }) {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const translateY = useRef(new Animated.Value(0)).current; // Initialise la valeur animée pour translateY

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
        Animated.timing(translateY, {
          toValue: 100, // Valeur pour déplacer la barre d'onglets vers le bas
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
          toValue: 0, // Valeur pour ramener la barre d'onglets à sa position initiale
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
    <SafeAreaView style={styles.safeArea}>
      <Animated.View
        style={[
          styles.tabContainer,
          {
            transform: [{ translateY }],
          },
        ]}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel ?? options.title ?? route.name;
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

          return !isKeyboardVisible || !hideOnKeyboard ? (
            <View
              key={index}
              style={[route.name === "index" ? styles.indexContainer : null]}
            >
              <TouchableOpacity
                key={index}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={options.tabBarTestID}
                onPress={onPress}
                onLongPress={onLongPress}
                style={[
                  styles.tabButton,

                  route.name === "index" ? styles.indexTabButton : null,
                  isFocused ? styles.tabButtonFocused : null,
                ]}
              >
                <Ionicons
                  name={icon}
                  size={24}
                  color={
                    isFocused
                      ? "white"
                      : route.name === "index"
                      ? "white"
                      : "#bdb9b9"
                  }
                />
              </TouchableOpacity>
            </View>
          ) : null;
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
    zIndex: 10,
  },
  tabContainer: {
    width: SIZES.width - 20,
    height: 60,
    backgroundColor: "white",
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderRadius: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    marginHorizontal: 10,
  },
  tabButton: {
    padding: 10,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  tabButtonFocused: {
    backgroundColor: "#FF7575",
    borderRadius: 50,
  },
  indexTabButton: {
    position: "absolute",
    top: -20,

    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFADAD",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  indexContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    order: 2,
  },
});

export default MyTabBar;
