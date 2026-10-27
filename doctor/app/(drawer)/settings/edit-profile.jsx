import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "@legendapp/state/react";
import { COLORS, SIZES, images } from "@/constants";
import AppHeader, { HEADER_HEIGHT } from "@/components/AppHeader";
import { handleHeaderScroll } from "@/hooks/useHeaderScroll";
import { useDiscoveryTheme } from "@/components/discovery";
import DiscoveryCard from "@/components/discovery/DiscoveryCard";
import { DecorativeBlobs, Input, PrimaryButton, toast } from "@/components/ui";
import { userState } from "@/legendstate/AmpelaStates";
import { uploadImage } from "@/services/api";
import { saveDoctorProfile } from "@/services/otpAuth";
import { suspendAppLock } from "@/components/AppLockGate";

/** Édition du profil : photo et pseudo. Le rôle (utilisatrice) et la
 * spécialité des professionnelles sont gérés par l'application dédiée aux
 * professionnelles de santé, sur le même backend. */
const EditProfileScreen = () => {
  const navigation = useNavigation();
  const user = useSelector(() => userState.get());
  const { surface, accentColor, accentContainer } = useDiscoveryTheme();

  const [username, setUsername] = useState(user.username ?? "");
  const [profession, setProfession] = useState(user.profession ?? "");
  const [profileImage, setProfileImage] = useState(user.profileImage ?? null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const dirty =
    username.trim() !== (user.username ?? "") ||
    profession.trim() !== (user.profession ?? "") ||
    (profileImage ?? null) !== (user.profileImage ?? null);

  const pickImage = async () => {
    suspendAppLock();
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      toast.warning("Autorisez l'accès aux photos pour changer votre avatar.");
      return;
    }
    suspendAppLock();
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });
    if (result.canceled) return;
    setUploading(true);
    try {
      setProfileImage(await uploadImage(result.assets[0].uri));
    } catch (error) {
      console.error("Avatar upload failed:", error);
      toast.error("Envoi de la photo impossible.");
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    const name = username.trim();
    if (!name) {
      toast.warning("Le nom affiché ne peut pas être vide.");
      return;
    }
    if (!profession.trim()) {
      toast.warning("Indiquez votre spécialité.");
      return;
    }
    setSaving(true);
    try {
      await saveDoctorProfile({ username: name, profession: profession.trim(), profileImage });
      toast.success("Profil mis à jour.");
      navigation.goBack();
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error(error.message || "Impossible d'enregistrer le profil.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: surface }]}>
      <DecorativeBlobs />
      <AppHeader navigation={navigation} title="Modifier le profil" showBack absolute />
      <KeyboardAvoidingView style={styles.container} behavior="padding">
        <ScrollView
          onScroll={handleHeaderScroll}
          scrollEventThrottle={16}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Photo */}
          <View style={styles.avatarSection}>
            <TouchableOpacity onPress={pickImage} activeOpacity={0.85} style={styles.avatarWrapper} disabled={uploading}>
              <Image
                source={profileImage ? { uri: profileImage } : images.doctor01}
                style={[styles.avatar, { borderColor: accentColor }]}
              />
              <View style={[styles.editBadge, { backgroundColor: accentColor }]}>
                <Ionicons name="camera" size={16} color={COLORS.neutral100} />
              </View>
            </TouchableOpacity>
            <Text style={styles.avatarHint}>{uploading ? "Envoi de la photo…" : "Touchez la photo pour la changer"}</Text>
          </View>

          <DiscoveryCard style={styles.card}>
            <Text style={styles.fieldLabel}>Nom affiché</Text>
            <Input
              value={username}
              onChangeText={setUsername}
              placeholder="Ex : Dr Nirina"
              maxLength={40}
              editable={!saving}
              containerStyle={styles.field}
            />
            <Text style={styles.fieldLabel}>Spécialité</Text>
            <Input
              value={profession}
              onChangeText={setProfession}
              placeholder="Ex : Sage-femme, Gynécologue, Infirmière…"
              maxLength={60}
              editable={!saving}
              containerStyle={styles.field}
            />
            <View style={[styles.hint, { backgroundColor: accentContainer }]}>
              <Ionicons name="information-circle-outline" size={16} color={accentColor} />
              <Text style={[styles.hintText, { color: accentColor }]}>
                Votre nom et votre spécialité sont visibles par les utilisatrices sur le forum et
                dans la messagerie, avec la mention « Professionnelle de santé ».
              </Text>
            </View>
          </DiscoveryCard>
        </ScrollView>

        <View style={styles.footer}>
          <PrimaryButton
            title="Enregistrer"
            onPress={save}
            disabled={!dirty || saving || uploading}
            loading={saving}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: HEADER_HEIGHT + 16,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  avatarSection: {
    alignItems: "center",
    paddingVertical: 16,
  },
  avatarWrapper: {
    width: 120,
    height: 120,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.neutral100,
  },
  avatarHint: {
    fontFamily: "Regular",
    fontSize: SIZES.small - 1,
    color: "#8E8793",
    marginTop: 10,
  },
  card: {
    marginTop: 8,
  },
  fieldLabel: {
    fontFamily: "SBold",
    fontSize: SIZES.small,
    color: "#5A525F",
    marginBottom: 8,
    marginLeft: 4,
  },
  field: {
    marginBottom: 16,
  },
  hint: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    borderRadius: 14,
  },
  hintText: {
    flex: 1,
    fontFamily: "Regular",
    fontSize: SIZES.small - 1,
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
});

export default EditProfileScreen;
