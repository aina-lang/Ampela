import { useEffect } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import AppHeader, { HEADER_HEIGHT } from "@/components/AppHeader";
import {
  handleHeaderScroll,
  setHeaderScrolled,
  useHeaderScrolled,
} from "@/hooks/useHeaderScroll";
import { SIZES, data, images } from "@/constants";
import { useLocalSearchParams, useNavigation } from "expo-router";
import i18n from "@/constants/i18n";

import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
} from "react-native-reanimated";
import { useDiscoveryTheme } from "@/components/discovery";

const OneArticle = () => {
  const params = useLocalSearchParams();
  const navigation = useNavigation();

  // Les params de route ne transportent que des chaînes : on retrouve
  // l'article complet (images incluses) dans les constantes locales.
  const article =
    data
      .flatMap((category) => category.content)
      .find((item) => item.title === params.title) ?? {};
  const {
    title = params.title,
    content = "",
    list,
    imgInside,
    imgInsideArr,
    imgInsideArrMg,
    content2,
    list2,
    urlImg: img,
  } = article;
  const { accentColor } = useDiscoveryTheme();
  // Même en-tête que l'accueil : transparent en haut (le titre est dans
  // la couverture), pastel opaque avec le titre dès qu'on scrolle.
  const headerScrolled = useHeaderScrolled();
  useEffect(() => {
    setHeaderScrolled(false);
    return () => setHeaderScrolled(false);
  }, []);
  // Couverture pleine couleur d'accent, texte blanc : lisible dans les
  // deux thèmes et cohérent avec les boutons principaux.
  const coverColor = accentColor;
  const titleColor = "#FFFFFF";
  const category = article.category || params.category || "";

  const scrollRef = useAnimatedRef();
  const scrollOffset = useScrollViewOffset(scrollRef);

  const imageAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
         
          translateY: interpolate(
            scrollOffset.value,
            [-SIZES.height * 0.3, 0, SIZES.height * 0.3],
            [(-SIZES.height * 0.3) / 2, 0, SIZES.height * 0.3 * 0.75]
          ),
        },
        {
          scale: interpolate(
            scrollOffset.value,
            [-SIZES.height * 0.3, 0, SIZES.height * 0.3],
            [2, 1, 1]
          ),
        },
      ],
    };
  });

  return (
    <View style={[styles.container, { backgroundColor: coverColor }]}>
    <AppHeader
      navigation={navigation}
      showBack
      absolute
      title={headerScrolled ? i18n.t(title) : ""}
      scrolledBackgroundColor={coverColor}
      scrolledTitleColor={titleColor}
    />
    <Animated.ScrollView
      ref={scrollRef}
      onScroll={handleHeaderScroll}
      scrollEventThrottle={16}
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View
        style={[
          styles.cover,
          {
            backgroundColor: coverColor,
            // Sous l'en-tête flottant (qui inclut déjà la barre d'état)
            paddingTop: HEADER_HEIGHT + 8,
          },
        ]}
      >
        {/* Illustration centrée sur un halo blanc, partagée avec la carte
            de la liste (même sharedTransitionTag). */}
        <View style={styles.heroImageWrapper}>
          <View style={styles.heroHalo} />
          <Animated.Image
            source={img}
            style={[imageAnimatedStyle, styles.heroImage]}
            resizeMode="contain"
            sharedTransitionTag={`article-${title}`}
          />
        </View>
        {!!category && (
          <Text style={styles.eyebrow}>{category.toUpperCase()}</Text>
        )}
        <Text style={[styles.title, { color: titleColor }]}>
          {i18n.t(title)}
        </Text>
      </Animated.View>

      <View style={styles.card}>
        {(content || []).map((c) => (
          <Text key={c} style={[styles.content]}>
            {i18n.t(c)}
          </Text>
        ))}
        <View style={{ gap: 6 }}>
          {list
            ? list.map((c) => (
                <Text key={c} style={styles.content}>
                  - {i18n.t(c)}
                </Text>
              ))
            : null}
        </View>
        <View style={{ alignItems: "center", gap: 20 }}>
          {i18n.locale === "fr"
            ? imgInsideArr
              ? imgInsideArr.map((img) => (
                  <Image
                    key={img}
                    source={img}
                    resizeMode="contain"
                    style={styles.inlineImage}
                  />
                ))
              : null
            : imgInsideArrMg
            ? imgInsideArrMg.map((img) => (
                <Image
                  key={img}
                  source={img}
                  resizeMode="contain"
                  style={styles.inlineImage}
                />
              ))
            : null}
        </View>
        <View style={{ alignItems: "center" }}>
          {imgInside ? (
            <Image
              source={img}
              resizeMode="contain"
              style={styles.inlineImage}
            />
          ) : null}
        </View>
        {content2
          ? content2.map((c) => (
              <Text key={c} style={styles.content}>
                {i18n.t(c)}
              </Text>
            ))
          : null}
        <View style={{ gap: 6 }}>
          {list2
            ? list2.map((c) => (
                <Text key={c} style={styles.content}>
                  - {i18n.t(c)}
                </Text>
              ))
            : null}
        </View>

        {/* Photo de l'article reprise en bas, en plus du banner hero */}
        {img ? (
          <View style={styles.bottomImageWrapper}>
            <Image
              source={img}
              resizeMode="contain"
              style={styles.bottomImage}
            />
          </View>
        ) : null}
      </View>
    </Animated.ScrollView>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // flexGrow garantit que la carte blanche descend jusqu'en bas de
  // l'écran même quand le contenu est court.
  scrollContent: {
    flexGrow: 1,
  },
  card: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
    backgroundColor: "white",
    width: SIZES.width,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    alignSelf: "center",
  },
  // Illustrations du corps : pleine largeur de la carte, hauteur proportionnelle.
  inlineImage: {
    width: SIZES.width - 40,
    height: SIZES.width - 40,
    maxWidth: 520,
    maxHeight: 520,
    alignSelf: "center",
  },
  bottomImageWrapper: {
    alignItems: "center",
    marginTop: "auto",
    paddingTop: 24,
  },
  bottomImage: {
    width: SIZES.scale(240),
    height: SIZES.scale(240),
  },
  cover: {
    alignItems: "center",
    paddingHorizontal: 28,
    paddingBottom: 28,
  },
  heroImageWrapper: {
    width: 200,
    height: 200,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  heroHalo: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.28)",
  },
  heroImage: {
    width: 160,
    height: 160,
  },
  eyebrow: {
    fontFamily: "SBold",
    fontSize: SIZES.small - 2,
    letterSpacing: 1.4,
    color: "rgba(255,255,255,0.85)",
    marginBottom: 6,
  },
  title: {
    fontFamily: "Bold",
    fontSize: SIZES.width * 0.065,
    lineHeight: SIZES.width * 0.08,
    textAlign: "center",
  },
  content: {
    fontFamily: "Regular",
    fontSize: SIZES.medium,
    lineHeight: 22,
  },
});

export default OneArticle;
