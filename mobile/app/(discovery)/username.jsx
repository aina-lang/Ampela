import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { COLORS, SIZES } from "@/constants";
import { Calendar } from "react-native-calendars";
import { monthNames as calendarMonthNames } from "@/constants/calendarLocale";
import MonthYearPicker from "@/components/calendar/MonthYearPicker";
import { Ionicons } from "@expo/vector-icons";
import moment from "moment";
import i18n from "@/constants/i18n";
import * as ImagePicker from "expo-image-picker";
import { useSelector } from "@legendapp/state/react";
import { updateUser, preferenceState } from "@/legendstate/AmpelaStates";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import ModernButton from "@/components/ModernButton";
import { DiscoveryInput, DiscoveryBackButton, useDiscoveryTheme, MeshBackground, DiscoveryHeader } from "@/components/discovery";
import { DISCOVERY_SPACING, DISCOVERY_RADIUS } from "@/components/discovery/DiscoveryTheme";
import { DecorativeBlobs, toast } from "@/components/ui";
import { suspendAppLock } from "@/components/AppLockGate";

const UsernameAndDateScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const today = new Date();
  const todayString = today.toISOString().split("T")[0];
  const firstDayOfMonth = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-01`;

  const [nameText, setNameText] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [selectedDate, setSelectedDate] = useState(todayString);
  // Mois affiché par le calendrier (balayage ou fenêtre mois/année via le titre).
  const [visibleMonth, setVisibleMonth] = useState(() => moment().startOf("month"));
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);
  const { theme } = useSelector(() => preferenceState.get());
  const {
    accentColor,
    accentColorDisabled,
    accentContainer,
    surface,
  } = useDiscoveryTheme();

  const isNameValid = nameText.trim().length > 0;
  const isNextBtnDisabled = !isNameValid;

  useEffect(() => {
    updateUser({ username: nameText.trim(), profileImage });
  }, [nameText, profileImage]);

  useEffect(() => {
    const dateToUpdate = selectedDate === "" ? firstDayOfMonth : selectedDate;
    updateUser({ lastMenstruationDate: dateToUpdate });
  }, [selectedDate]);

  const handleUsernameChange = (text) => {
    setNameText(text);
  };

  const handleNextBtnPress = () => {
    if (isNextBtnDisabled) return;
    router.push("/(discovery)/questionsSeries");
  };

  const pickImage = async () => {
    suspendAppLock();
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      toast.warning(
        i18n.t("profilePhotoPermission")
      );
      return;
    }

    suspendAppLock();

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const prevHandled = () => {
    router.back();
  };

  const handleDateChange = (day) => {
    const selectedDateStr = day.dateString;
    if (new Date(selectedDateStr) <= today) {
      setSelectedDate(selectedDateStr);
    } else {
      toast.warning(i18n.t("profileDateInPast"));
    }
  };

  const handleForgetDate = () => {
    setSelectedDate("");
  };

  const isForgotten = selectedDate === "";

  return (
    <View style={[styles.container, { backgroundColor: surface }]}>
      <StatusBar style="dark" />
      <MeshBackground color={accentColor} surfaceColor={surface} />
      <DecorativeBlobs />

      <View style={[styles.content, { paddingTop: insets.top + 12 }]}>
        <DiscoveryHeader
          eyebrow={i18n.t("profileEyebrow")}
          title={i18n.t("profileTitle")}
          subtitle={i18n.t("profileSubtitle")}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.avatarSection}>
            <TouchableOpacity
              onPress={pickImage}
              activeOpacity={0.85}
              style={styles.avatarWrapper}
            >
              <View style={[styles.imagePicker, { backgroundColor: accentContainer }]}>
                {profileImage ? (
                  <Image source={{ uri: profileImage }} style={styles.image} />
                ) : (
                  <Feather name="camera" size={32} color={accentColor} />
                )}
              </View>
              {/* Hors du cercle (overflow hidden) pour ne pas être rogné */}
              <View style={[styles.editBadge, { backgroundColor: accentColor }]}>
                <Feather name="edit-2" size={14} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
            <Text style={styles.avatarLabel}>{i18n.t("profilePhotoOptional")}</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.inputLabel}>{i18n.t("profileUsername")}</Text>
            <DiscoveryInput
              cursorColor={accentColor}
              placeholder={i18n.t("profileUsernamePlaceholder")}
              value={nameText}
              onChangeText={handleUsernameChange}
              autoCapitalize="none"
              backgroundColor={COLORS.neutral100}
              borderColor={accentColor}
            />
          </View>

          <View style={styles.dateSection}>
            <Text style={styles.inputLabel}>{i18n.t("profileLastPeriod")}</Text>
            <View style={styles.calendarCard}>
              <Calendar
                key={visibleMonth.format("YYYY-MM")}
                current={visibleMonth.format("YYYY-MM-DD")}
                onMonthChange={(m) => setVisibleMonth(moment(m.dateString).startOf("month"))}
                renderHeader={() => (
                  <TouchableOpacity
                    onPress={() => setMonthPickerOpen(true)}
                    activeOpacity={0.7}
                    style={styles.calendarHeader}
                    accessibilityLabel={i18n.t("calendarPickMonth")}
                  >
                    <Text style={styles.calendarHeaderText}>
                      {calendarMonthNames()[visibleMonth.month()]} {visibleMonth.year()}
                    </Text>
                    <Ionicons name="chevron-down" size={16} color={accentColor} />
                  </TouchableOpacity>
                )}
                style={styles.calendar}
                maxDate={todayString}
                theme={{
                  backgroundColor: "transparent",
                  calendarBackground: "transparent",
                  textSectionTitleColor: "#A0A0A0",
                  todayTextColor: accentColor,
                  dayTextColor: "#4A434F",
                  textDisabledColor: "#D8D8D8",
                  arrowColor: accentColor,
                  monthTextColor: "#433C47",
                  textDayFontFamily: "Regular",
                  textMonthFontFamily: "Bold",
                  textDayHeaderFontFamily: "Regular",
                  textDayFontSize: SIZES.medium,
                  textMonthFontSize: SIZES.medium,
                  textDayHeaderFontSize: SIZES.small,
                  selectedDayBackgroundColor: accentColor,
                  selectedDayTextColor: COLORS.neutral100,
                  dotColor: accentColor,
                }}
                onDayPress={handleDateChange}
                markedDates={{
                  [selectedDate]: {
                    selected: true,
                    disableTouchEvent: true,
                    selectedColor: accentColor,
                    selectedTextColor: COLORS.neutral100,
                  },
                }}
              />

              <TouchableOpacity
                style={[
                  styles.forgetChip,
                  { backgroundColor: isForgotten ? accentColor : accentContainer },
                ]}
                onPress={handleForgetDate}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.forgetChipText,
                    { color: isForgotten ? COLORS.neutral100 : accentColor },
                  ]}
                >
                  {i18n.t("profileDontRemember")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        <View style={[styles.btnBox, { paddingBottom: insets.bottom + 24 }]}>
          <DiscoveryBackButton onPress={prevHandled} label={i18n.t("onboardingBack")} />

          <ModernButton
            title={i18n.t("onboardingNext")}
            onPress={handleNextBtnPress}
            disabled={isNextBtnDisabled}
            accentColor={accentColor}
            accentColorDisabled={accentColorDisabled}
            style={{ alignSelf: "flex-end", marginLeft: 12 }}
          />
        </View>
      </View>

      <MonthYearPicker
        visible={monthPickerOpen}
        month={visibleMonth.month()}
        year={visibleMonth.year()}
        monthNames={calendarMonthNames()}
        onConfirm={(month, year) => {
          setVisibleMonth(moment({ year, month, day: 1 }));
          setMonthPickerOpen(false);
        }}
        onCancel={() => setMonthPickerOpen(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  calendarHeaderText: {
    fontFamily: "SBold",
    fontSize: SIZES.medium,
    color: "#433C47",
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 36,
  },
  avatarWrapper: {
    width: 128,
    height: 128,
  },
  imagePicker: {
    width: 128,
    height: 128,
    borderRadius: 64,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#F0F0F0",
  },
  image: {
    width: 128,
    height: 128,
    borderRadius: 64,
  },
  editBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: COLORS.neutral100,
  },
  avatarLabel: {
    marginTop: 14,
    fontFamily: "Regular",
    fontSize: SIZES.small - 1,
    color: "#9E9E9E",
  },
  form: {
    marginBottom: 32,
  },
  inputLabel: {
    fontFamily: "SBold",
    fontSize: SIZES.small,
    color: "#5A525F",
    marginBottom: 10,
  },
  dateSection: {
    marginBottom: 20,
  },
  calendarCard: {
    backgroundColor: COLORS.neutral100,
    borderRadius: DISCOVERY_RADIUS.md,
    padding: 16,
  },
  calendar: {
    borderRadius: DISCOVERY_RADIUS.md,
    backgroundColor: "transparent",
  },
  forgetChip: {
    alignSelf: "center",
    marginTop: 16,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: DISCOVERY_RADIUS.md,
  },
  forgetChipText: {
    fontFamily: "SBold",
    fontSize: SIZES.small,
  },
  btnBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingBottom: 10,
    paddingTop: 20,
  },
});

export default UsernameAndDateScreen;
