import { useCallback, useLayoutEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import SearchArticles from "@/components/search-articles";
import { SIZES } from "@/constants";
import ArticleCategory from "@/components/article-category";
import ArticleContent from "@/components/article-content";
import BackgroundContainer from "@/components/background-container";
import { useNavigation } from "expo-router";
import { useSelector } from "react-redux";
import Ionicons from "@expo/vector-icons/Ionicons";

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
  const user = useSelector((state) => state.user);

  const [activeCategory, setActiveCategory] = useState("Menstruations");
  const handleArticleCategoryPress = useCallback(
    (item) => {
      setActiveCategory(item);
    },
    [activeCategory]
  );

  const handleTextInputChange = useCallback((inputText) => {
    setText(inputText);
  }, []);

  return (
    <KeyboardAvoidingView style={{flex:1}}     behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <SafeAreaView style={styles.container} className="">
        <BackgroundContainer paddingBottom={50}>
          <Text style={styles.title}>{"articles"}</Text>
          <SearchArticles text={text} onChange={handleTextInputChange} />

          <FlatList
            data={DATA}
            style={{ height: 70, marginTop: 10 }}
            renderItem={({ item }) => (
              <ArticleCategory
                onPress={() => handleArticleCategoryPress(item)}
                active={activeCategory === item ? true : false}
              >
                {item}
              </ArticleCategory>
            )}
            horizontal
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
