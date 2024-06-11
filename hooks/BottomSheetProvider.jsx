import React, { createContext, useContext, useRef, useState } from "react";
import BottomSheet from "@gorhom/bottom-sheet";
import { StyleSheet } from "react-native";
import { COLORS, SIZES } from "@/constants";

const BottomSheetContext = createContext();

export const BottomSheetProvider = ({ children }) => {
  const bottomSheetRef = useRef(null);
  const [content, setContent] = useState(null);

  const openBottomSheet = (component) => {
    setContent(component);
    bottomSheetRef.current?.expand();
  };

  const closeBottomSheet = () => {
    bottomSheetRef.current?.close();
  };

  return (
    <BottomSheetContext.Provider value={{ openBottomSheet, closeBottomSheet }}>
      {children}
      <BottomSheet
        // style={{shadowColor:"black",
        //   shadowOffset:2,
        //   shadowOpacity:10,
        //   shadowRadius:2,

        // }}
        containerstyle={styles.bottomSheet}
        ref={bottomSheetRef}
        initialSnapIndex={0}
        snapPoints={["1%", "50%", "60%", "80%", "95%"]}
        onClose={() => setContent(null)}
        enablePanDownToClose
      >
        {content}
      </BottomSheet>
    </BottomSheetContext.Provider>
  );
};

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  bottomSheet: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,
    elevation: 10,
    bottom: -10,
  },
  handleIndicator: {
    backgroundColor: "#ccc",
  },
  container: {
    padding: 20,
  },
  infoText: {
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    padding: 10,
    borderRadius: 15,
    overflow: "hidden",
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: "#c0bdbd",
    borderRadius: 15,
    fontFamily: "Medium",
    marginVertical: 10,
    width: Math.floor(SIZES.width) - 40,
    overflow: "hidden",
    backgroundColor: "rgb(243 244 246)",
  },
  loginButton: {
    padding: 15,
    borderRadius: 15,
    backgroundColor: COLORS.accent500,
  },
  loginButtonText: {
    color: "white",
    textAlign: "center",
  },
  orText: {
    textAlign: "center",
    paddingVertical: 10,
  },
  signupButton: {
    padding: 15,
    borderRadius: 15,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  signupButtonText: {
    color: COLORS.accent500,
    textAlign: "center",
  },
});

export const useBottomSheet = () => useContext(BottomSheetContext);
