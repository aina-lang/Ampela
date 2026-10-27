import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  Pressable,
  Animated,
  TouchableOpacity,
} from "react-native";
import Reanimated from "react-native-reanimated";
import { COLORS } from "@/constants";
import i18n from "@/constants/i18n";
import { useRouter } from "expo-router";
import { useDiscoveryTheme } from "@/components/discovery";

const ArticleItem = ({
  title,
  content,
  list,
  imgInside,
  imgInsideArr,
  imgInsideArrMg,
  content2,
  list2,
  img,
}) => {
  const [fadeAnim] = useState(() => new Animated.Value(0));
  const { accentColor, accentContainer } = useDiscoveryTheme();

  const router = useRouter();
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleOpenArticle = () => {
    // Seul le titre voyage dans l'URL ; l'écran retrouve l'article
    // complet dans les constantes locales.
    router.push({
      pathname: "/article/onearticle",
      params: { title },
    });
  };

  return (
    <TouchableOpacity onPress={handleOpenArticle}>
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <Text style={[styles.title, { color: accentColor }]}>{i18n.t(title)}</Text>
        <View style={[styles.img, { backgroundColor: accentContainer }]}>
          {/* Même sharedTransitionTag que la couverture de l'article :
              l'image « vole » de la carte vers l'écran de détail. */}
          <Reanimated.Image
            source={img}
            style={{ height: 240, width: 240 }}
            resizeMode="contain"
            sharedTransitionTag={`article-${title}`}
          />
        </View>
        <Text style={styles.content} numberOfLines={4}>
          {i18n.t(content[0])}
        </Text>
        <Pressable onPress={handleOpenArticle}>
          <Text style={{ color: accentColor, fontFamily: "SBold", marginTop: 8 }}>
            Voir plus {">"}
          </Text>
        </Pressable>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 30,
    backgroundColor: COLORS.neutral100,
    padding: 15,
    borderRadius: 15,
  },
  title: {
    fontFamily: "SBold",
    fontSize: 17,

  },
  content: {
    fontFamily: "Regular",
    lineHeight: 20,
  },
  img: {
    marginVertical: 12,
    height: 260,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  },
});

export default ArticleItem;
