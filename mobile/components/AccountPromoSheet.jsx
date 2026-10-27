import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import { SIZES } from "@/constants";
import { isSignedIn } from "@/services/api";
import { useModal } from "@/hooks/ModalProvider";
import { useDiscoveryTheme } from "@/components/discovery";
import { PrimaryButton, GhostButton } from "@/components/ui";
import AuthContent from "@/components/AuthContent";

const HIDDEN_Y = 420;

// Avantages mis en avant, du plus discret au plus important (centre).
const FEATURES = [
  { icon: "chatbubbles-outline" },
  { icon: "cloud-done-outline" },
  { icon: "people-outline" },
];

// Une seule apparition par lancement de l'app.
let shownThisLaunch = false;

/**
 * Popup bas affiché à l'ouverture quand l'utilisatrice n'a pas de
 * compte : rappelle en douceur que l'expérience est plus belle avec un
 * compte (synchronisation, forum, messages) avec un bouton d'action.
 */
const AccountPromoSheet = () => {
  const insets = useSafeAreaInsets();
  const { openModal } = useModal();
  const { accentColor, accentContainer } = useDiscoveryTheme();
  const [visible, setVisible] = useState(false);
  const translateY = useSharedValue(HIDDEN_Y);

  useEffect(() => {
    if (shownThisLaunch) return;
    // Petit délai : laisse l'écran d'accueil s'installer et la session
    // locale se réhydrater avant de vérifier l'absence de compte.
    const timer = setTimeout(() => {
      if (!isSignedIn()) {
        shownThisLaunch = true;
        setVisible(true);
      }
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (visible) {
      // Glissement doux, sans rebond.
      translateY.value = withTiming(0, {
        duration: 320,
        easing: Easing.out(Easing.cubic),
      });
    }
  }, [visible, translateY]);

  const dismiss = () => {
    // eslint-disable-next-line react-hooks/immutability -- API Reanimated : écrire .value est le contrat
    translateY.value = withTiming(HIDDEN_Y, { duration: 240 }, (finished) => {
      if (finished) runOnJS(setVisible)(false);
    });
  };

  const handleCreateAccount = () => {
    dismiss();
    openModal(<AuthContent />);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.wrapper,
        { paddingBottom: insets.bottom + 96 },
        animatedStyle,
      ]}
      pointerEvents="box-none"
    >
      <View style={styles.card}>
        {/* Trois pastilles : ce que le compte apporte concrètement */}
        <View style={styles.iconRow}>
          {FEATURES.map((feature, index) => (
            <View
              key={feature.icon}
              style={[
                styles.iconCircle,
                { backgroundColor: accentContainer },
                index === 1 && styles.iconCircleMain,
              ]}
            >
              <Ionicons
                name={feature.icon}
                size={index === 1 ? 26 : 20}
                color={accentColor}
              />
            </View>
          ))}
        </View>

        <Text style={styles.title}>Encore plus belle avec un compte</Text>
        <Text style={styles.subtitle}>
          Sauvegardez vos cycles dans le cloud, échangez sur le forum et
          discutez avec des professionnelles — gratuitement.
        </Text>

        <PrimaryButton
          title="Créer mon compte"
          onPress={handleCreateAccount}
          style={styles.cta}
        />
        <GhostButton title="Plus tard" size="sm" onPress={dismiss} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 0,
    zIndex: 50,
    elevation: 10,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 14,
    alignItems: "center",
    shadowColor: "#8A7A85",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 6,
  },
  // Pastille centrale (sauvegarde cloud) : plus grande, c'est l'argument clé.
  iconCircleMain: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  title: {
    fontFamily: "Bold",
    fontSize: SIZES.medium + 2,
    color: "#433C47",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: "Regular",
    fontSize: SIZES.small,
    color: "#7A737F",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 18,
  },
  cta: {
    alignSelf: "stretch",
    marginBottom: 6,
  },
});

export default AccountPromoSheet;
