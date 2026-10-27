import React, { useEffect, useRef, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { SIZES } from "@/constants";
import { useDiscoveryTheme } from "@/components/discovery/DiscoveryTheme";

/**
 * Champ OTP : N cases visuelles pilotées par un seul TextInput invisible.
 * Avantages : le collage d'un code complet fonctionne (le TextInput reçoit
 * toute la chaîne), le clavier propose le code reçu (autoComplete
 * one-time-code / sms-otp) et le curseur suit la saisie case par case.
 *
 * Props : value, onChange(code), length (6), error, editable, autoFocus,
 * onComplete(code) appelé dès que toutes les cases sont remplies.
 */
const OtpInput = ({
  value = "",
  onChange,
  length = 6,
  error,
  editable = true,
  autoFocus = true,
  onComplete,
}) => {
  const { accentColor, accentContainer } = useDiscoveryTheme();
  const inputRef = useRef(null);
  const [focused, setFocused] = useState(false);
  const completedRef = useRef("");

  const digits = value.slice(0, length).split("");

  const handleChange = (text) => {
    // Ne garde que les chiffres (collage « 123 456 », « code: 123456 », etc.)
    const clean = text.replace(/\D/g, "").slice(0, length);
    onChange?.(clean);
  };

  // onComplete une seule fois par code saisi.
  useEffect(() => {
    if (value.length === length && completedRef.current !== value) {
      completedRef.current = value;
      onComplete?.(value);
    }
    if (value.length < length) completedRef.current = "";
  }, [value, length, onComplete]);

  const focus = () => {
    if (!editable) return;
    inputRef.current?.focus();
  };

  return (
    <View>
      <Pressable onPress={focus} style={styles.row}>
        {Array.from({ length }).map((_, i) => {
          const char = digits[i];
          // La case « active » est celle qui recevra le prochain chiffre
          // (ou la dernière quand le code est complet).
          const isActive =
            focused && (i === value.length || (value.length === length && i === length - 1));
          return (
            <View
              key={i}
              style={[
                styles.cell,
                { backgroundColor: error ? "#FFF0F2" : isActive ? accentContainer : "#F6F5F8" },
                isActive && { borderColor: accentColor },
                !!error && styles.cellError,
              ]}
            >
              {char ? (
                <Text style={styles.digit}>{char}</Text>
              ) : (
                isActive && <View style={[styles.caret, { backgroundColor: accentColor }]} />
              )}
            </View>
          );
        })}
      </Pressable>

      {/* TextInput réel, invisible mais focalisable : reçoit la frappe et le collage. */}
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChange}
        maxLength={length}
        keyboardType="number-pad"
        inputMode="numeric"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        importantForAutofill="yes"
        autoFocus={autoFocus}
        editable={editable}
        caretHidden
        contextMenuHidden={false}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={styles.hiddenInput}
      />

      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const CELL = 46;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  cell: {
    width: CELL,
    height: CELL + 8,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  cellError: {
    borderColor: "#F07A8C",
  },
  digit: {
    fontFamily: "Bold",
    fontSize: SIZES.large,
    color: "#433C47",
  },
  caret: {
    width: 2,
    height: 22,
    borderRadius: 1,
  },
  // Superposé aux cases (pour que le menu « Coller » apparaisse dessus)
  // mais totalement transparent.
  hiddenInput: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: CELL + 8,
    opacity: 0,
    color: "transparent",
  },
  error: {
    marginTop: 8,
    fontFamily: "Regular",
    fontSize: SIZES.small,
    color: "#D9475F",
    textAlign: "center",
  },
});

export default OtpInput;
