import { useContext } from "react";
import { Text, View, StyleSheet, Pressable, Image } from "react-native";
import { SIZES, COLORS } from "@/constants";
// import { useTranslation } from 'react-i18next';
// import { images } from '../../constants';
// import { ThemeContext } from './theme-context';
// import { RFValue } from 'react-native-responsive-fontsize';

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
  // const { t } = useTranslation();
  let categoryText = null;

  switch (category) {
    case "Menstruations":
      categoryText = "menstruations";
      break;
    case "Hygiène menstruelle":
      categoryText = "hygieneMenstruelle";
      break;
    case "Troubles et maladies":
      categoryText = "troublesEtMaladies";
      break;
    case "Planning Familiale":
      categoryText = "planningFamiliale";
      break;
    case "Astuces":
      categoryText = "astuces";
      break;
    default:
      return null;
  }
  //   const { theme } = useContext(ThemeContext);
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
    <Pressable style={styles.container} onPress={handleContainerPress}>
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
          {categoryText}
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
          Voir plus {">"}{" "}
        </Text>
      </Pressable>
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
    // fontSize: RFValue(SIZES.xLarge),
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
