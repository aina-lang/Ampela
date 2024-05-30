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

const ProgressBar = ({ percentage, isVisible }) => {
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
      <Text className="my-2 text-xl">Chargement de vos donnés</Text>
      {/* <View className="h-[20] bg-[#e7e5e5] mx-auto w-[80%] rounded-xl overflow-hidden"> */}
      {/* <View
          style={[
            styles.bar,
            {
              width: `${Math.round(progress)}%`,
              alignItems:
                Math.round(progress * 100) < 60 ? "flex-end" : "center",
              // justifyItems: Math.round(progress * 100) < 60 ? "flex-end" : "center",
            },
          ]}
        >
          <Text className="text-white">{progress}%</Text>
        </View> */}

      {/* </View> */}
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
