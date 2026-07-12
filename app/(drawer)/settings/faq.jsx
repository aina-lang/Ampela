import { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, Text } from "react-native";
import { SIZES, COLORS } from "@/constants";
import AppHeader from "@/components/AppHeader";
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
      <AppHeader navigation={navigation} title="F.A.Q" showBack absolute />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.sectionTitle}>Questions fréquentes</Text>
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
    flex: 1,
    backgroundColor: COLORS.neutral100,
    paddingTop: 130,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontFamily: "SBold",
    fontSize: SIZES.medium,
    color: "#1A1A1A",
    marginBottom: 16,
    marginTop: 20,
  },
});

export default FaqScreen;
