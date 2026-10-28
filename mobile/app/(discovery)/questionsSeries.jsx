import { DecorativeBlobs, toast } from "@/components/ui";
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { COLORS, SIZES } from "@/constants";
import { useRouter } from "expo-router";
import {
  ResponseOfQuestion0,
  ResponseOfQuestion1,
} from "@/components/response-of-question";
import { addCyclesMenstruels, addUser } from "@/services/database";
import { generateCycleMenstrualData } from "@/utils/menstruationUtils";
import { isSignedIn } from "@/services/api";
import { createCloudProfileFromLocal } from "@/services/otpAuth";
import { updateUser, userState, preferenceState, touchCycles } from "@/legendstate/AmpelaStates";
import { useSelector } from "@legendapp/state/react";
import i18n from "@/constants/i18n";
import ModernButton from "@/components/ModernButton";
import {
  DiscoveryBackButton,
  DiscoveryCard,
  useDiscoveryTheme,
  MeshBackground,
  DiscoveryHeader,
} from "@/components/discovery";
import { DISCOVERY_RADIUS, DISCOVERY_SHADOWS, DISCOVERY_SPACING } from "@/components/discovery/DiscoveryTheme";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Durées proposées (en jours) : règles 3 à 7, cycle 21 à 45.
const durationMenstruations = Array.from({ length: 5 }, (_, i) => i + 3);
const cycleDurations = Array.from({ length: 25 }, (_, i) => i + 21);
// Valeur sentinelle « je ne me souviens plus » (cycle moyen de 28 jours).
const DONT_REMEMBER = "dontRemember";
const dayLabel = (n) => `${n} ${i18n.t("jours")}`;

const AnimatedProgressBar = ({ progress, accentColor }) => {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(progress, { duration: 200 });
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return (
    <View style={styles.progressBarContainer}>
      <Animated.View style={[styles.progressBar, animatedStyle, { backgroundColor: accentColor }]} />
    </View>
  );
};

