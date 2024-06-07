import { useContext } from "react";
import { View, Text, StyleSheet } from "react-native";
// import { useTranslation } from 'react-i18next';
// import { ThemeContext } from '../theme-context';
import { COLORS } from "../../constants";
import i18n from "@/constants/i18n";
import { ThemeContext } from "@/hooks/theme-context";

const IndicationCalendar = ({ title }) => {
  const {theme} = useContext(ThemeContext);
  // const {t} = useTranslation();
  let titleText = null;
  let bgColor = null;
  let borderWidth = null;
  let borderColor = null;
  switch (title) {
    case "Jours des règles":
      titleText = "joursDesRegles";
      bgColor = theme === "pink" ? COLORS.accent600 : COLORS.accent800;
      break;
    case "Ovulation":
      titleText = "ovulation";
      borderWidth = 1;
      borderColor = theme === "pink" ? COLORS.accent600 : COLORS.accent800;
      break;
    case "Période de fécondité":
      titleText = "periodeDeFecondite";
      bgColor = theme === "pink" ? COLORS.accent400 : COLORS.neutral250;
      break;
    default:
      return null;
  }
  return (
    <View style={styles.container}>
      <View
        style={[
          styles.circle,
          {
            backgroundColor: bgColor,
            borderWidth: borderWidth,
            borderColor: borderColor,
          },
        ]}
      />
      <Text style={styles.text}>{i18n.t(titleText)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // width: "50%",
    flexDirection: "row",
    alignItems: "center",
    marginRight:5,
    gap: 10,
  },
  circle: {
    width: 15,
    height: 15,
    borderRadius: 100,
  },
  text: {
    fontFamily: "Regular",
  },
});

export default IndicationCalendar;
