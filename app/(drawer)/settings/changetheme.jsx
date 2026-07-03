import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { ScrollView } from "react-native";
import HeaderWithGoBack from "@/components/header-with-go-back";
import { SIZES, COLORS, images } from "@/constants";
import { useNavigation } from "expo-router";
import { preferenceState, updatePreference } from "@/legendstate/AmpelaStates";
import { useSelector } from "@legendapp/state/react";
import { Ionicons } from "@expo/vector-icons";

const ThemeScreen = () => {
  const { theme, language } = useSelector(() => preferenceState.get());
  const navigation = useNavigation();
  const handleThemeChange = (theme) => {
    updatePreference({ theme });
  };

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
      <HeaderWithGoBack
        title={"Thème"}
        navigation={navigation}
        onIconLeftPress={() => navigation.goBack()}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <TouchableOpacity
            style={styles.themeRow}
            onPress={() => handleThemeChange("pink")}
            activeOpacity={0.7}
          >
            <View style={styles.left}>
              <View style={styles.iconWrapper}>
                <Ionicons name="color-palette-outline" size={18} color={accentColor} />
              </View>
              <View>
                <Text style={[styles.themeLabel, { color: COLORS.primary }]}>Anna's Rose</Text>
                <Text style={[styles.themeDesc, { color: COLORS.neutral400 }]}>Rose</Text>
              </View>
            </View>
            <View
              style={[
                styles.dot,
                {
                  borderColor: theme === "pink" ? COLORS.accent500 : cardBorder,
                  backgroundColor:
                    theme === "pink" ? COLORS.accent500 : "transparent",
                },
              ]}
            />
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: cardBorder }]} />
          <TouchableOpacity
            style={styles.themeRow}
            onPress={() => handleThemeChange("orange")}
            activeOpacity={0.7}
          >
            <View style={styles.left}>
              <View style={styles.iconWrapper}>
                <Ionicons name="color-palette-outline" size={18} color={accentColor} />
              </View>
              <View>
                <Text style={[styles.themeLabel, { color: COLORS.primary }]}>Linda Sunset</Text>
                <Text style={[styles.themeDesc, { color: COLORS.neutral400 }]}>Orange</Text>
              </View>
            </View>
            <View
              style={[
                styles.dot,
                {
                  borderColor: theme === "orange" ? COLORS.accent800 : cardBorder,
                  backgroundColor:
                    theme === "orange" ? COLORS.accent800 : "transparent",
                },
              ]}
            />
          </TouchableOpacity>
        </View>

        <View style={[styles.previewCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <Text style={[styles.previewTitle, { color: COLORS.primary }]}>Aperçu</Text>
          <View style={styles.previewRow}>
            <Image
              source={images.pinkTheme}
              style={[
                styles.previewImage,
                { borderColor: theme === "pink" ? COLORS.accent500 : "transparent", borderWidth: theme === "pink" ? 2 : 0 },
              ]}
              resizeMode="contain"
            />
            <Image
              source={images.orangeTheme}
              style={[
                styles.previewImage,
                { borderColor: theme === "orange" ? COLORS.accent800 : "transparent", borderWidth: theme === "orange" ? 2 : 0 },
              ]}
              resizeMode="contain"
            />
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
  card: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    marginTop: 20,
  },
  themeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  iconWrapper: {
    width: 32,
    alignItems: "center",
  },
  themeLabel: {
    fontFamily: "SBold",
    fontSize: SIZES.small,
  },
  themeDesc: {
    fontFamily: "Regular",
    fontSize: SIZES.xSmall,
    marginTop: 2,
  },
  dot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    height: 1,
  },
  previewCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginTop: 20,
  },
  previewTitle: {
    fontFamily: "SBold",
    fontSize: SIZES.small,
    marginBottom: 16,
  },
  previewRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  previewImage: {
    width: SIZES.width * 0.35,
    height: 280,
    borderRadius: 10,
  },
});

export default ThemeScreen;
