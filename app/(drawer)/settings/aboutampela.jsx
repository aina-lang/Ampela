import { useState, useContext, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SIZES, COLORS } from "@/constants";
import HeaderWithGoBack from "@/components/header-with-go-back";
import Link from "@/components/link";
import { useNavigation } from "expo-router";
import i18n from "@/constants/i18n";
import { useSelector } from "@legendapp/state/react";
import { preferenceState } from "@/legendstate/AmpelaStates";
import { AntDesign } from "@expo/vector-icons";

const contentData = [
  {
    subtitle: "calendrierDuCycleMenstruel",
    content: "calendrierDuCycleMenstruelContent",
    icon: "calendar",
  },
  {
    subtitle: "articles",
    content: "articleContent",
    icon: "filetext1",
  },
  {
    subtitle: "forumEtMessagePriveAvecLePersonnelDeSante",
    content: "forumEtMessagePriveAvecLePersonnelDeSanteContent",
    icon: "message1",
  },
  {
    subtitle: "parametresEtPartageDeLapplication",
    content: "parametresEtPartageDeLapplicationContent",
    icon: "setting",
  },
];

const InfoScreen = () => {
  const { theme, language } = useSelector(() => preferenceState.get());
  const navigation = useNavigation();
  const [data, setData] = useState([]);

  const accentColor = theme === "pink" ? COLORS.accent500 : COLORS.accent800;
  const cardBg = theme === "pink" ? COLORS.neutral100 : COLORS.neutral280;
  const cardBorder = theme === "pink" ? "#F0C8C8" : "#E8D5C4";

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            theme === "pink" ? COLORS.neutral200 : COLORS.neutral100,
        },
      ]}
    >
      <HeaderWithGoBack title={i18n.t("infoAmpela")} navigation={navigation} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={[styles.introCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <Text style={[styles.introText, { color: COLORS.neutral400 }]}>{i18n.t("introInfo")}</Text>
        </View>

        <View style={[styles.contentCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          {contentData.map((item, index) => (
            <View key={item.subtitle}>
              <View style={styles.infoRow}>
                <View style={styles.iconWrapper}>
                  <AntDesign
                    name={item.icon}
                    size={18}
                    color={accentColor}
                  />
                </View>
                <View style={styles.textWrapper}>
                  <Text style={[styles.subtitle, { color: COLORS.primary }]}>
                    {i18n.t(item.subtitle)}
                  </Text>
                  <Text style={[styles.text, { color: COLORS.neutral400 }]}>
                    {i18n.t(item.content)}
                  </Text>
                </View>
              </View>
              {index < contentData.length - 1 && (
                <View style={[styles.divider, { backgroundColor: cardBorder }]} />
              )}
            </View>
          ))}
        </View>

        <View style={[styles.footerCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <View style={styles.infoRow}>
            <View style={styles.iconWrapper}>
              <AntDesign name="team" size={18} color={accentColor} />
            </View>
            <View style={styles.textWrapper}>
              <Text style={[styles.subtitle, { color: COLORS.primary }]}>
                {i18n.t("partenariat")}
              </Text>
              <Text style={[styles.text, { color: COLORS.neutral400 }]}>
                UNFPA Madagascar, Orange Madagascar
              </Text>
            </View>
          </View>
          <View style={[styles.divider, { backgroundColor: cardBorder }]} />
          <View style={styles.infoRow}>
            <View style={styles.iconWrapper}>
              <AntDesign name="earth" size={18} color={accentColor} />
            </View>
            <View style={styles.textWrapper}>
              <Text style={[styles.subtitle, { color: COLORS.primary }]}>{i18n.t("siteWeb")}</Text>
              <Link url="https://www.google.com">www.ampela.com</Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 120,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  introCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginTop: 20,
  },
  introText: {
    fontFamily: "Regular",
    fontSize: SIZES.medium,
    lineHeight: 22,
  },
  contentCard: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 14,
  },
  iconWrapper: {
    width: 32,
    alignItems: "center",
    paddingTop: 2,
  },
  textWrapper: {
    flex: 1,
    marginLeft: 10,
  },
  subtitle: {
    fontFamily: "SBold",
    fontSize: SIZES.small,
    marginBottom: 4,
  },
  text: {
    fontFamily: "Regular",
    fontSize: SIZES.small,
    lineHeight: 20,
  },
  divider: {
    height: 1,
  },
  footerCard: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    marginTop: 16,
  },
});

export default InfoScreen;
