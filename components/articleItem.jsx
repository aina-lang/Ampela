import React, { useRef, useEffect } from "react";
import { Text, View, StyleSheet, Pressable, Image, Animated } from "react-native";
import { COLORS } from "@/constants";

const ArticleItem = ({
  navigation,
  title,
  category,
  content,
  list,
  imgInside,
  imgInsideArr,
  imgInsideArrMg,
  content2,
  list2,
  onPress,
  img,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(
      fadeAnim,
      {
        toValue: 1,
        duration: 1000, // Durée de l'animation en millisecondes
        useNativeDriver: true, // Utiliser le moteur natif pour les performances
      }
    ).start();
  }, [fadeAnim]);

  const handleTextPress = () => {
    navigation.navigate("onearticle", {
      title,
      content,
      list,
      imgInside,
      imgInsideArr,
      imgInsideArrMg,
      content2,
      list2,
      img,
    });
  };

  const handleContainerPress = () => {
    onPress(
      title,
      content,
      list,
      imgInside,
      imgInsideArr,
      imgInsideArrMg,
      content2,
      list2,
      img
    );
  };

  return (
    <Pressable onPress={handleContainerPress}>
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <Text style={styles.title}>{title}</Text>
        <View
          style={[
            styles.category,
            {
              backgroundColor:
                "pink" === "pink" ? COLORS.accent400 : COLORS.neutral250,
            },
          ]}
        >
          <Text
            style={{
              fontFamily: "Regular",
              color: "pink" === "pink" ? COLORS.neutral100 : COLORS.primary,
            }}
          >
            {category}
          </Text>
        </View>
        <View style={styles.img}>
          <Image
            source={img}
            style={{ height: 280, width: 280 }}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.content} numberOfLines={4}>
          {content}
        </Text>
        <Pressable onPress={handleTextPress}>
          <Text
            style={{
              color: "pink" === "pink" ? COLORS.accent600 : COLORS.accent800,
              fontFamily: "Regular",
              marginTop: 6,
            }}
          >
            Voir plus {">"}
          </Text>
        </Pressable>
      </Animated.View>
    </Pressable>
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
  },
  category: {
    paddingVertical: 2,
    paddingHorizontal: 10,
    borderRadius: 100,
    alignSelf: "flex-start",
    marginVertical: 10,
  },
  content: {
    fontFamily: "Regular",
    lineHeight: 20,
  },
  img: {
    marginVertical: 10,
    height: 300,
    backgroundColor: COLORS.neutral280,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
});

export default ArticleItem;
