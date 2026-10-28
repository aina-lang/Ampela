import React from "react";
import { Modal, View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SIZES, COLORS } from "@/constants";
import { useDiscoveryTheme } from "@/components/discovery";
import { PrimaryButton, DangerButton, GhostButton } from "@/components/ui";

/**
 * Boîte de confirmation unifiée : pastille d'icône aux couleurs du thème,
 * titre, message, action principale pleine largeur et « Annuler » discret.
 * `danger` passe l'action principale en rouge (suppression définitive).
 */
const ConfirmSheet = ({
  visible,
  icon = "help-circle-outline",
  title,
  message,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}) => {
  const { accentColor, accentContainer } = useDiscoveryTheme();
  const Action = danger ? DangerButton : PrimaryButton;
  const iconBg = danger ? "#FFECEE" : accentContainer;
  const iconColor = danger ? "#E24C6B" : accentColor;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={loading ? undefined : onCancel}
    >
      <Pressable style={styles.overlay} onPress={loading ? undefined : onCancel}>
        <Pressable style={styles.card} onPress={() => {}}>
          <View style={[styles.icon, { backgroundColor: iconBg }]}>
            <Ionicons name={icon} size={28} color={iconColor} />
          </View>
          <Text style={styles.title}>{title}</Text>
          {!!message && <Text style={styles.message}>{message}</Text>}
          <Action
            title={confirmLabel}
            onPress={onConfirm}
            loading={loading}
            style={styles.action}
          />
          <GhostButton
            title={cancelLabel}
            size="sm"
            onPress={onCancel}
            disabled={loading}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 16,
    backgroundColor: COLORS.neutral100,
    borderRadius: 28,
    alignItems: "center",
    shadowColor: "#8A7A85",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 28,
    elevation: 12,
  },
  icon: {
    width: SIZES.scale(60),
    height: SIZES.scale(60),
    borderRadius: SIZES.scale(30),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontFamily: "Bold",
    fontSize: SIZES.medium + 2,
    color: "#433C47",
    textAlign: "center",
    marginBottom: 8,
  },
  message: {
    fontFamily: "Regular",
    fontSize: SIZES.small,
    color: "#7A737F",
    textAlign: "center",
    marginBottom: 22,
    lineHeight: 21,
    paddingHorizontal: 4,
  },
  action: {
    alignSelf: "stretch",
    marginBottom: 6,
  },
});

export default ConfirmSheet;
