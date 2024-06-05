import { useState, useContext, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

import { ThemeContext } from "@/components/theme-context";
import { SIZES, COLORS } from "@/constants";
import HeaderWithGoBack from "@/components/header-with-go-back";
import Link from "@/components/link";
import { useNavigation } from "expo-router";

const contentData = [
  {
    subtitle: "calendrierDuCycleMenstruel",
    content: "calendrierDuCycleMenstruelContent"
  },
  {
    subtitle: "articles",
    content: "articleContent"
  },
  {
    subtitle: "forumEtMessagePriveAvecLePersonnelDeSante",
    content: "forumEtMessagePriveAvecLePersonnelDeSanteContent"
  },
  {
    subtitle: "parametresEtPartageDeLapplication",
    content: "parametresEtPartageDeLapplicationContent"
  }
]


const InfoScreen = () => {
  // const { t } = useTranslation();
  // const { 'pink'} = useContext(ThemeContext);
  const navigation=useNavigation()
  const [data, setData] = useState([]); 
  

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            'pink'=== "pink" ? COLORS.neutral200 : COLORS.neutral100,
        },
      ]}
    >
      <HeaderWithGoBack title={"infoAmpela"} navigation={navigation} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{marginTop: 20}}>
        <Text style={styles.text}>
          {"introInfo"}
      </Text>
        </View>
      
      <View style={styles.contentContainer}>
        {
          contentData.map((content) => {
            return (<View key={content.subtitle}>
              <Text style={styles.subtitle}>{content.subtitle}</Text>
              <Text style={styles.text}>{content.content}</Text>
            </View>)
          })
        }
      </View>
      
      <View style={{marginTop: 30, marginBottom: 15}}> 
      <Text style={styles.text}>{"partenariat"} : UNFPA Madagascar, Orange Madagascar </Text>
      <Text style={styles.text}>{"siteWeb"}: <Link url="https://www.google.com">www.ampela.com</Link></Text>

      </View>

      </ScrollView>     
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    flex: 1,
  },
  contentContainer: {
    gap: 10,
    marginTop: 15           
  },
  text: {
    fontFamily: "Regular",
    fontSize: SIZES.medium,
    lineHeight: 22
  },
  subtitle: {
    fontFamily: "SBold",
    fontSize: SIZES.large
  }
});

export default InfoScreen;
