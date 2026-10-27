import React, { useState } from "react";
import {
  View,
  Text,
  Switch,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
} from "react-native";
import { COLORS, SIZES } from "@/constants";
import { useSelector } from "@legendapp/state/react";
import {
  reminderState,
  updateReminder,
  cycleMenstruelState,
} from "@/legendstate/AmpelaStates";
import {
  REMINDER_KIND,
  FREQUENCY_OPTIONS,
  scheduleReminder as scheduleReminderNotifications,
  cancelReminder as cancelReminderNotifications,
  nextEventLabel,
} from "@/services/reminders";
import { useDiscoveryTheme } from "@/components/discovery";
import { NeutralButton, PrimaryButton, WheelPicker, toast } from "@/components/ui";

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

const pad = (n) => String(n).padStart(2, "0");

const ReminderItem = ({ as, onRegister }) => {
  const { accentColor } = useDiscoveryTheme();
  // Configuration persistée (AsyncStorage via Legend State) : le rappel
  // survit aux redémarrages de l'app, comme la notification planifiée
  // côté OS.
  const saved = useSelector(() => reminderState[as].get()) || {};
  const cycles = useSelector(() => cycleMenstruelState.get().cyclesData) || [];
  const kind = REMINDER_KIND[as] ?? "pill";
  const isEventReminder = kind !== "pill";
  const isEnabled = !!saved.enabled;
  const hour = saved.hour ?? 8;
  const minute = saved.minute ?? 0;
  const frequency = saved.frequency ?? "quotidien";
  const nextEvent = nextEventLabel(as, cycles);

  const [modalVisible, setModalVisible] = useState(false);
  // Valeurs en cours d'édition dans le modal (validées au "Terminer").
  const [tempHour, setTempHour] = useState(hour);
  const [tempMinute, setTempMinute] = useState(minute);
  const [tempFrequency, setTempFrequency] = useState(frequency);

  const frequencyLabel = (value) =>
    FREQUENCY_OPTIONS.find((o) => o.value === value)?.label?.toLowerCase() ??
    "quotidien";

  const schedule = (config) => scheduleReminderNotifications(as, config, cycles);
  const cancel = () => cancelReminderNotifications(saved);

  const toggleSwitch = async () => {
    if (!isEnabled) {
      try {
        const ids = await schedule({ hour, minute, frequency });
        if (!ids) {
          toast.warning("Autorisez les notifications pour activer les rappels.");
          return;
        }
        updateReminder(as, {
          enabled: true,
          notificationIds: ids,
          notificationId: null,
          hour,
          minute,
          frequency,
          scheduledAt: Date.now(),
        });
        if (!isEventReminder) {
          toast.success(
            frequency === "quotidien"
              ? `Rappel « ${as} » activé, chaque jour à ${pad(hour)}:${pad(minute)}, avec le jour de votre cycle.`
              : `Rappel « ${as} » activé, ${frequencyLabel(frequency)} à ${pad(hour)}:${pad(minute)}.`
          );
        } else if (ids.length && nextEvent) {
          toast.success(
            `Rappel « ${as} » activé. Prochaine notification : ${nextEvent} à ${pad(hour)}:${pad(minute)}.`
          );
        } else {
          toast.success(`Rappel « ${as} » activé : aucune date à venir pour l'instant.`);
        }
      } catch (error) {
        console.error("Failed to schedule reminder:", error);
        toast.error("Impossible d'activer le rappel.");
      }
    } else {
      await cancel();
      updateReminder(as, { enabled: false, notificationIds: [], notificationId: null });
      toast.info(`Rappel « ${as} » désactivé.`);
    }
  };

  const openModal = () => {
    setTempHour(hour);
    setTempMinute(minute);
    setTempFrequency(frequency);
    setModalVisible(true);
  };

  const handleConfirm = async () => {
    setModalVisible(false);
    onRegister?.(as, tempHour, tempMinute, tempFrequency);
    try {
      let ids = saved.notificationIds ?? [];
      if (isEnabled) {
        // Reprogramme avec la nouvelle heure / anticipation.
        await cancel();
        ids = (await schedule({
          hour: tempHour,
          minute: tempMinute,
          frequency: tempFrequency,
        })) ?? [];
      }
      updateReminder(as, {
        hour: tempHour,
        minute: tempMinute,
        frequency: tempFrequency,
        notificationIds: ids,
        scheduledAt: Date.now(),
        notificationId: null,
      });
    } catch (error) {
      console.error("Failed to reschedule reminder:", error);
    }
  };

  const renderFrequencyItem = ({ item }) => {
    const isSelected = item.value === tempFrequency;
    return (
      <TouchableOpacity
        onPress={() => setTempFrequency(item.value)}
        style={[
          styles.chip,
          { backgroundColor: isSelected ? accentColor : "#F6F5F8" },
        ]}
        activeOpacity={0.85}
      >
        <Text
          style={[
            styles.chipText,
            { color: isSelected ? COLORS.neutral100 : "#5A525F" },
          ]}
        >
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View>
      <TouchableOpacity
        onPress={openModal}
        style={styles.container}
        activeOpacity={0.85}
      >
        <View style={styles.left}>
          <Text style={styles.title}>{as}</Text>
          <Text style={styles.subtitle}>
            {pad(hour)}:{pad(minute)} · {frequencyLabel(frequency)}
          </Text>
        </View>
        <Switch
          trackColor={{ false: "#E5E5E5", true: accentColor }}
          thumbColor={COLORS.neutral100}
          ios_backgroundColor="#E5E5E5"
          onValueChange={toggleSwitch}
          value={isEnabled}
        />
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>{as}</Text>

            <Text style={styles.sectionLabel}>Heure du rappel</Text>
            {/* Roues heure / minute, comme un sélecteur d'heure natif */}
            <View style={styles.wheelRow}>
              <WheelPicker
                items={HOURS}
                value={tempHour}
                onChange={setTempHour}
                format={pad}
              />
              <Text style={styles.stepperColon}>:</Text>
              <WheelPicker
                items={MINUTES}
                value={tempMinute}
                onChange={setTempMinute}
                format={pad}
              />
            </View>

            <Text style={styles.sectionLabel}>Périodicité</Text>
            <FlatList
              data={FREQUENCY_OPTIONS}
              renderItem={renderFrequencyItem}
              keyExtractor={(item) => item.value}
              contentContainerStyle={styles.chipList}
              showsVerticalScrollIndicator={false}
            />

            <View style={styles.modalActions}>
              <NeutralButton
                title="Annuler"
                onPress={() => setModalVisible(false)}
                style={{ flex: 1 }}
              />
              <PrimaryButton
                title="Terminer"
                onPress={handleConfirm}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.neutral100,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  left: {
    gap: 4,
  },
  title: {
    fontFamily: "SBold",
    fontSize: SIZES.medium,
    color: "#433C47",
  },
  subtitle: {
    fontFamily: "Regular",
    fontSize: SIZES.small - 1,
    color: "#8A8A8A",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalView: {
    backgroundColor: COLORS.neutral100,
    width: SIZES.width - 40,
    borderRadius: 20,
    padding: 24,
  },
  modalTitle: {
    fontFamily: "Bold",
    fontSize: SIZES.medium + 2,
    color: "#433C47",
    textAlign: "center",
    marginBottom: 20,
  },
  sectionLabel: {
    fontFamily: "SBold",
    fontSize: SIZES.small,
    color: "#5A525F",
    marginBottom: 10,
    marginTop: 6,
  },
  wheelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#F6F5F8",
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  stepperColon: {
    fontFamily: "Bold",
    fontSize: SIZES.medium + 4,
    color: "#433C47",
  },
  chipList: {
    gap: 8,
    paddingBottom: 4,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  chipText: {
    fontFamily: "Regular",
    fontSize: SIZES.small,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 12,
  },
});

export default ReminderItem;