// components/ProgressBar.js
import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  ProgressBarAndroidBase,
  ActivityIndicator,
} from "react-native";
import { COLORS, SIZES } from "../constants";

const ProgressBar = ({ percentage, isVisible,text }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      setProgress((currentProgress) => {
        if (currentProgress < 99) {
          setTimeout(updateProgress, Math.round(progress * 500));
        }

        return currentProgress + 1;
      });
    };
    updateProgress();
  }, []);

  return (
    <View
      style={[styles.container, { display: isVisible ? "block" : "none" }]}
      className="absolute top-0 left-0  bg-white flex items-center justify-center"
    >
      <Text className="my-2 text-xl">{text}</Text>

      <ActivityIndicator size={40} color={"#FF7575"} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SIZES.width,
    height: "100%",
    // backgroundColor: "white",
  },
  bar: {
    height: "100%",
    backgroundColor: "#FF7575",
    display: "flex",
  },
});

export default ProgressBar;
