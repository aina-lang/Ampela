import { useState, useContext, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SIZES, COLORS } from "@/constants";
import AppHeader from "@/components/AppHeader";
import Link from "@/components/link";
import { useNavigation } from "expo-router";
import i18n from "@/constants/i18n";
import { useSelector } from "@legendapp/state/react";
import { preferenceState } from "@/legendstate/AmpelaStates";
import { AntDesign } from "@expo/vector-icons";
import { useDiscoveryTheme } from "@/components/discovery";
import DiscoveryCard from "@/components/discovery/DiscoveryCard";

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
  const { surface, accentColor } = useDiscoveryTheme();

  return (
    <View style={[styles.container, { backgroundColor: surface }]}>
      <AppHeader navigation={navigation} title={i18n.t("infoAmpela")} showBack absolute />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <DiscoveryCard style={styles.introCard}>
          <Text style={styles.introText}>{i18n.t("introInfo")}</Text>
        </DiscoveryCard>

        <DiscoveryCard style={styles.contentCard}>
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
                <View style={styles.divider} />
              )}
            </View>
          ))}
        </DiscoveryCard>

        <DiscoveryCard style={styles.footerCard}>
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
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <View style={styles.iconWrapper}>
              <AntDesign name="earth" size={18} color={accentColor} />
            </View>
            <View style={styles.textWrapper}>
              <Text style={[styles.subtitle, { color: COLORS.primary }]}>{i18n.t("siteWeb")}</Text>
              <Link url="https://www.google.com">www.ampela.com</Link>
            </View>
          </View>
        </DiscoveryCard>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,

  },
  scrollContent: {
        paddingTop: 200,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  introCard: {
    marginTop: 20,
  },
  introText: {
    fontFamily: "Regular",
    fontSize: SIZES.medium,
    lineHeight: 22,
    color: COLORS.neutral400,
  },
  contentCard: {
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
    backgroundColor: "#F0F0F0",
  },
  footerCard: {
    marginTop: 16,
  },
});

export default InfoScreen;
