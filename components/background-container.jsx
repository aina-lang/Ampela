import { useContext } from "react";
import { ImageBackground, KeyboardAvoidingView, Platform } from "react-native";
import { images } from "@/constants";
import { ThemeContext } from "./theme-context";

const BackgroundContainer = ({ children, paddingBottom }) => {
  // const { theme } = useContext(ThemeContext);
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ImageBackground
        source={"pink" === "pink" ? images.bgRose : images.bgOrange}
        resizeMode="repeat"
        style={{
          flex: 1,
          paddingHorizontal: 20,
          paddingBottom: paddingBottom ? paddingBottom : null,
        }}
      >
        {children}
      </ImageBackground>
    </KeyboardAvoidingView>
  );
};

export default BackgroundContainer;
