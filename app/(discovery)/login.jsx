import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";
import { COLORS, images, SIZES } from "@/constants";
import PhoneInput from "react-native-international-phone-number";
import { preferenceState } from "@/legendstate/AmpelaStates";
import { useSelector } from "@legendapp/state/react";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import CustomAlert from "@/components/CustomAlert";
import { SafeAreaView } from "react-native-safe-area-context";

const PhoneNumberScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [alertVisible, setAlertVisible] = useState(false); // State for alert visibility
  const [alertType, setAlertType] = useState("confirmation"); // State for alert type
  const { theme } = useSelector(() => preferenceState.get());
  const navigation = useRouter();
  const [selectedCountry, setSelectedCountry] = useState(null);
  function handleInputValue(phoneNumber) {
    setPhoneNumber(phoneNumber);
  }

  function handleSelectedCountry(country) {
    setSelectedCountry(country);
  }

  const handleNext = () => {
    setAlertType("confirmation");
    setAlertVisible(true); // Show the confirmation alert
  };

  const handleConfirm = async () => {
    setAlertType("loading");
    try {
      // Simulate loading
      setTimeout(() => {
        const confirmation = "01234";
        navigation.navigate({
          pathname: "otp",
          params: { phoneNumber, confirmation },
        });
        setAlertVisible(false);
      }, 2000); // Simulate a 2-second loading time
    } catch (error) {
      console.error(error);
      setAlertVisible(false);
    }
  };

  const handleCancel = () => {
    setAlertVisible(false); // Hide the alert without doing anything
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* <StatusBar backgroundColor={"white"} barStyle={"dark-content"} /> */}
      <View style={styles.topContainer}>
        <Image source={images.otp1} style={styles.image} contentFit="contain" />
        <Text style={styles.title}>Connectez-vous</Text>
        <Text style={styles.subtitle}>
          Afin de pouvoir synchroniser vos données
        </Text>
        <View style={styles.middleContainer}>
          <PhoneInput
            value={phoneNumber}
            onChangePhoneNumber={handleInputValue}
            selectedCountry={selectedCountry}
            onChangeSelectedCountry={handleSelectedCountry}
          />
        </View>
      </View>

      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor:
                theme === "pink" ? COLORS.accent500 : COLORS.accent800,
            },
          ]}
          onPress={handleNext}
        >
          <Text style={styles.buttonText}>Recevoir le code</Text>
        </TouchableOpacity>
      </View>

      {/* Custom Alert */}
      <CustomAlert
        type={alertType}
        message={
          alertType === "confirmation"
            ? `Est-ce bien votre numéro de téléphone: ${phoneNumber} ?`
            : "Chargement..."
        }
        onConfirm={alertType === "confirmation" ? handleConfirm : undefined}
        onCancel={alertType === "confirmation" ? handleCancel : undefined}
        visible={alertVisible}
        onClose={() => setAlertVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "white",
  },
  topContainer: {
    flex: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  middleContainer: {
    justifyContent: "center",
  },
  bottomContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 20,
  },
  image: {
    width: SIZES.width - 40,
    height: SIZES.height * 0.3,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    width: SIZES.width - 40,
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default PhoneNumberScreen;
