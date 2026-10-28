import React, { useCallback, useMemo, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from "react-native";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "@legendapp/state/react";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  ZoomIn,
} from "react-native-reanimated";
import i18n from "@/constants/i18n";
import { preferenceState, updatePreference } from "@/legendstate/AmpelaStates";
import { useDiscoveryTheme, MeshBackground } from "@/components/discovery";
import { DecorativeBlobs } from "@/components/ui";

// Textes traduits (fr / mg) : constants/locales/*.json

/** Les bénéfices, qui s'empilent un à un au fil des glissements. */
const ITEMS = [
  { icon: "calendar-outline", key: "onboardingBenefit1" },
  { icon: "alarm-outline", key: "onboardingBenefit2" },
  { icon: "people-outline", key: "onboardingBenefit3" },
  { icon: "chatbubbles-outline", key: "onboardingBenefit4" },
];

/** Une page de titre, puis une par bénéfice. */
const STEPS = ITEMS.length + 1;
// Où le titre se pose une fois monté, et jusqu'où il descend pour occuper le centre au départ.
const TITLE_TOP = 0.2;
const TITLE_CENTER = 0.3;

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

/**
 * Mesures calculées pour l'écran réel : le titre rétrécit juste ce qu'il
 * faut pour ne jamais passer sur les bénéfices, quel que soit le téléphone.
 */
const measure = (width, height, bottomInset) => {
  const k0 = clamp(Math.min(width / 390, height / 844), 0.7, 1.15);
  // On part des tailles dessinées, puis on les réduit jusqu'à ce que l'en-tête
  // monté (logo réduit + titre) tienne au-dessus des bénéfices, sur n'importe
  // quel écran. Si ça ne suffit pas, la liste descend un peu vers les points.
  for (let k = k0; k >= 0.5; k -= 0.05) {
    const logo = Math.round(clamp(230 * k, 120, 250));
    const titleSize = Math.round(clamp(32 * k, 22, 34));
    const titleLine = Math.round(titleSize * 1.22);
    const item = Math.round(clamp(15 * k, 12, 16));
    const badge = Math.round(clamp(44 * k, 32, 46));
    const gap = Math.round(clamp(14 * k, 8, 16));
    const listHeight = ITEMS.length * (badge + gap);
    // Bas de l'en-tête une fois monté : logo à 75 %, titre à 85 %, sur deux lignes au plus.
    const headerBottom = height * TITLE_TOP + logo * 0.75 + 8 + titleLine * 0.85 * 2;
    for (const bottom of [Math.round(clamp(150 * k, 100, 160)), 120, 100]) {
      const listTop = height - bottomInset - bottom - listHeight;
      if (headerBottom + 16 <= listTop) {
        return {
          logo,
          titleSize,
          titleLine,
          subtitleSize: Math.round(clamp(16 * k, 13, 17)),
          item,
          badge,
          gap,
          bottom,
        };
      }
    }
  }
  // Écran vraiment minuscule : tailles plancher.
  return { logo: 110, titleSize: 22, titleLine: 27, subtitleSize: 13, item: 12, badge: 32, gap: 8, bottom: 100 };
};

/** Un bénéfice qui se pose quand on arrive sur son étape, et qui reste. */
const Benefit = ({ item, index, progress, m, accentColor }) => {
  const style = useAnimatedStyle(() => {
    const lead = progress.value - (index + 1);
    return {
      opacity: interpolate(lead, [-0.75, 0], [0, 1], Extrapolation.CLAMP),
      transform: [
        { translateY: interpolate(lead, [-0.75, 0], [26, 0], Extrapolation.CLAMP) },
        { scale: interpolate(lead, [-0.75, 0], [0.94, 1], Extrapolation.CLAMP) },
      ],
    };
  });
  return (
    <Animated.View style={[styles.benefit, style, { marginBottom: m.gap }]}>
      <View style={[styles.badge, { width: m.badge, height: m.badge, borderRadius: m.badge / 2, backgroundColor: accentColor }]}>
        <Ionicons name={item.icon} size={Math.round(m.badge * 0.5)} color="#FFFFFF" />
      </View>
      <Text style={[styles.benefitText, { fontSize: m.item, lineHeight: Math.round(m.item * 1.35) }]}>
        {i18n.t(item.key)}
      </Text>
    </Animated.View>
  );
};

/** Points d'étape : point plein et anneau qui se pose d'un ressort sur l'étape courante. */
const RippleDots = ({ count, current, accentColor }) => (
  <View style={styles.dots}>
    {Array.from({ length: count }).map((_, index) => {
      const active = index === current;
      return (
        <View key={index} style={styles.dotSlot}>
          {active && (
            <Animated.View
              entering={ZoomIn.springify().damping(12).stiffness(80)}
              style={[styles.dotRing, { borderColor: accentColor }]}
            />
          )}
          <View
            style={{
              width: active ? 10 : 7,
              height: active ? 10 : 7,
              borderRadius: 5,
              backgroundColor: accentColor,
              opacity: active ? 1 : 0.35,
            }}
          />
        </View>
      );
    })}
  </View>
);

