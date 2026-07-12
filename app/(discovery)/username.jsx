import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image } from "react-native";
import { Feather } from "@expo/vector-icons";
import { COLORS, SIZES } from "@/constants";
import * as ImagePicker from "expo-image-picker";
import { useSelector } from "@legendapp/state/react";
import { updateUser, preferenceState } from "@/legendstate/AmpelaStates";
import { useNavigation } from "expo-router";
import StepScreenWrapper from "@/components/StepScreenWrapper";
import ModernButton from "@/components/ModernButton";

const UsernameAndPasswordScreen = () => {
  const navigation = useNavigation();
  const { theme } = useSelector(() => preferenceState.get());
  const accentColor = theme === "pink" ? "#FF7575" : "#FE8729";
  const accentColorDisabled = theme === "pink" ? "#FFB5B5" : "#FED4A0";

  const [nameText, setNameText] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [isNextBtnDisabled, setIsNextBtnDisabled] = useState(true);

  useEffect(() => {
    setIsNextBtnDisabled(nameText.trim() === "");
  }, [nameText]);

  const handleUsernameChange = (text) => {
    setNameText(text);
  };

  const handleNextBtnPress = async () => {
    if (isNextBtnDisabled) return;
    const userData = {
      username: nameText.trim(),
      profileImage,
    };
    updateUser(userData);
    navigation.navigate("lastMenstrualCycleStart");
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Permission refusée: nous avons besoin des permissions pour accéder aux images !");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const prevHandled = () => {
    navigation.goBack();
  };

  return (
    <StepScreenWrapper
      stepNumber={1}
      eyebrow="Étape 1 sur 3"
      title="Quel est votre nom d'utilisateur ?"
      subtitle="Ce pseudo sera visible par les autres membres de la communauté."
    >
      <View style={styles.content}>
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={pickImage} activeOpacity={0.85}>
            <View style={styles.imagePicker}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.image} />
              ) : (
                <Feather name="camera" size={32} color="#B0B0B0" />
              )}
              <View style={styles.editBadge}>
                <Feather name="edit-2" size={14} color="#FFFFFF" />
              </View>
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarLabel}>Photo de profil (optionnel)</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.inputLabel}>Nom d'utilisateur</Text>
          <View style={styles.inputContainer}>
            <TextInput
              cursorColor={COLORS.accent500}
              placeholder="Ex : Sarah_M"
              placeholderTextColor="#A0A0A0"
              value={nameText}
              onChangeText={handleUsernameChange}
              style={styles.input}
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.btnBox}>
          <TouchableOpacity onPress={prevHandled} style={styles.backButton}>
            <Feather name="arrow-left" size={16} color="#9E9E9E" />
            <Text style={styles.backButtonText}>Retour</Text>
          </TouchableOpacity>

          <ModernButton
            title="Suivant"
            onPress={handleNextBtnPress}
            disabled={isNextBtnDisabled}
            accentColor={accentColor}
            accentColorDisabled={accentColorDisabled}
            style={{ flex: 1, marginLeft: 12 }}
          />
        </View>
      </View>
    </StepScreenWrapper>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  imagePicker: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FAFAFA",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#F0F0F0",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  editBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.accent500,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2.5,
    borderColor: COLORS.neutral100,
  },
  avatarLabel: {
    marginTop: 12,
    fontFamily: "Regular",
    fontSize: SIZES.small - 1,
    color: "#9E9E9E",
  },
  form: {
    marginBottom: 32,
  },
  inputLabel: {
    fontFamily: "SBold",
    fontSize: SIZES.small,
    color: "#3A3A3A",
    marginBottom: 10,
  },
  inputContainer: {
    borderWidth: 1.5,
    borderColor: "#F0F0F0",
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
    height: 56,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  input: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    fontFamily: "Regular",
    fontSize: SIZES.medium,
    color: "#1A1A1A",
    flex: 1,
  },
  btnBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    gap: 6,
  },
  backButtonText: {
    color: "#9E9E9E",
    fontSize: 15,
    fontFamily: "SBold",
  },
});

export default UsernameAndPasswordScreen;
