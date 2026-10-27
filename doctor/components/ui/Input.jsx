import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SIZES } from "@/constants";
import { useDiscoveryTheme } from "@/components/discovery/DiscoveryTheme";

/**
 * Champ de saisie unifié — rempli, sans bordure, coins très arrondis.
 * Le focus est signalé par un fond légèrement teinté accent, l'erreur
 * par un fond rosé + message sous le champ.
 */
const Input = ({
  icon,
  rightIcon,
  onRightIconPress,
  error,
  containerStyle,
  inputStyle,
  backgroundColor = "#F6F5F8",
  // Compat : accepté mais ignoré (le design n'utilise plus de bordures).
  borderColor,
  multiline = false,
  ...textInputProps
}) => {
  const { accentColor, accentContainer } = useDiscoveryTheme();
  const [focused, setFocused] = useState(false);

  const bg = error ? "#FFF0F2" : focused ? accentContainer : backgroundColor;

  return (
    <View style={containerStyle}>
      <View
        style={[
          styles.wrapper,
          multiline && styles.wrapperMultiline,
          { backgroundColor: bg },
        ]}
      >
        {icon && <View style={styles.iconLeft}>{icon}</View>}
        <TextInput
          style={[styles.input, multiline && styles.inputMultiline, inputStyle]}
          placeholderTextColor="#A9A4AE"
          selectionColor={accentColor}
          cursorColor={accentColor}
          multiline={multiline}
          onFocus={(e) => {
            setFocused(true);
            textInputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            textInputProps.onBlur?.(e);
          }}
          {...textInputProps}
        />
        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.iconRight}
            activeOpacity={0.7}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  // Forme pilule, comme les boutons et la barre de recherche.
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    paddingHorizontal: 20,
    height: 56,
  },
  // Le multiligne garde des coins arrondis classiques (une pilule ne
  // fonctionne pas sur un bloc haut).
  wrapperMultiline: {
    height: undefined,
    minHeight: 56,
    paddingVertical: 14,
    alignItems: "flex-start",
    borderRadius: 22,
  },
  iconLeft: {
    marginRight: 12,
  },
  iconRight: {
    marginLeft: 12,
    padding: 4,
  },
  input: {
    flex: 1,
    paddingVertical: 0,
    fontFamily: "Regular",
    fontSize: SIZES.medium,
    color: "#443E4A",
  },
  inputMultiline: {
    textAlignVertical: "top",
  },
  error: {
    color: "#E24C6B",
    fontSize: SIZES.small - 1,
    marginTop: 6,
    marginLeft: 6,
    fontFamily: "Regular",
  },
});

export default Input;
