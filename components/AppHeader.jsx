import React from "react";
import { View, Text, TouchableOpacity, StatusBar, Platform } from "react-native";
import { SIZES, COLORS } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "@legendapp/state/react";
import { preferenceState } from "@/legendstate/AmpelaStates";

const STATUS_BAR_HEIGHT = Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0;

/**
 * AppHeader
 *
 * Header avec fond coloré (thème pink/accent), coins arrondis en bas, sans ombre.
 */
const AppHeader = ({
  navigation,
  title,
  showBack,
  onBackPress,
  rightIcons,
  absolute,
  bgColor: customBg,
}) => {
  const { theme } = useSelector(() => preferenceState.get());
  const accentColor = customBg || (theme === "pink" ? COLORS.accent500 : COLORS.accent800);

  const headerHeight = SIZES.height * 0.09 + STATUS_BAR_HEIGHT;

  return (
    <View
      style={[
        styles.wrapper,
        { height: headerHeight, backgroundColor: accentColor },
        absolute && styles.absolute,
      ]}
    >
      <View
        style={[
          styles.content,
          { paddingTop: STATUS_BAR_HEIGHT + 6, height: headerHeight },
        ]}
      >
        <View style={styles.left}>
          {showBack ? (
            <TouchableOpacity
              onPress={onBackPress || (() => navigation.goBack())}
              style={styles.iconButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" color={COLORS.white || "white"} size={26} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.openDrawer()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <View style={styles.burger}>
                <View style={styles.burgerLine} />
                <View style={[styles.burgerLine, { width: 20 }]} />
                <View style={styles.burgerLine} />
              </View>
            </TouchableOpacity>
          )}

          {!!title && (
            <Text numberOfLines={1} style={styles.title}>
              {title}
            </Text>
          )}
        </View>

        {!!rightIcons?.length && (
          <View style={styles.right}>
            {rightIcons.map((icon, index) => (
              <TouchableOpacity
                key={index}
                style={styles.iconButton}
                onPress={icon.onPress}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name={icon.name} color={COLORS.white || "white"} size={26} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = {
  wrapper: {
    width: SIZES.width,
    zIndex: 50,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: "hidden",
  },
  absolute: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    width: "100%",
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flexShrink: 1,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconButton: {
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  burger: {
    width: 24,
    gap: 6,
  },
  burgerLine: {
    height: 3,
    width: 24,
    backgroundColor: "white",
    borderRadius: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "white",
    flexShrink: 1,
  },
};

export default AppHeader;