import { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { SIZES, COLORS } from "@/constants";
import HeaderWithGoBack from "@/components/header-with-go-back";
import FaqItem from "@/components/settings/faq-item";
import faqdata from "@/constants/faqdata";
import { useNavigation } from "expo-router";
import i18n from "@/constants/i18n";

const FaqScreen = () => {
  const [data, setData] = useState([]);
  const navigation = useNavigation();
  useEffect(() => {
    setData(faqdata);
  }, []);
  return (
    <View style={styles.container}>
      <HeaderWithGoBack title="F.A.Q" navigation={navigation} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ paddingVertical: 20, paddingTop: 120, flex: 1 }}
      >
        {data.map((d) => (
          <FaqItem
            key={d.id}
            question={i18n.t(d.question)}
            response={i18n.t(d.response)}
            list={d.list ? d.list : ""}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    flex: 1,
    backgroundColor: COLORS.neutral100,
    justifyContent: "center",
  },
  header: {
    marginTop: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  medium: {
    fontFamily: "Medium",
    fontSize: SIZES.medium,
  },
});

export default FaqScreen;