/**
 * Accueil en une seule page : la promesse en grand au centre, qui monte et se
 * réduit au premier glissement pour devenir l'en-tête sous lequel les
 * bénéfices se posent un par un. Le glissement est capté par des pages
 * transparentes ; tout ce qui se voit est peint par-dessus, à partir de la
 * seule position de défilement.
 */
const OnboardingIndex = () => {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const m = useMemo(() => measure(width, height, insets.bottom), [width, height, insets.bottom]);
  const { accentColor, accentContainer, surface } = useDiscoveryTheme();
  const { language } = useSelector(() => preferenceState.get());
  const [step, setStep] = useState(0);
  // Hauteur réelle du titre (1 ou 2 lignes selon la langue) : la liste des
  // bénéfices est ancrée juste sous l'en-tête monté, mesuré, et non par le bas.
  const [titleHeight, setTitleHeight] = useState(m.titleLine);
  // Si la liste (textes longs, petit écran) déborde sur les points, on réduit son texte.
  const [shrink, setShrink] = useState(0);
  const listTop = Math.round(height * TITLE_TOP + m.logo * 0.75 + 8 + titleHeight * 0.85 + 26);
  const listLimit = height - insets.bottom - m.bottom + 12;
  const itemSize = Math.max(11, m.item - shrink);

  // Onde de la couleur du thème à chaque changement d'étape.
  const rippleScale = useSharedValue(0);
  const rippleOpacity = useSharedValue(0);
  const rippleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rippleScale.value }],
    opacity: rippleOpacity.value,
  }));
  const triggerRipple = useCallback(() => {
    /* eslint-disable react-hooks/immutability -- API Reanimated : écrire .value est le contrat */
    rippleScale.value = 0;
    rippleOpacity.value = 0.22;
    rippleScale.value = withTiming(4, { duration: 700 });
    rippleOpacity.value = withTiming(0, { duration: 700 });
    /* eslint-enable react-hooks/immutability */
  }, [rippleOpacity, rippleScale]);

  const progress = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      progress.value = e.contentOffset.x / width;
    },
  });
  const scrollRef = useAnimatedRef();
  const goTo = (i) => {
    const target = Math.max(0, Math.min(STEPS - 1, i));
    scrollRef.current?.scrollTo({ x: target * width, animated: true });
    if (target !== step) {
      setStep(target);
      triggerRipple();
    }
  };

  // Un simple petit geste suffit : au relâchement, le sens du déplacement
  // depuis la page courante décide (le signe de la vitesse diffère entre
  // Android et iOS, on ne s'y fie pas). 3 % de la largeur suffisent.
  const settle = (e) => {
    const raw = e.nativeEvent.contentOffset.x / width;
    const delta = raw - step;
    let target = step;
    if (delta > 0.03) target = step + 1;
    else if (delta < -0.03) target = step - 1;
    goTo(target);
  };
  const finish = () => router.replace("/(discovery)/selectlanguage");

  const toggleLanguage = () => {
    const next = language === "mg" ? "fr" : "mg";
    i18n.locale = next;
    updatePreference({ language: next });
  };

  const blockStyle = useAnimatedStyle(() => {
    const p = Math.min(progress.value, 1);
    return {
      transform: [{ translateY: interpolate(p, [0, 1], [height * (TITLE_CENTER - TITLE_TOP), 0]) }],
    };
  });
  // Le logo se réduit un peu une fois monté (il reste bien visible),
  // le titre garde une police confortable.
  const logoStyle = useAnimatedStyle(() => {
    const p = Math.min(progress.value, 1);
    const size = interpolate(p, [0, 1], [m.logo, m.logo * 0.75]);
    return { width: size, height: size, marginBottom: interpolate(p, [0, 1], [18, 8]) };
  });
  const titleTextStyle = useAnimatedStyle(() => {
    const p = Math.min(progress.value, 1);
    return {
      fontSize: interpolate(p, [0, 1], [m.titleSize, m.titleSize * 0.85]),
      lineHeight: interpolate(p, [0, 1], [m.titleLine, m.titleLine * 0.85]),
    };
  });
  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.6], [1, 0], Extrapolation.CLAMP),
  }));
  // Le décor s'approche doucement à mesure qu'on avance.
  const decorStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(progress.value, [0, STEPS - 1], [1, 1.18], Extrapolation.CLAMP) }],
  }));

  const last = step === STEPS - 1;

  return (
    <View style={[styles.container, { backgroundColor: surface }]}>
      <StatusBar style="dark" />
      <Animated.View pointerEvents="none" style={[styles.fill, decorStyle]}>
        <MeshBackground color={accentColor} surfaceColor={surface} />
        <DecorativeBlobs />
      </Animated.View>

      {/* Onde */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.ripple,
          rippleStyle,
          { backgroundColor: accentColor, width, height: width, borderRadius: width / 2, top: height / 2 - width / 2 },
        ]}
      />

      {/* Logo + titre, au centre puis en en-tête */}
      <Animated.View pointerEvents="none" style={[styles.titleBlock, blockStyle, { top: height * TITLE_TOP }]}>
        <Animated.View style={logoStyle}>
          <Image source={require("../../assets/images/splash-icon.png")} style={styles.fill} contentFit="contain" />
        </Animated.View>
        <Animated.Text
          style={[styles.title, { color: accentColor }, titleTextStyle]}
          onLayout={(e) => setTitleHeight(e.nativeEvent.layout.height)}
        >
          {i18n.t("onboardingTitle")}
        </Animated.Text>
        <Animated.View style={subtitleStyle}>
          <Text style={[styles.subtitle, { fontSize: m.subtitleSize, lineHeight: Math.round(m.subtitleSize * 1.45) }]}>
            {i18n.t("onboardingSubtitle")}
          </Text>
        </Animated.View>
      </Animated.View>

      {/* Les bénéfices, en une colonne qui se remplit */}
      <View
        pointerEvents="none"
        style={[styles.benefits, { top: listTop }]}
        onLayout={(e) => {
          if (listTop + e.nativeEvent.layout.height > listLimit && shrink < 4) setShrink((v) => v + 1);
        }}
      >
        {ITEMS.map((item, i) => (
          <Benefit
            key={item.key}
            item={item}
            index={i}
            progress={progress}
            m={{ ...m, item: itemSize }}
            accentColor={accentColor}
          />
        ))}
      </View>

      {/* Pages transparentes : elles ne servent qu'à capter le geste */}
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        bounces={false}
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={onScroll}
        decelerationRate="fast"
        snapToInterval={width}
        snapToAlignment="start"
        disableIntervalMomentum
        onScrollEndDrag={settle}
        onMomentumScrollEnd={(e) => {
          const arrived = Math.round(e.nativeEvent.contentOffset.x / width);
          if (arrived === step) return;
          setStep(arrived);
          triggerRipple();
        }}
        style={styles.fill}
      >
        {Array.from({ length: STEPS }).map((_, i) => (
          <View key={i} style={{ width, height: "100%" }} />
        ))}
      </Animated.ScrollView>

      {/* Langue, en haut à droite */}
      <TouchableOpacity
        onPress={toggleLanguage}
        activeOpacity={0.8}
        style={[styles.langPill, { top: insets.top + 10, borderColor: accentContainer }]}
        accessibilityLabel={i18n.t("onboardingLanguageLabel")}
      >
        <Ionicons name="language-outline" size={15} color={accentColor} />
        <Text style={[styles.langText, { color: accentColor }]}>{language === "mg" ? "Malagasy" : "Français"}</Text>
      </TouchableOpacity>

      {/* Points et boutons */}
      <View style={[styles.footer, { bottom: insets.bottom + 22 }]}>
        <RippleDots count={STEPS} current={step} accentColor={accentColor} />
        <View style={styles.footerRow}>
          <TouchableOpacity onPress={finish} style={styles.skip} hitSlop={{ top: 8, bottom: 8 }}>
            <Text style={styles.skipText}>{i18n.t("onboardingSkip")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => (last ? finish() : goTo(step + 1))}
            activeOpacity={0.85}
            style={[styles.next, { backgroundColor: accentColor }]}
          >
            <Text style={styles.nextText}>{last ? i18n.t("onboardingStart") : i18n.t("onboardingNext")}</Text>
            <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fill: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  ripple: {
    position: "absolute",
    left: 0,
    zIndex: 5,
  },
  titleBlock: {
    position: "absolute",
    left: 0,
    right: 0,
    paddingHorizontal: 28,
    alignItems: "center",
  },
  title: {
    fontFamily: "Bold",
    textAlign: "center",
  },
  subtitle: {
    fontFamily: "Regular",
    textAlign: "center",
    color: "#6A6A6A",
    marginTop: 12,
  },
  benefits: {
    position: "absolute",
    left: 0,
    right: 0,
    paddingHorizontal: 28,
  },
  benefit: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  badge: {
    alignItems: "center",
    justifyContent: "center",
  },
  benefitText: {
    flex: 1,
    fontFamily: "Regular",
    color: "#433C47",
  },
  dots: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  dotSlot: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  dotRing: {
    position: "absolute",
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    opacity: 0.5,
  },
  langPill: {
    position: "absolute",
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    zIndex: 10,
  },
  langText: {
    fontFamily: "SBold",
    fontSize: 12,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    paddingHorizontal: 28,
    zIndex: 10,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 26,
  },
  skip: {
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  skipText: {
    fontFamily: "SBold",
    fontSize: 15,
    color: "#8E8793",
  },
  next: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 999,
  },
  nextText: {
    fontFamily: "SBold",
    fontSize: 16,
    color: "#FFFFFF",
  },
});

export default OnboardingIndex;
