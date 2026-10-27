import { useCallback, useLayoutEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import SearchArticles from "@/components/search-articles";
import ArticleCategory from "@/components/article-category";
import ArticleContent from "@/components/article-content";
import BackgroundContainer from "@/components/background-container";
import { HEADER_HEIGHT } from "@/components/AppHeader";
import { useNavigation } from "expo-router";


const DATA = [
  "Menstruations",
  "Hygiène menstruelle",
  "Troubles et maladies",
  "Planning Familiale",
  "Astuces",
];

const ArticlesScreen = () => {
  const [text, setText] = useState("");
  const navigation = useNavigation();
  const flatListRef = useRef(null);

  const [activeCategory, setActiveCategory] = useState("Menstruations");
  const handleArticleCategoryPress = useCallback(
    (item) => {
      setActiveCategory(item);
      const index = DATA.findIndex((category) => category === item);

      flatListRef.current.scrollToIndex({ animated: true, index });
    },
    [activeCategory]
  );

  const handleTextInputChange = useCallback((inputText) => {
    setText(inputText);
  }, []);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header du Stack en haut + tab bar flottante en bas : aucun inset
          vertical nécessaire. */}
      <SafeAreaView style={styles.container} edges={["left", "right"]}>
        <BackgroundContainer paddingBottom={0}>
          <View style={{ paddingTop: HEADER_HEIGHT + 8 }}>
            <SearchArticles text={text} onChange={handleTextInputChange} />
          </View>

          <FlatList
            data={DATA}
            style={{ height: 50, marginTop: 5 }}
            renderItem={({ item }) => (
              <ArticleCategory
                onPress={() => handleArticleCategoryPress(item)}
                active={activeCategory === item ? true : false}
              >
                {item}
              </ArticleCategory>
            )}
            horizontal
            ref={flatListRef}
            showsHorizontalScrollIndicator={false}
          />

          <ArticleContent
            navigation={navigation}
            activeCategory={activeCategory}
            text={text}
          />
        </BackgroundContainer>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontFamily: "Bold",
    // fontSize: RFValue(SIZES.xLarge),
    fontSize: 22,
    textAlign: "center",
    marginTop: 40,
  },
});

export default ArticlesScreen;
