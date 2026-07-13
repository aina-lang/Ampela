import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { useSelector } from "@legendapp/state/react";
import { preferenceState, userState } from "@/legendstate/AmpelaStates";
import { COLORS, SIZES } from "@/constants";
import AppHeader from "@/components/AppHeader";
import { useNavigation } from "expo-router";
import {
  getAuth,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { AntDesign } from "@expo/vector-icons";
import { useDiscoveryTheme } from "@/components/discovery";
import DiscoveryCard from "@/components/discovery/DiscoveryCard";
import DiscoveryInput from "@/components/discovery/DiscoveryInput";
import ModernButton from "@/components/ModernButton";

const ChangePassword = () => {
  const { theme } = useSelector(() => preferenceState.get());
  const navigation = useNavigation();
  const user = useSelector(() => userState.get());
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const { surface, accentColor, accentColorDisabled } = useDiscoveryTheme();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPasswordError, setCurrentPasswordError] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  // Validate password complexity
  const validatePassword = (password) => {
    const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    return regex.test(password);
  };

  // Handle new password input
  const handleNewPasswordChange = (text) => {
    setNewPassword(text);
    if (!text) {
      setNewPasswordError("Veuillez saisir votre mot de passe");
    } else if (!validatePassword(text)) {
      setNewPasswordError(
        "Le mot de passe doit contenir au moins 8 caractères, inclure au moins une majuscule, une minuscule et un chiffre"
      );
    } else {
      setNewPasswordError("");
    }
  };

  // Handle confirm password input
  const handleConfirmPasswordChange = (text) => {
    setConfirmPassword(text);
    if (!text) {
      setConfirmPasswordError("Veuillez confirmer votre mot de passe");
    } else if (text !== newPassword) {
      setConfirmPasswordError("Les mots de passe ne correspondent pas");
    } else {
      setConfirmPasswordError("");
    }
  };

  // Reauthenticate user with current password
  const reauthenticate = (currentPassword) => {
    const credential = EmailAuthProvider.credential(
      currentUser.email,
      currentPassword
    );
    return reauthenticateWithCredential(currentUser, credential);
  };

  // Handle password change
  const handleChangePassword = () => {
    if (!currentPassword) {
      setCurrentPasswordError("Veuillez saisir votre mot de passe actuel");
      return;
    }
    if (
      newPasswordError ||
      confirmPasswordError ||
      !newPassword ||
      !confirmPassword
    ) {
      Alert.alert("Erreur", "Veuillez corriger les erreurs avant de continuer");
      return;
    }

    reauthenticate(currentPassword)
      .then(() => {
        updatePassword(currentUser, newPassword)
          .then(() => {
            Alert.alert(
              "Succès",
              "Votre mot de passe a été changé avec succès"
            );
            navigation.goBack();
          })
          .catch((error) => {
            Alert.alert(
              "Erreur",
              "Une erreur s'est produite lors du changement de mot de passe"
            );
          });
      })
      .catch((error) => {
        Alert.alert("Erreur", "Le mot de passe actuel est incorrect");
      });
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: surface,
      }}
    >
      <AppHeader
        navigation={navigation}
        title="Changer le mot de passe"
        showBack
        absolute
      />
      <View style={styles.container}>
        <Text style={styles.description}>
          Entrez votre mot de passe actuel, puis choisissez un nouveau mot de
          passe sécurisé (8 caractères minimum, avec majuscule, minuscule et
          chiffre).
        </Text>
        <DiscoveryInput
          placeholder="Mot de passe actuel"
          secureTextEntry
          onChangeText={(text) => setCurrentPassword(text)}
          backgroundColor={COLORS.neutral100}
          borderColor={accentColor}
          containerStyle={styles.inputSpacing}
        />
        {currentPasswordError && (
          <Text style={styles.error}>{currentPasswordError}</Text>
        )}
        <DiscoveryInput
          placeholder="Nouveau mot de passe"
          secureTextEntry
          onChangeText={handleNewPasswordChange}
          backgroundColor={COLORS.neutral100}
          borderColor={accentColor}
          containerStyle={styles.inputSpacing}
        />
        {newPasswordError && (
          <Text style={styles.error}>{newPasswordError}</Text>
        )}
        <DiscoveryInput
          placeholder="Confirmer le mot de passe"
          secureTextEntry
          onChangeText={handleConfirmPasswordChange}
          backgroundColor={COLORS.neutral100}
          borderColor={accentColor}
          containerStyle={styles.inputSpacing}
        />
        {confirmPasswordError && (
          <Text style={styles.error}>{confirmPasswordError}</Text>
        )}

        <ModernButton
          title="Modifier le mot de passe"
          onPress={handleChangePassword}
          disabled={currentPassword == "" || newPassword == ""}
          accentColor={accentColor}
          accentColorDisabled={accentColorDisabled}
          style={{ marginTop: 20 }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 200,
    paddingBottom: 40,
  },
  description: {
    marginBottom: 20,
    fontSize: 16,
    color: "#5A5A5A",
    textAlign: "center",
    lineHeight: 25,
  },
  inputSpacing: {
    marginBottom: 16,
  },
  error: {
    color: "#E24C4C",
    fontSize: SIZES.small - 1,
    marginTop: 6,
    marginLeft: 4,
    marginBottom: 8,
    fontFamily: "Regular",
  },
});

export default ChangePassword;
