import React, { useRef, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  runOnJS,
} from "react-native-reanimated";
import { COLORS, SIZES, images } from "@/constants";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { preferenceState } from "@/legendstate/AmpelaStates";
import { useSelector } from "@legendapp/state/react";
import ModernButton from "@/components/ModernButton";
import { MeshBackground, DiscoveryBackButton, useDiscoveryTheme } from "@/components/discovery";

const OnBoardingData = [
  {
    title: "Bienvenue sur Ampela",
    description:
      "Prenez le contrôle de votre santé menstruelle avec un suivi simple et adapté à votre corps.",
    img: images.abscenceDeRegles,
  },
  {
    title: "Enregistrer vos données",
    description:
      "Notez vos symptômes et votre historique pour obtenir des prédictions précises.",
    img: images.culotteMenstruelle,
  },
  {
    title: "Chatter avec les docteurs",
    description:
      "Posez toutes vos questions de santé à des professionnels agréés.",
    img: images.cycleMenstruel,
  },
  {
    title: "Discuter avec le monde",
    description:
      "Rejoignez une communauté bienveillante pour échanger et partager vos expériences.",
    img: images.alimentationPendantLesRegles,
  },
];

const AnimatedPageImage = ({ item, index, scrollX }) => {
  const animatedImageStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollX.value,
      [(index - 1) * SIZES.width, index * SIZES.width, (index + 1) * SIZES.width],
      [0.82, 1, 0.82],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(
      scrollX.value,
      [(index - 1) * SIZES.width, index * SIZES.width, (index + 1) * SIZES.width],
      [0.25, 1, 0.25],
      Extrapolation.CLAMP
    );
    const translateY = interpolate(
      scrollX.value,
      [(index - 1) * SIZES.width, index * SIZES.width, (index + 1) * SIZES.width],
      [24, 0, 24],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ scale }, { translateY }],
      opacity,
    };
  });

  return (
    <Animated.View style={[styles.imageContainer, animatedImageStyle]}>
      <Image source={item.img} contentFit="contain" style={styles.image} />
    </Animated.View>
  );
};

const AnimatedDot = ({ index, scrollX, accentColor }) => {
  const animatedDotStyle = useAnimatedStyle(() => {
    const width = interpolate(
      scrollX.value,
      [(index - 1) * SIZES.width, index * SIZES.width, (index + 1) * SIZES.width],
      [8, 32, 8],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(
      scrollX.value,
      [(index - 1) * SIZES.width, index * SIZES.width, (index + 1) * SIZES.width],
      [0.25, 1, 0.25],
      Extrapolation.CLAMP
    );

    return { width, opacity, backgroundColor: accentColor };
  });

  return <Animated.View style={[styles.dot, animatedDotStyle]} />;
};

const OnboardingIndex = () => {
  const scrollX = useSharedValue(0);
  const scrollViewRef = useRef(null);
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const { theme } = useSelector(() => preferenceState.get());
  const discovery = useDiscoveryTheme();
  const accentColor = theme === "pink" ? "#FF7575" : "#FE8729";
  const accentColorDisabled = theme === "pink" ? "#FFB5B5" : "#FED4A0";

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
      const index = Math.round(event.contentOffset.x / SIZES.width);
      runOnJS(setCurrentIndex)(index);
    },
  });

  const handleNext = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < OnBoardingData.length) {
      scrollViewRef.current?.scrollTo({ x: nextIndex * SIZES.width, animated: true });
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      scrollViewRef.current?.scrollTo({ x: prevIndex * SIZES.width, animated: true });
    }
  };

  const handleFinish = () => {
    router.replace("/(discovery)/selectlanguage");
  };

  return (
    <View style={[styles.container, { backgroundColor: discovery.surface }]}>
      <StatusBar style="dark" animated={true} />
      <MeshBackground color={accentColor} surfaceColor={discovery.surface} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={handleFinish} activeOpacity={0.7} style={styles.skipButton}>
            <Text style={styles.skipText}>Ignorer</Text>
          </TouchableOpacity>
        </View>

        <Animated.ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          decelerationRate="fast"
          contentContainerStyle={styles.scrollContent}
          style={styles.scrollView}
        >
          {OnBoardingData.map((item, index) => (
            <View key={index} style={styles.page}>
              <AnimatedPageImage item={item} index={index} scrollX={scrollX} />

              <View style={styles.textContainer}>
                <Text style={[styles.title, { color: accentColor }]}>{item.title}</Text>
                <Text style={styles.description}>{item.description}</Text>
              </View>
            </View>
          ))}
        </Animated.ScrollView>

        <View style={styles.dotsContainer}>
          {OnBoardingData.map((_, index) => (
            <AnimatedDot key={index} index={index} scrollX={scrollX} accentColor={accentColor} />
          ))}
        </View>

        <View style={styles.bottomBar}>
          {currentIndex > 0 ? (
            <DiscoveryBackButton onPress={handlePrev} label="Retour" />
          ) : (
            <View style={{ width: 80 }} />
          )}

            <ModernButton
              title={currentIndex === OnBoardingData.length - 1 ? "Commencer" : "Suivant"}
              onPress={handleNext}
              accentColor={accentColor}
              accentColorDisabled={accentColorDisabled}
              style={{ minWidth: 120 }}
            />
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  headerRow: {
    marginTop: -15,
    paddingHorizontal: 8,
    alignItems: "flex-end",
  },
  skipContainer: {
    alignSelf: "flex-end",
  },
  scrollView: {
    flex: 1,
  },
  skipButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.04)",
  },
  skipText: {
    fontSize: 14,
    color: "#666",
    fontFamily: "SBold",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  page: {
    width: SIZES.width,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  imageContainer: {
    width: "100%",
    height: SIZES.height * 0.38,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  textContainer: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 8,
    marginBottom: 20,
  },
  title: {
    fontSize: 30,
    fontFamily: "Bold",
    textAlign: "center",
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    color: "#6A6A6A",
    lineHeight: 25,
    fontFamily: "Regular",
  },
  dotsContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 2,
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 10,
    paddingTop: 20,
  },
});

export default OnboardingIndex;
