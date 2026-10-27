import { DecorativeBlobs } from "@/components/ui";
import React, { useEffect, useRef, useState } from "react";
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
  withDelay,
  withTiming,
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
    title: "Bienvenue sur Ampela Pro",
    description:
      "L'espace des professionnelles de santé Ampela : accompagnez les utilisatrices avec des réponses fiables.",
    img: images.abscenceDeRegles,
  },
  {
    title: "Répondez aux questions",
    description:
      "Le forum rassemble les questions des utilisatrices sur les règles, la contraception et la santé intime.",
    img: images.culotteMenstruelle,
  },
  {
    title: "Échangez en privé",
    description:
      "La messagerie privée vous met en relation directe avec les utilisatrices qui vous sollicitent.",
    img: images.cycleMenstruel,
  },
  {
    title: "Partagez votre expertise",
    description:
      "Votre pseudo et votre spécialité apparaissent avec la mention « Professionnelle de santé ».",
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

// Titre puis description apparaissent l'un après l'autre quand la
// slide devient active (fondu + légère remontée).
const AnimatedPageText = ({ item, active, accentColor }) => {
  const titleProgress = useSharedValue(0);
  const descProgress = useSharedValue(0);

  useEffect(() => {
    if (active) {
      titleProgress.value = withDelay(120, withTiming(1, { duration: 420 }));
      descProgress.value = withDelay(380, withTiming(1, { duration: 420 }));
    } else {
      titleProgress.value = withTiming(0, { duration: 150 });
      descProgress.value = withTiming(0, { duration: 150 });
    }
  }, [active, titleProgress, descProgress]);

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleProgress.value,
    transform: [{ translateY: (1 - titleProgress.value) * 18 }],
  }));
  const descStyle = useAnimatedStyle(() => ({
    opacity: descProgress.value,
    transform: [{ translateY: (1 - descProgress.value) * 18 }],
  }));

  return (
    <View style={styles.textContainer}>
      <Animated.Text style={[styles.title, { color: accentColor }, titleStyle]}>
        {item.title}
      </Animated.Text>
      <Animated.Text style={[styles.description, descStyle]}>
        {item.description}
      </Animated.Text>
    </View>
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
      <DecorativeBlobs />

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

              <AnimatedPageText
                item={item}
                active={currentIndex === index}
                accentColor={accentColor}
              />
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
    paddingTop: 12,
    paddingHorizontal: 16,
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
    alignItems: "flex-start",
    paddingHorizontal: 8,
    marginBottom: 20,
  },
  title: {
    fontSize: 30,
    fontFamily: "Bold",
    textAlign: "left",
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  description: {
    fontSize: 16,
    textAlign: "left",
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
