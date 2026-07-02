import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SIZES } from "@/constants";
import { useNavigation } from "expo-router";
import Feather from "@expo/vector-icons/Feather";
import { AntDesign } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { updateUser } from "@/legendstate/AmpelaStates";

const UsernameAndPasswordScreen = () => {
  const navigation = useNavigation();

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
      Alert.alert(
        "Permission refusée",
        "Désolé, nous avons besoin des permissions pour accéder aux images !"
      );
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
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Faisons connaissance</Text>
          <Text style={styles.title}>Quel est votre nom d'utilisateur ?</Text>
          <Text style={styles.subtitle}>
            Ce pseudo sera visible par les autres membres de la communauté.
          </Text>
        </View>

        {/* Avatar */}
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

        {/* Formulaire */}
        <View style={styles.form}>
          <Text style={styles.inputLabel}>Nom d'utilisateur</Text>
          <View style={styles.inputContainer}>
            <TextInput
              cursorColor="#FF7575"
              placeholder="Ex : Sarah_M"
              placeholderTextColor="#A0A0A0"
              value={nameText}
              onChangeText={handleUsernameChange}
              style={styles.input}
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Navigation basse — identique aux autres écrans */}
        <View style={styles.btnBox}>
          <TouchableOpacity onPress={prevHandled} style={styles.backButton}>
            <AntDesign name="arrow-left" size={16} color="#9E9E9E" />
            <Text style={styles.backButtonText}>Retour</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleNextBtnPress}
            disabled={isNextBtnDisabled}
            activeOpacity={0.85}
            style={[
              styles.nextBtn,
              { backgroundColor: isNextBtnDisabled ? "#EFEFEF" : "#FF7575" },
            ]}
          >
            <Text
              style={[
                styles.nextBtnText,
                { color: isNextBtnDisabled ? "#B0B0B0" : COLORS.neutral100 },
              ]}
            >
              Suivant
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral100,
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 12,
    paddingBottom: 24,
  },
  eyebrow: {
    color: "#FF7575",
    fontFamily: "SBold",
    fontSize: SIZES.small,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  title: {
    fontFamily: "Bold",
    fontSize: SIZES.width * 0.07,
    color: "#1A1A1A",
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: "Regular",
    fontSize: SIZES.small,
    color: "#8A8A8A",
    lineHeight: 20,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 28,
  },
  imagePicker: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FAFAFA",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F0F0F0",
    overflow: "hidden",
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  editBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FF7575",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.neutral100,
  },
  avatarLabel: {
    marginTop: 10,
    fontFamily: "Regular",
    fontSize: SIZES.small - 1,
    color: "#A0A0A0",
  },
  form: {
    flex: 1,
  },
  inputLabel: {
    fontFamily: "SBold",
    fontSize: SIZES.small,
    color: "#3A3A3A",
    marginBottom: 8,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: "#F0F0F0",
    borderRadius: 14,
    backgroundColor: "#FAFAFA",
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: "Regular",
    fontSize: SIZES.medium,
    color: "#1A1A1A",
  },
  btnBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 20,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  backButtonText: {
    color: "#9E9E9E",
    fontSize: 15,
    fontFamily: "SBold",
    marginLeft: 6,
  },
  nextBtn: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    shadowColor: "#FF7575",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  nextBtnText: {
    fontFamily: "SBold",
    fontSize: SIZES.medium,
  },
});

export default UsernameAndPasswordScreen;