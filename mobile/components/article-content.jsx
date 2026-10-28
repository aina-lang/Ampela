import { handleHeaderScroll } from "@/hooks/useHeaderScroll";
import React from "react";
import { FlatList, StyleSheet } from "react-native";
import { SIZES, data } from "@/constants";
import { useRouter } from "expo-router";
import ArticleItem from "./articleItem";
import { useTabBarSpace } from "@/components/MyTabBar";

const showActiveCategoryContent = (activeCategory) => {
  let content = null;
  switch (activeCategory) {
    case "Menstruations":
      content = data[0].content;
      break;
    case "Hygiène menstruelle":
      content = data[1].content;
      break;
    case "Troubles et maladies":
      content = data[2].content;
      break;
    case "Planning Familiale":
      content = data[3].content;
      break;
    case "Astuces":
      content = data[4].content;
      break;
    default:
      console.log("This category doesn't exist");
  }
  return content;
};

const ArticleContent = ({ navigation, activeCategory, text }) => {
  const tabBarSpace = useTabBarSpace();
  const router = useRouter();
  const content = showActiveCategoryContent(activeCategory);

  const filteredContent = content.filter((c) =>
    c.title.toLocaleLowerCase().includes(text.toLocaleLowerCase())
  );

  const handleArticleItemPress = (title) => {
    // L'écran onearticle retrouve l'article via titre + catégorie :
    // les params de route sont des chaînes, on ne passe pas d'objets.
    router.push({
      pathname: "/article/onearticle",
      params: { title, category: activeCategory },
    });
  };

  return (
    <FlatList
        onScroll={handleHeaderScroll}
        scrollEventThrottle={16}
      data={filteredContent}
      renderItem={({ item }) => (
        <ArticleItem
          onPress={handleArticleItemPress}
          navigation={navigation}
          title={item.title}
          category={item.category}
          content={item.content}
          list={item.list ? item.list : null}
          imgInside={item.imgInside ? item.imgInside : false}
          imgInsideArr={item.imgInsideArr ? item.imgInsideArr : null}
          imgInsideArrMg={item.imgInsideArrMg ? item.imgInsideArrMg : null}
          content2={item.content2 ? item.content2 : null}
          list2={item.list2 ? item.list2 : null}
          img={item.urlImg}
        />
      )}
      keyExtractor={(item) => item.title}
      showsVerticalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={{ paddingBottom: tabBarSpace }}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 5,
  },
  title: {
    fontFamily: "Bold",
    fontSize: SIZES.xLarge,
  },
});

export default ArticleContent;
