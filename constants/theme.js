import { Dimensions } from "react-native";

const height = Dimensions.get("window").height;
const width = Dimensions.get("window").width;

const COLORS = {
  primary: "#333333",

  neutral400: "#808080",
  neutral300: "#C4C4C4",
  neutral280: "#FFF2E4",
  neutral250: "#EEDCAE",
  neutral200: "#FEDADA",
  neutral100: "#FFFFFF",

  bg100: "#f3f4f6",
  bg200:"#e5e7eb",
  text100: "",
  text700: "rgba(0,0,0,0.7)",

  accent800: "#FE8729",
  accent800_80: "rgba(254,135,41,0.8)",
  accent800_60: "rgba(254,135,41,0.6)",
  accent800_40: "rgba(254,135,41,0.4)",
  accent800_20: "rgba(254,135,41,0.2)",

  accent600: "#E2445C",
  accent600_80: "rgba(226,68,92,0.8)",
  accent600_60: "rgba(226,68,92,0.6)",
  accent600_40: "rgba(226,68,92,0.4)",
  accent600_20: "rgba(226,68,92,0.2)",

  accent500: "#FF7575",
  accent500_80: "rgba(255,117,117,0.8)",
  accent500_60: "rgba(255,117,117,0.6)",
  accent500_40: "rgba(255,117,117,0.4)",
  accent500_20: "rgba(255,117,117,0.2)",

  accent400: "#FFADAD",
  accent400_80: "rgba(255,173,173,0.8)",
  accent400_60: "rgba(255,173,173,0.6)",
  accent400_40: "rgba(255,173,173,0.4)",
  accent400_20: "rgba(255,173,173,0.2)",
};

const FONT = {
  medium: "Medium",
  semiBold: "SBold",
  bold: "Bold",
};

const SIZES = {
  xSmall: 10,
  small: 13,
  medium: 15,
  xmedium: 17,
  large: 20,
  xLarge: 24,
  xxLarge: 34,
  height: height,
  width: width,
};

const SHADOWS = {
  small: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5.84,
    elevation: 5,
  },
};

export { COLORS, FONT, SIZES, SHADOWS };
