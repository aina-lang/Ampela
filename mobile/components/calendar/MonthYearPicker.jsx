import React, { useMemo, useState } from "react";
import { Modal, View, Text, StyleSheet, Pressable } from "react-native";
import { SIZES, COLORS } from "@/constants";
import i18n from "@/constants/i18n";
import { PrimaryButton, GhostButton, WheelPicker } from "@/components/ui";

// Plage d'années « sans limite » à l'usage : de 1900 à cent ans après
// l'année courante, la roue défile librement dans les deux sens.
const FIRST_YEAR = 1900;
const YEARS_AHEAD = 100;

/**
 * Fenêtre « Aller à un mois » : deux roues (mois, année) et validation.
 * `monthNames` vient de la locale active du calendrier.
 */
const LAST_YEAR = new Date().getFullYear() + YEARS_AHEAD;
const YEARS = Array.from(
  { length: LAST_YEAR - FIRST_YEAR + 1 },
  (_, i) => FIRST_YEAR + i,
);

/**
 * Carte avec ses deux roues. Montée à chaque ouverture du Modal (qui ne
 * rend ses enfants que visible), elle repart donc toujours du mois affiché.
 */
const PickerCard = ({ month, year, monthNames, onConfirm, onCancel }) => {
  const [tempMonth, setTempMonth] = useState(month);
  const [tempYear, setTempYear] = useState(year);
  const months = useMemo(() => monthNames.map((_, i) => i), [monthNames]);
  const formatMonth = useMemo(() => (m) => monthNames[m], [monthNames]);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{i18n.t("calendarGoToMonth")}</Text>

      <View style={styles.wheels}>
        <WheelPicker
          items={months}
          value={tempMonth}
          onChange={setTempMonth}
          format={formatMonth}
          width={150}
        />
        <WheelPicker
          items={YEARS}
          value={tempYear}
          onChange={setTempYear}
          width={90}
        />
      </View>

      <PrimaryButton
        title={i18n.t("calendarShow")}
        onPress={() => onConfirm(tempMonth, tempYear)}
        style={styles.action}
      />
      <GhostButton title={i18n.t("cancel")} size="sm" onPress={onCancel} />
    </View>
  );
};

const MonthYearPicker = ({
  visible,
  month,
  year,
  monthNames,
  onConfirm,
  onCancel,
}) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    onRequestClose={onCancel}
  >
    <View style={styles.overlay}>
      {/* Fond cliquable derrière la carte : un Pressable autour de la
          carte volerait le geste de défilement des roues sur Android. */}
      <Pressable style={styles.backdrop} onPress={onCancel} />
      <PickerCard
        month={month}
        year={year}
        monthNames={monthNames}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  // Remplissage absolu explicite : StyleSheet.absoluteFill* n'existe plus en RN 0.86.
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 14,
    backgroundColor: COLORS.neutral100,
    borderRadius: 28,
    alignItems: "center",
  },
  title: {
    fontFamily: "Bold",
    fontSize: SIZES.medium + 2,
    color: "#433C47",
    marginBottom: 16,
  },
  wheels: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#F6F5F8",
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  action: {
    alignSelf: "stretch",
    marginBottom: 6,
  },
});

export default MonthYearPicker;
