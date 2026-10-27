import { handleHeaderScroll } from "@/hooks/useHeaderScroll";
import { DecorativeBlobs } from "@/components/ui";
import React, { useState } from "react";
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  Switch,
} from "react-native";
import AppHeader, { HEADER_HEIGHT } from "@/components/AppHeader";
import { COLORS, SIZES, images } from "@/constants";
import { useNavigation, useRouter } from "expo-router";
import {
  updateUser,
  userState,
  preferenceState,
  sessionState,
  updatePreference,
} from "@/legendstate/AmpelaStates";
import { useSelector } from "@legendapp/state/react";
import { AntDesign, Feather, FontAwesome, Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as LocalAuthentication from "expo-local-authentication";
import {
  isSignedIn,
  uploadImage,
  signOut,
  deleteAccount,
} from "@/services/api";
import ConfirmSheet from "@/components/ConfirmSheet";
import { saveDoctorProfile } from "@/services/otpAuth";
import { describeRole, ROLE_LABEL } from "@/utils/roles";
import { useDiscoveryTheme } from "@/components/discovery";
import DiscoveryCard from "@/components/discovery/DiscoveryCard";
import { toast } from "@/components/ui";
import { suspendAppLock } from "@/components/AppLockGate";

const AccountScreen = () => {
  const user = useSelector(() => userState.get());
  const { appLockEnabled } = useSelector(() => preferenceState.get());

  // Verrouillage biométrique à l'ouverture (empreinte, visage ou schéma).
  const handleAppLockToggle = async (value) => {
    if (!value) {
      updatePreference({ appLockEnabled: false });
      return;
    }
    try {
      const level = await LocalAuthentication.getEnrolledLevelAsync();
      if (level === LocalAuthentication.SecurityLevel.NONE) {
        toast.warning(
          "Configurez d'abord un verrouillage d'écran (empreinte, schéma ou code PIN) sur votre téléphone."
        );
        return;
      }
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Confirmez pour activer le verrouillage",
        cancelLabel: "Annuler",
      });
      if (result.success) updatePreference({ appLockEnabled: true });
    } catch (error) {
      console.error("Failed to enable app lock:", error);
      toast.error("Impossible d'activer le verrouillage.");
    }
  };
  const navigation = useNavigation();
  const router = useRouter();
  const { surface, accentColor, accentColorDisabled } = useDiscoveryTheme();
  const signedIn = useSelector(() => !!sessionState.token.get());
  const sessionEmail = useSelector(() => sessionState.user.get()?.email ?? "");

  // Confirmation en cours : "logout" | "delete" | null
  const [confirm, setConfirm] = useState(null);
  const [accountBusy, setAccountBusy] = useState(false);

  const handleLogout = async () => {
    await signOut();
    setConfirm(null);
    toast.info("Vous êtes déconnectée.");
    router.replace("/(discovery)/login");
  };

  const handleDeleteAccount = async () => {
    setAccountBusy(true);
    try {
      await deleteAccount();
      setConfirm(null);
      toast.success("Votre compte a été supprimé.");
      router.replace("/(discovery)");
    } catch (error) {
      toast.error(error.message || "Suppression impossible pour le moment.");
    } finally {
      setAccountBusy(false);
    }
  };

  const [profileImage1, setProfileImage] = useState(user.profileImage);

  const handleProfileImageChange = async () => {
    try {
      suspendAppLock();
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        toast.warning("Autorisez l'accès aux photos pour changer votre portrait.");
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
      const profileImage = await uploadImage(result.assets[0].uri);
      await saveDoctorProfile({
        username: user.username,
        profession: user.profession,
        profileImage,
      });
      setProfileImage(profileImage);
      toast.success("Photo mise à jour.");
    } catch (error) {
      console.error("Error picking image: ", error);
      toast.error(error.message || "Impossible de changer la photo.");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: surface }]}>
      <DecorativeBlobs />
      <AppHeader
        navigation={navigation}
        title="À propos de moi"
        showBack
        absolute
        rightIcons={[
          { name: "create-outline", onPress: () => navigation.navigate("settings/edit-profile") },
        ]}
      />

      <ScrollView
        onScroll={handleHeaderScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={{ paddingTop: HEADER_HEIGHT + 16, paddingBottom: 40 }}
      >
        {/* Profil */}
        <View style={styles.profil}>
          <TouchableOpacity
            onPress={handleProfileImageChange}
            activeOpacity={0.85}
            style={styles.avatarWrapper}
          >
            <Image
              source={profileImage1 ? { uri: profileImage1 } : images.doctor01}
              style={[styles.avatar, { borderColor: accentColor }]}
            />
            <View style={[styles.editBadge, { backgroundColor: accentColor }]}>
              <AntDesign name="camera" size={16} color={COLORS.neutral100} />
            </View>
          </TouchableOpacity>

          <Text style={[styles.username, { color: COLORS.primary }]}>{user.username}</Text>
          <Text style={styles.professionText}>{describeRole(user) || ROLE_LABEL.doctor}</Text>
        </View>


         {/* Compte et confidentialité (exigences Google Play : politique de
             confidentialité accessible, suppression de compte dans l'app) */}
         <Text style={styles.sectionLabel}>Compte et confidentialité</Text>
         <DiscoveryCard style={styles.accountCard}>
           {signedIn && (
             <>
               <View style={styles.linkRow}>
                 <Text style={[styles.linkText, { color: COLORS.neutral400 }]}>
                   Connectée avec
                 </Text>
                 <Text
                   style={[styles.linkValue, { color: COLORS.primary }]}
                   numberOfLines={1}
                 >
                   {sessionEmail}
                 </Text>
               </View>
               <View style={styles.divider} />
             </>
           )}

           <View style={styles.linkRow}>
             <View style={styles.lockLeft}>
               <Ionicons name="finger-print" size={20} color={accentColor} />
               <View style={{ flex: 1 }}>
                 <Text style={[styles.linkText, { color: COLORS.primary }]}>Verrouillage de l’app</Text>
                 <Text style={styles.lockHint}>Empreinte, visage ou schéma à l’ouverture</Text>
               </View>
             </View>
             <Switch
               value={!!appLockEnabled}
               onValueChange={handleAppLockToggle}
               trackColor={{ false: "#E0E0E0", true: accentColor }}
               thumbColor={COLORS.neutral100}
             />
           </View>
           <View style={styles.divider} />

           <TouchableOpacity
             onPress={() => navigation.navigate("settings/privacy")}
             style={styles.linkRow}
             activeOpacity={0.7}
           >
             <Text style={[styles.linkText, { color: COLORS.primary }]}>
               Politique de confidentialité
             </Text>
             <AntDesign name="right" size={16} color={COLORS.neutral400} />
           </TouchableOpacity>

           {signedIn && (
             <>
               <View style={styles.divider} />
               <TouchableOpacity
                 onPress={() => setConfirm("logout")}
                 style={styles.linkRow}
                 activeOpacity={0.7}
               >
                 <Text style={[styles.linkText, { color: COLORS.primary }]}>
                   Se déconnecter
                 </Text>
                 <Feather name="log-out" size={16} color={COLORS.neutral400} />
               </TouchableOpacity>

               <View style={styles.divider} />
               <TouchableOpacity
                 onPress={() => setConfirm("delete")}
                 style={styles.linkRow}
                 activeOpacity={0.7}
               >
                 <Text style={[styles.linkText, styles.dangerText]}>
                   Supprimer mon compte
                 </Text>
                 <Feather name="trash-2" size={16} color="#E24C6B" />
               </TouchableOpacity>
             </>
           )}
         </DiscoveryCard>
      </ScrollView>

      <ConfirmSheet
        visible={confirm === "logout"}
        icon="log-out-outline"
        title="Se déconnecter ?"
        message="Vous pourrez vous reconnecter à tout moment avec votre e-mail professionnel."
        confirmLabel="Se déconnecter"
        onConfirm={handleLogout}
        onCancel={() => setConfirm(null)}
      />

      <ConfirmSheet
        visible={confirm === "delete"}
        icon="trash-outline"
        danger
        title="Supprimer votre compte ?"
        message="Votre compte professionnel, vos réponses sur le forum et vos messages seront effacés définitivement."
        confirmLabel="Supprimer définitivement"
        loading={accountBusy}
        onConfirm={handleDeleteAccount}
        onCancel={() => setConfirm(null)}
      />

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 24,
  },
  profil: {
    alignItems: "center",
    paddingVertical: 28,
    marginTop: 16
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
    borderColor: "#F0F0F0",
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.accent500,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.neutral100,
  },
  username: {
    fontFamily: "Bold",
    fontSize: SIZES.medium + 2,
    color: "#433C47",
    marginTop: 14,
  },
  professionText: {
    fontFamily: "Regular",
    fontSize: SIZES.small,
    color: "#8E8793",
    marginTop: 2,
  },
  infoCard: {
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  infoIconWrapper: {
    width: 32,
    alignItems: "center",
  },
  infoLabel: {
    flex: 1,
    fontFamily: "Regular",
    fontSize: SIZES.small,
    marginLeft: 10,
  },
  infoValue: {
    fontFamily: "SBold",
    fontSize: SIZES.small,
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
  },
  linksCard: {
    marginTop: 20,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  linkText: {
    fontFamily: "Regular",
    fontSize: SIZES.small,
  },
  linkValue: {
    fontFamily: "SBold",
    fontSize: SIZES.small,
    flexShrink: 1,
    marginLeft: 12,
  },
  lockLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginRight: 10,
  },
  lockHint: {
    fontFamily: "Regular",
    fontSize: SIZES.small - 2,
    color: "#8E8793",
    marginTop: 2,
  },
  dangerText: {
    color: "#E24C6B",
    fontFamily: "SBold",
  },
  sectionLabel: {
    fontFamily: "SBold",
    fontSize: SIZES.small - 1,
    color: "#A9A4AE",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginTop: 28,
    marginBottom: 10,
    marginLeft: 4,
  },
  accountCard: {
    marginBottom: 8,
  },
});

export default AccountScreen;