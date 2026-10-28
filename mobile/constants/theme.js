import { Dimensions } from "react-native";

const height = Dimensions.get("window").height;
const width = Dimensions.get("window").width;

const COLORS = {
  primary: "#4A434F",

  neutral400: "#808080",
  neutral300: "#C4C4C4",
  neutral280: "#FFF2E4",
  neutral250: "#EEDCAE",
  neutral200: "#FEDADA",
  neutral100: "#FFFFFF",

  accent800: "#FE8729",
  accent600: "#E2445C",
  accent500: "#FF7575",
  accent400: "#FFADAD",
};

const FONT = {
  medium: "Medium",
  semiBold: "SBold",
  bold: "Bold",
};

// Échelle responsive : les tailles sont définies pour un écran de 375 px de
// large et s'adaptent à l'écran réel (bornée entre 85 % et 125 % pour rester
// lisible sur les très petits et très grands téléphones).
const BASE_WIDTH = 375;
const ratio = Math.min(Math.max(width / BASE_WIDTH, 0.85), 1.25);
/** Mise à l'échelle proportionnelle (dimensions : boutons, champs, icônes). */
const scale = (size) => Math.round(size * ratio);
/** Mise à l'échelle modérée (polices : la moitié de l'écart). */
const ms = (size, factor = 0.5) => Math.round(size + (size * ratio - size) * factor);

const SIZES = {
  xSmall: ms(10),
  small: ms(13),
  medium: ms(15),
  xmedium: ms(17),
  large: ms(20),
  xLarge: ms(24),
  xxLarge: ms(34),
  height: height,
  width: width,
  ratio,
  scale,
  ms,
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