const QuestionsSeries = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [response0, setResponse0] = useState(durationMenstruations[0]);
  const [response1, setResponse1] = useState(cycleDurations[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const user = useSelector(() => userState.get());
  // La langue est observée pour re-rendre les libellés traduits.
  useSelector(() => preferenceState.language.get());
  const {
    accentColor,
    accentColorDisabled,
    accentContainer,
    surface,
  } = useDiscoveryTheme();

  const handleResponsePress0 = useCallback((item) => setResponse0(item), []);
  const handleResponsePress1 = useCallback((item) => setResponse1(item), []);

  function getNumberFromString(value) {
    if (value === DONT_REMEMBER) return 28;
    return Number(value);
  }

  // État dérivé : pas besoin d'effet.
  const isNextBtnDisabled = !(response0 && response1);

  useEffect(() => {
    updateUser({ durationMenstruation: getNumberFromString(response0) });
  }, [response0]);

  useEffect(() => {
    updateUser({ cycleDuration: getNumberFromString(response1) });
  }, [response1]);

  const handleNextBtnPress = async () => {
    setIsLoading(true);
    try {
      const cycleDuration = getNumberFromString(response1);
      const durationMenstruation = getNumberFromString(response0);

      const cycleData = generateCycleMenstrualData(
        user.lastMenstruationDate,
        cycleDuration,
        durationMenstruation
      );

      await addUser(
        user.username,
        user.profession,
        user.lastMenstruationDate,
        durationMenstruation,
        cycleDuration,
        user.email,
        user.profileImage
      );

      setProgress(50);
      await addCyclesMenstruels(
        cycleData.map((cycle) => ({
          month: cycle.month,
          ovulationDate: cycle.ovulationDate,
          fecundityPeriodStart: cycle.fecundityPeriodStart,
          fecundityPeriodEnd: cycle.fecundityPeriodEnd,
          startMenstruationDate: cycle.startMenstruationDate,
          endMenstruationDate: cycle.endMenstruationDate,
          nextMenstruationStartDate: cycle.nextMenstruationDate,
          nextMenstruationEndDate: cycle.nextMenstruationEndDate,
        }))
      );
      setProgress(100);
      // Données saisies sur cet appareil : datées pour la synchronisation.
      updateUser({ durationMenstruation, cycleDuration }, { touch: true });
      touchCycles();

      // Si l'utilisatrice s'est connectée par code e-mail avant
      // l'onboarding, son profil et ses cycles partent dans le cloud.
      if (isSignedIn()) {
        try {
          await createCloudProfileFromLocal();
        } catch (syncError) {
          console.error("Cloud sync after onboarding failed:", syncError);
        }
      }

      toast.success(i18n.t("predictionsReady"));
      router.replace("/(drawer)");
    } catch (error) {
      console.error("Erreur lors de l'enregistrement des cycles:", error);
      toast.error(i18n.t("predictionsSaveFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: surface }]}>
      <StatusBar style="dark" />
      <MeshBackground color={accentColor} surfaceColor={surface} />
      <DecorativeBlobs />

      <View style={[styles.content, { paddingTop: insets.top + 12 }]}>
        <DiscoveryHeader
          eyebrow={i18n.t("predictionsEyebrow")}
          title={i18n.t("predictionsTitle")}
          subtitle={i18n.t("predictionsSubtitle")}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <DiscoveryCard style={styles.questionsCard}>
            <View style={styles.contentItem}>
              <Text style={styles.question}>{i18n.t("predictionsPeriodLength")}</Text>
              <FlatList
                data={durationMenstruations}
                keyExtractor={(item) => String(item)}
                renderItem={({ item }) => (
                  <ResponseOfQuestion0
                    text={dayLabel(item)}
                    active={response0 === item}
                    onPress={() => handleResponsePress0(item)}
                    accentColor={accentColor}
                  />
                )}
                contentContainerStyle={styles.chipList}
                showsHorizontalScrollIndicator={false}
                horizontal
              />
            </View>

            <View style={styles.contentItem}>
              <Text style={styles.question}>{i18n.t("predictionsCycleLength")}</Text>
              <FlatList
                data={cycleDurations}
                keyExtractor={(item) => String(item)}
                renderItem={({ item }) => (
                  <ResponseOfQuestion1
                    text={dayLabel(item)}
                    active={response1 === item}
                    onPress={() => handleResponsePress1(item)}
                    accentColor={accentColor}
                  />
                )}
                contentContainerStyle={styles.chipList}
                showsHorizontalScrollIndicator={false}
                horizontal
              />

              <TouchableOpacity
                style={[
                  styles.dontRememberChip,
                  { backgroundColor: response1 === DONT_REMEMBER ? accentColor : accentContainer },
                ]}
                onPress={() => handleResponsePress1(DONT_REMEMBER)}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.dontRememberText,
                    {
                      color:
                        response1 === DONT_REMEMBER
                          ? COLORS.neutral100
                          : accentColor,
                    },
                  ]}
                >
                  {i18n.t("profileDontRemember")}
                </Text>
              </TouchableOpacity>
            </View>
          </DiscoveryCard>
        </ScrollView>

        <View style={[styles.btnBox, { paddingBottom: insets.bottom + 24 }]}>
          <DiscoveryBackButton onPress={() => router.back()} label={i18n.t("onboardingBack")} />

          <ModernButton
            title={i18n.t("predictionsFinish")}
            onPress={handleNextBtnPress}
            disabled={isNextBtnDisabled}
            accentColor={accentColor}
            accentColorDisabled={accentColorDisabled}
            style={{ alignSelf: "flex-end", marginLeft: 12 }}
          />
        </View>
      </View>

      <Modal transparent visible={isLoading} animationType="fade">
        <View style={styles.modalContainer}>
          <DiscoveryCard style={styles.modalContent} elevated>
            <ActivityIndicator size="large" color={accentColor} />
            <Text style={styles.modalText}>
              {i18n.t("predictionsPreparing", { percent: Math.round(progress) })}
            </Text>
            <AnimatedProgressBar progress={progress} accentColor={accentColor} />
          </DiscoveryCard>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
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
  questionsCard: {
    flex: 1,
    marginBottom: 20,
    justifyContent: "center",
  },
  contentItem: {
    marginBottom: 28,
  },
  question: {
    fontFamily: "SBold",
    fontSize: SIZES.medium,
    color: "#433C47",
    marginBottom: 5,
  },
  chipList: {
    gap: 10,
    paddingRight: 10,
    paddingVertical: 10,
  },
  dontRememberChip: {
    alignSelf: "flex-start",
    marginTop: 14,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
  },
  dontRememberText: {
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  modalContent: {
    width: "80%",
    maxWidth: 360,
    padding: 32,
    alignItems: "center",
    borderRadius: DISCOVERY_RADIUS.xl,
  },
  modalText: {
    marginTop: 18,
    marginBottom: 10,
    fontSize: SIZES.small,
    fontFamily: "SBold",
    color: "#433C47",
    textAlign: "center",
  },
  progressBarContainer: {
    width: "100%",
    height: 8,
    backgroundColor: "#EFEFEF",
    borderRadius: 4,
    overflow: "hidden",
    marginTop: 8,
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
});

export default QuestionsSeries;
