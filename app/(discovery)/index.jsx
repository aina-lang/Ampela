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
import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { preferenceState } from "@/legendstate/AmpelaStates";
import { useSelector } from "@legendapp/state/react";
import ModernButton from "@/components/ModernButton";

const OnBoardingData = [
  {
    title: "Bienvenue sur Ampela",
    description:
      "Prenez le contrôle de votre santé menstruelle avec un suivi simple, intuitif et adapté à votre corps.",
    img: images.abscenceDeRegles,
  },
  {
    title: "Enregistrer vos données",
    description:
      "Notez vos symptômes, vos humeurs et l'historique de vos règles pour obtenir des prédictions ultra-précises.",
    img: images.culotteMenstruelle,
  },
  {
    title: "Chatter avec les docteurs",
    description:
      "Bénéficiez d'une écoute attentive et posez toutes vos questions de santé à des professionnels agréés.",
    img: images.cycleMenstruel,
  },
  {
    title: "Discuter avec le monde",
    description:
      "Rejoignez une communauté bienveillante pour échanger, partager vos expériences et briser les tabous.",
    img: images.alimentationPendantLesRegles,
  },
];

const AnimatedPageImage = ({ item, index, scrollX }) => {
  const animatedImageStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollX.value,
      [(index - 1) * SIZES.width, index * SIZES.width, (index + 1) * SIZES.width],
      [0.85, 1, 0.85],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(
      scrollX.value,
      [(index - 1) * SIZES.width, index * SIZES.width, (index + 1) * SIZES.width],
      [0.3, 1, 0.3],
      Extrapolation.CLAMP
    );
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return (
    <Animated.View style={[styles.imageContainer, animatedImageStyle]}>
      <View style={styles.imageCard}>
        <Image source={item.img} contentFit="contain" style={styles.image} />
      </View>
    </Animated.View>
  );
};

const AnimatedDot = ({ index, scrollX, accentColor = "#FF7575" }) => {
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
      [0.3, 1, 0.3],
      Extrapolation.CLAMP
    );

    return {
      width,
      opacity,
      backgroundColor: accentColor,
    };
  });

  return <Animated.View style={[styles.dot, animatedDotStyle]} />;
};

const OnboardingIndex = () => {
  const scrollX = useSharedValue(0);
  const scrollViewRef = useRef(null);
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const { theme } = useSelector(() => preferenceState.get());
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
    router.replace("(discovery)/selectlanguage");
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" animated={true} />

      <View style={styles.meshBackground}>
        <View style={[styles.blob, { backgroundColor: accentColor }]} />
        <View style={[styles.blob, styles.blob2, { backgroundColor: accentColor }]} />
      </View>

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.skipContainer}>
          <TouchableOpacity onPress={handleFinish} activeOpacity={0.7} style={styles.skipButton}>
            <Text style={styles.skipText}>Ignorer</Text>
            <AntDesign name="arrowright" size={14} color="#666" style={{ marginLeft: 4 }} />
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
        >
          {OnBoardingData.map((item, index) => (
            <View key={index} style={styles.page}>
              <AnimatedPageImage item={item} index={index} scrollX={scrollX} />

              <View style={styles.textContainer}>
                <Text style={[styles.title, { color: accentColor }]}>
                  {item.title}
                </Text>
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
            <TouchableOpacity onPress={handlePrev} activeOpacity={0.7} style={styles.backButton}>
              <AntDesign name="arrowleft" size={16} color="#666" />
              <Text style={styles.backButtonText}>Retour</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 60 }} />
          )}

          <ModernButton
            title={currentIndex === OnBoardingData.length - 1 ? "Commencer" : "Suivant"}
            onPress={handleNext}
            accentColor={accentColor}
            accentColorDisabled={accentColorDisabled}
            style={{ minWidth: 140 }}
          />
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  meshBackground: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  blob: {
    position: "absolute",
    width: 500,
    height: 500,
    borderRadius: 250,
    opacity: 0.05,
    top: -150,
    right: -150,
  },
  blob2: {
    width: 400,
    height: 400,
    top: "50%",
    left: -150,
    right: undefined,
  },
  safeArea: {
    flex: 1,
  },
  skipContainer: {
    position: "absolute",
    top: 16,
    right: 20,
    zIndex: 10,
  },
  skipButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.04)",
  },
  skipText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  page: {
    width: SIZES.width,
    height: SIZES.height,
    alignItems: "center",
    justifyContent: "center",
  },
  imageContainer: {
    width: SIZES.width,
    height: SIZES.height * 0.48,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  imageCard: {
    width: "100%",
    height: "100%",
    backgroundColor: "#FAFAFA",
    borderRadius: 32,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  textContainer: {
    width: SIZES.width,
    paddingHorizontal: 32,
    alignItems: "center",
    marginTop: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  dotsContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 24,
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
    paddingBottom: 32,
    paddingTop: 16,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 6,
  },
  backButtonText: {
    color: "#666",
    fontSize: 15,
    fontWeight: "600",
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 18,
  },
  nextButtonText: {
    color: COLORS.neutral100,
    fontSize: 16,
    fontWeight: "700",
  },
});

export default OnboardingIndex;
