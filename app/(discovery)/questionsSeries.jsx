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
import { addCycleMenstruel, addUser } from "@/services/database";
import { generateCycleMenstrualData } from "@/utils/menstruationUtils";
import { updateUser, userState, preferenceState } from "@/legendstate/AmpelaStates";
import { useSelector } from "@legendapp/state/react";
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

const durationMenstruations = [];
const cycleDurations = [];

for (let i = 2; i < 46; i++) {
  if (i > 2 && i < 8) {
    durationMenstruations.push(i + " jours");
  }
  if (i > 20 && i < 46) {
    cycleDurations.push(i + " jours");
  }
}

const dontRememberText = "je m'en souviens pas";

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
  const [response0, setResponse0] = useState(durationMenstruations[0]);
  const [response1, setResponse1] = useState(cycleDurations[0]);
  const [isNextBtnDisabled, setIsNextBtnDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const user = useSelector(() => userState.get());
  const { theme } = useSelector(() => preferenceState.get());
  const {
    accentColor,
    accentColorDisabled,
    accentContainer,
    surface,
  } = useDiscoveryTheme();

  const handleResponsePress0 = useCallback((item) => setResponse0(item), []);
  const handleResponsePress1 = useCallback((item) => setResponse1(item), []);

  function getNumberFromString(str) {
    if (str === dontRememberText) return 28;
    return parseInt(str.split(" ")[0], 10);
  }

  useEffect(() => {
    setIsNextBtnDisabled(!(response0 && response1));
  }, [response0, response1]);

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
        user.password,
        user.profession,
        user.lastMenstruationDate,
        durationMenstruation,
        cycleDuration,
        user.email,
        user.profileImage
      );

      for (let i = 0; i < cycleData.length; i++) {
        const cycle = cycleData[i];
        setProgress(((i + 1) / cycleData.length) * 100);
        await addCycleMenstruel(
          cycle.fecundityPeriodEnd,
          cycle.fecundityPeriodStart,
          cycle.month,
          cycle.startMenstruationDate,
          cycle.endMenstruationDate,
          cycle.nextMenstruationDate,
          cycle.nextMenstruationEndDate,
          cycle.ovulationDate
        );
      }

      router.push("/(drawer)");
    } catch (error) {
      console.error("Erreur lors de l'enregistrement des cycles:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: surface }]}>
      <StatusBar style="dark" />
      <MeshBackground color={accentColor} surfaceColor={surface} />

      <View style={styles.content}>
        <DiscoveryHeader
          eyebrow="Prédictions"
          title="Vos durées menstruelles"
          subtitle="Ces informations nous permettent de calculer vos prédictions personnalisées."
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <DiscoveryCard style={styles.questionsCard}>
            <View style={styles.contentItem}>
              <Text style={styles.question}>Durée de vos règles</Text>
              <FlatList
                data={durationMenstruations}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <ResponseOfQuestion0
                    text={item}
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
              <Text style={styles.question}>Durée du cycle</Text>
              <FlatList
                data={cycleDurations}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <ResponseOfQuestion1
                    text={item}
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
                  { backgroundColor: response1 === dontRememberText ? accentColor : accentContainer },
                ]}
                onPress={() => handleResponsePress1(dontRememberText)}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.dontRememberText,
                    {
                      color:
                        response1 === dontRememberText
                          ? COLORS.neutral100
                          : accentColor,
                    },
                  ]}
                >
                  {dontRememberText}
                </Text>
              </TouchableOpacity>
            </View>
          </DiscoveryCard>
        </ScrollView>

        <View style={styles.btnBox}>
          <DiscoveryBackButton onPress={() => router.back()} label="Précédent" />

          <ModernButton
            title="Terminer"
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
              Préparation de vos données... {Math.round(progress)}%
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
    marginTop:20
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
    color: "#1A1A1A",
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
    borderRadius: DISCOVERY_RADIUS.md,
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
    width: 280,
    padding: 32,
    alignItems: "center",
    borderRadius: DISCOVERY_RADIUS.xl,
  },
  modalText: {
    marginTop: 18,
    marginBottom: 10,
    fontSize: SIZES.small,
    fontFamily: "SBold",
    color: "#1A1A1A",
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
