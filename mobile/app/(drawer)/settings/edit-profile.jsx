import React, { useState } from "react";
import Avatar from "@/components/ui/Avatar";
import i18n from "@/constants/i18n";
import { persistLocalPhoto } from "@/utils/profilePhoto";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "@legendapp/state/react";
import { COLORS, SIZES } from "@/constants";
import AppHeader, { HEADER_HEIGHT } from "@/components/AppHeader";
import { handleHeaderScroll } from "@/hooks/useHeaderScroll";
import { useDiscoveryTheme } from "@/components/discovery";
import DiscoveryCard from "@/components/discovery/DiscoveryCard";
import { DecorativeBlobs, Input, PrimaryButton, toast } from "@/components/ui";
import { userState, updateUser } from "@/legendstate/AmpelaStates";
import { updateUserSqlite } from "@/services/database";
import { isSignedIn } from "@/services/api";
import { pushProfileToCloud } from "@/services/otpAuth";
import { suspendAppLock } from "@/components/AppLockGate";

/** Édition du profil : photo et pseudo. Le rôle (utilisatrice) et la
 * spécialité des professionnelles sont gérés par l'application dédiée aux
 * professionnelles de santé, sur le même backend. */
const EditProfileScreen = () => {
  const navigation = useNavigation();
  const user = useSelector(() => userState.get());
  const { surface, accentColor, accentContainer } = useDiscoveryTheme();

  const [username, setUsername] = useState(user.username ?? "");
  const [profileImage, setProfileImage] = useState(user.profileImage ?? null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const dirty =
    username.trim() !== (user.username ?? "") ||
    (profileImage ?? null) !== (user.profileImage ?? null);

  const pickImage = async () => {
    suspendAppLock();
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      toast.warning(i18n.t("editProfilePhotoPermission"));
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
    // Local d'abord : la photo est gardée sur le téléphone ; l'envoi au
    // serveur se fait à l'enregistrement, par la synchronisation.
    setProfileImage(await persistLocalPhoto(result.assets[0].uri));
  };

  const save = async () => {
    const name = username.trim();
    if (!name) {
      toast.warning(i18n.t("editProfileUsernameEmpty"));
      return;
    }
    const updated = { ...user, username: name, profileImage };
    setSaving(true);
    try {
      updateUser(updated, { touch: true });
      await updateUserSqlite(
        updated.id,
        updated.username,
        updated.profession,
        updated.lastMenstruationDate,
        updated.durationMenstruation,
        updated.cycleDuration,
        updated.email,
        updated.profileImage
      );
      if (isSignedIn()) {
        pushProfileToCloud().catch((error) => console.error("Profile sync failed:", error));
      }
      toast.success(i18n.t("editProfileSaved"));
      navigation.goBack();
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error(i18n.t("editProfileSaveFailed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: surface }]}>
      <DecorativeBlobs />
      <AppHeader navigation={navigation} title={i18n.t("editProfileTitle")} showBack absolute />
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
              <Avatar
                uri={profileImage}
                name={username}
                size={120}
                borderWidth={2}
                borderColor={accentColor}
              />
              <View style={[styles.editBadge, { backgroundColor: accentColor }]}>
                <Ionicons name="camera" size={16} color={COLORS.neutral100} />
              </View>
            </TouchableOpacity>
            <Text style={styles.avatarHint}>{uploading ? i18n.t("editProfileUploading") : i18n.t("editProfileTapPhoto")}</Text>
          </View>

          <DiscoveryCard style={styles.card}>
            <Text style={styles.fieldLabel}>{i18n.t("editProfileUsername")}</Text>
            <Input
              value={username}
              onChangeText={setUsername}
              placeholder={i18n.t("editProfileUsernamePlaceholder")}
              maxLength={40}
              editable={!saving}
              containerStyle={styles.field}
            />
            <View style={[styles.hint, { backgroundColor: accentContainer }]}>
              <Ionicons name="information-circle-outline" size={16} color={accentColor} />
              <Text style={[styles.hintText, { color: accentColor }]}>{i18n.t("editProfileHint")}</Text>
            </View>
          </DiscoveryCard>
        </ScrollView>

        <View style={styles.footer}>
          <PrimaryButton
            title={i18n.t("editProfileSave")}
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
