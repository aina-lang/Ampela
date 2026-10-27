import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SIZES } from "@/constants";
import i18n from "@/constants/i18n";
import { useDiscoveryTheme } from "@/components/discovery/DiscoveryTheme";

/**
 * Barre de recherche unifiée — pilule blanche opaque à bordure fine,
 * sans ombre, lisible sur les fonds pastel illustrés,
 * icône loupe à gauche, croix d'effacement quand du texte est saisi.
 * Composant contrôlé : passer `value` + `onChangeText`.
 */
const SearchBar = ({
  value = "",
  onChangeText,
  placeholder,
  backgroundColor = "#FFFFFF",
  containerStyle,
  ...textInputProps
}) => {
  const { accentColor, accentColorDisabled } = useDiscoveryTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View
      style={[
        styles.container,
        // Bordure dans la couleur du thème : accent atténué au repos,
        // accent plein quand le champ a le focus.
        { backgroundColor, borderColor: focused ? accentColor : accentColorDisabled },
        containerStyle,
      ]}
    >
      <Ionicons
        name="search"
        size={18}
        color={accentColor}
        style={styles.searchIcon}
      />
      <TextInput
        style={styles.input}
        placeholder={placeholder ?? i18n.t("rechercher")}
        placeholderTextColor="#7E7684"
        value={value}
        onChangeText={onChangeText}
        selectionColor={accentColor}
        cursorColor={accentColor}
        returnKeyType="search"
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
      {value !== "" && (
        <TouchableOpacity
          onPress={() => onChangeText?.("")}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="close-circle" size={18} color="#A9A4AE" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: 48,
    borderRadius: 999,
    paddingHorizontal: 16,
    // Pas d'ombre : c'est la bordure couleur du thème qui délimite la
    // pilule sur le fond pastel.
    borderWidth: 1.5,
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 0,
    fontFamily: "Regular",
    fontSize: SIZES.medium,
    color: "#443E4A",
  },
});

export default SearchBar;
