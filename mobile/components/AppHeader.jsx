import React, { useEffect, useState } from "react";
import Avatar from "@/components/ui/Avatar";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Platform,
  Animated,
  StyleSheet,
  } from "react-native";
import { SIZES } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSelector } from "@legendapp/state/react";
import { userState } from "@/legendstate/AmpelaStates";
import { useDiscoveryTheme } from "@/components/discovery";
import { useHeaderScrolled, setHeaderScrolled } from "@/hooks/useHeaderScroll";

const STATUS_BAR_HEIGHT = Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0;

// Hauteur totale du header : à utiliser comme paddingTop par les écrans
// qui passent sous un header absolu/transparent.
export const HEADER_HEIGHT = SIZES.height * 0.09 + STATUS_BAR_HEIGHT;

/**
 * Icônes de droite communes aux trois onglets (accueil, forum, articles) :
 * messages et notifications, en contour, rendues à la même taille par
 * AppHeader. À passer tel quel dans `rightIcons`.
 */
export const tabHeaderIcons = (router, { unreadNotifications = 0 } = {}) => [
  {
    name: "chatbubble-ellipses-outline",
    onPress: () => router.push("/(drawer)/(message)"),
  },
  {
    name: "notifications-outline",
    onPress: () => router.push("/(drawer)/notifications"),
    badge: unreadNotifications,
  },
];

/**
 * AppHeader — aérien en haut de page (fond transparent, pastilles
 * blanches), il devient pastel opaque en fondu dès que l'écran scrolle
 * (via handleHeaderScroll branché sur les listes/scrollviews).
 */
const AppHeader = ({
  navigation,
  title,
  showBack,
  onBackPress,
  rightIcons,
  absolute,
  // Couleurs une fois scrollé (par défaut : pastel du thème, titre sombre).
  // L'écran article garde par exemple sa couleur d'accent pleine et un
  // titre blanc, avec la même forme que l'accueil.
  scrolledBackgroundColor,
  scrolledTitleColor,
  // Conversation : avatar de l'interlocutrice et profession sous le titre.
  avatar,
  avatarName,
  subtitle,
  // Conservé pour compatibilité, ignoré par le nouveau design.
  bgColor,
}) => {
  const { accentColor, accentContainer, surface } = useDiscoveryTheme();
  const fillColor = scrolledBackgroundColor || accentContainer;
  const scrolled = useHeaderScrolled();
  const router = useRouter();
  const profileImage = useSelector(() => userState.profileImage.get());
  const username = useSelector(() => userState.username.get());

  // Après un rechargement ou un lien direct, l'écran peut être le premier
  // de l'historique : on retombe alors sur l'accueil au lieu d'un
  // « GO_BACK » sans destination.
  const goBack = () => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(drawer)/(main)");
    }
  };
  const titleColor = scrolled && scrolledTitleColor ? scrolledTitleColor : "#433C47";
  const [bgOpacity] = useState(() => new Animated.Value(0));

  // Chaque écran repart en haut : header transparent à l'arrivée.
  useEffect(() => {
    setHeaderScrolled(false);
  }, []);

  useEffect(() => {
    Animated.timing(bgOpacity, {
      toValue: scrolled ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [scrolled, bgOpacity]);

  const buttonBg = {
    backgroundColor: scrolled ? surface : "rgba(255, 255, 255, 0.92)",
  };

  const headerHeight = SIZES.height * 0.09 + STATUS_BAR_HEIGHT;

  return (
    <View
      style={[
        styles.wrapper,
        { height: headerHeight },
        absolute && styles.absolute,
      ]}
    >
      {/* Fond pastel qui apparaît en fondu au scroll */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.fill,
          { backgroundColor: fillColor, opacity: bgOpacity },
        ]}
      />

      <View
        style={[
          styles.content,
          { paddingTop: STATUS_BAR_HEIGHT + 6, height: headerHeight },
        ]}
      >
        <View style={styles.left}>
          {showBack ? (
            <TouchableOpacity
              onPress={onBackPress || goBack}
              style={[styles.iconButton, buttonBg]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" color={accentColor} size={22} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.avatarButton, buttonBg]}
              onPress={() => router.push("/(drawer)/profile")}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel="Profil"
            >
              <Avatar
                uri={profileImage}
                name={username}
                size={SIZES.scale(48)}
                borderWidth={2}
                borderColor={accentContainer}
              />
            </TouchableOpacity>
          )}

          {(!!avatar || !!avatarName) && (
            <Avatar
              uri={avatar}
              name={avatarName}
              size={38}
              borderWidth={2}
              borderColor={accentContainer}
            />
          )}
          {!!title && (
            <View style={styles.titleBlock}>
              <Text numberOfLines={1} style={[styles.title, { color: titleColor }]}>
                {title}
              </Text>
              {!!subtitle && (
                <Text numberOfLines={1} style={styles.subtitle}>
                  {subtitle}
                </Text>
              )}
            </View>
          )}
        </View>

        {!!rightIcons?.length && (
          <View style={styles.right}>
            {rightIcons.map((icon, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.iconButton, buttonBg]}
                onPress={icon.onPress}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name={icon.name} color={accentColor} size={20} />
                {!!icon.badge && (
                  <View style={[styles.badge, { backgroundColor: accentColor }]}>
                    <Text style={styles.badgeText}>{icon.badge > 99 ? "99+" : icon.badge}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: SIZES.width,
    zIndex: 50,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: "hidden",
  },
  // StyleSheet.absoluteFillObject n'existe plus dans RN 0.86 : on écrit
  // le remplissage absolu explicitement.
  fill: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  absolute: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    width: "100%",
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flexShrink: 1,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatarButton: {
    width: SIZES.scale(48),
    height: SIZES.scale(48),
    borderRadius: SIZES.scale(24),
    justifyContent: "center",
    alignItems: "center",
  },
  iconButton: {
    width: SIZES.scale(42),
    height: SIZES.scale(42),
    borderRadius: SIZES.scale(21),
    justifyContent: "center",
    alignItems: "center",
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  badgeText: {
    fontFamily: "SBold",
    fontSize: 9,
    color: "#FFFFFF",
  },
  titleBlock: {
    flexShrink: 1,
  },
  subtitle: {
    fontFamily: "Regular",
    fontSize: 12,
    color: "#8E8793",
    marginTop: 1,
  },
  title: {
    fontSize: 20,
    fontFamily: "Bold",
    color: "#433C47",
    flexShrink: 1,
  },
});

export default AppHeader;
