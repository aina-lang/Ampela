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

const OnBoardingData = [
  {
    title: "Bienvenue sur Ampela",
    description: "Prenez le contrôle de votre santé menstruelle avec un suivi simple, intuitif et adapté à votre corps.",
    img: images.abscenceDeRegles,
  },
  {
    title: "Enregistrer vos données",
    description: "Notez vos symptômes, vos humeurs et l'historique de vos règles pour obtenir des prédictions ultra-précises.",
    img: images.culotteMenstruelle,
  },
  {
    title: "Chatter avec les docteurs",
    description: "Bénéficiez d'une écoute attentive et posez toutes vos questions de santé à des professionnels agréés.",
    img: images.cycleMenstruel,
  },
  {
    title: "Discuter avec le monde",
    description: "Rejoignez une communauté bienveillante pour échanger, partager vos expériences et briser les tabous.",
    img: images.alimentationPendantLesRegles,
  },
];

const AnimatedPageImage = ({ item, index, scrollX }) => {
  const animatedImageStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollX.value,
      [(index - 1) * SIZES.width, index * SIZES.width, (index + 1) * SIZES.width],
      [0.8, 1, 0.8],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(
      scrollX.value,
      [(index - 1) * SIZES.width, index * SIZES.width, (index + 1) * SIZES.width],
      [0.4, 1, 0.4],
      Extrapolation.CLAMP
    );
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return (
    <Animated.View style={[styles.imageContainer, animatedImageStyle]}>
      <Image source={item.img} contentFit="contain" style={styles.image} />
    </Animated.View>
  );
};

const AnimatedDot = ({ index, scrollX }) => {
  const animatedDotStyle = useAnimatedStyle(() => {
    const width = interpolate(
      scrollX.value,
      [(index - 1) * SIZES.width, index * SIZES.width, (index + 1) * SIZES.width],

      Extrapolation.CLAMP
    );

    const backgroundColor = interpolate(
      scrollX.value,
      [(index - 1) * SIZES.width, index * SIZES.width, (index + 1) * SIZES.width],
      [0.4, 1, 0.4],
      Extrapolation.CLAMP
    );

    return {
      width,
      backgroundColor: backgroundColor > 0.7 ? "#FF7575" : "#FFADAD",
    };
  });

  return <Animated.View style={[styles.dot, animatedDotStyle]} />;
};

const OnboardingIndex = () => {
  const scrollX = useSharedValue(0);
  const scrollViewRef = useRef(null);
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);

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
    <SafeAreaView style={styles.container}>
      {/* Configuration de la Status Bar en mode sombre (icônes noires) */}
      <StatusBar style="dark" animated={true} />

      {/* Bouton Ignorer abaissé et aligné */}
      <View style={styles.skipContainer}>
        <TouchableOpacity onPress={handleFinish} activeOpacity={0.7} style={styles.skipButton}>
          <Text style={styles.skipText}>Ignorer</Text>
          <AntDesign name="arrow-right" size={14} color="#666" style={{ marginLeft: 4 }} />
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
              <Text style={[styles.title, { color: COLORS.accent600 || "#FF7575" }]}>
                {item.title}
              </Text>
              <Text style={styles.description}>
                {item.description}
              </Text>
            </View>
          </View>
        ))}
      </Animated.ScrollView>

      {/* Points indicateurs animés */}
      <View style={styles.dotsContainer}>
        {OnBoardingData.map((_, index) => (
          <AnimatedDot key={index} index={index} scrollX={scrollX} />
        ))}
      </View>

      {/* Barre de navigation inférieure */}
      <View style={styles.bottomBar}>
        {currentIndex > 0 ? (
          <TouchableOpacity onPress={handlePrev} activeOpacity={0.7} style={styles.backButton}>
            <Text style={styles.backButtonText}>Retour</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 60 }} />
        )}

        <TouchableOpacity
          style={[styles.nextButton, { backgroundColor: COLORS.accent500 || "#FF7575" }]}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>
            {currentIndex === OnBoardingData.length - 1 ? "Commencer" : "Suivant"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default OnboardingIndex;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  skipContainer: {
    position: "absolute",
    top: 80,
    right: 20,
    zIndex: 10,
  },
  skipButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
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
  },
  imageContainer: {
    width: SIZES.width,
    height: SIZES.height * 0.52,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    marginTop: 40,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  textContainer: {
    width: SIZES.width,
    paddingHorizontal: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    color: "#626262",
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  dotsContainer: {
    position: "absolute",
    bottom: SIZES.height * 0.16,
    flexDirection: "row",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  bottomBar: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  backButtonText: {
    color: "#9E9E9E",
    fontSize: 16,
    fontWeight: "600",
  },
  nextButton: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
