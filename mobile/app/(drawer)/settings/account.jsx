import { handleHeaderScroll } from "@/hooks/useHeaderScroll";
import Avatar from "@/components/ui/Avatar";
import { DecorativeBlobs } from "@/components/ui";
import React, { useState } from "react";
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Switch,
} from "react-native";
import AppHeader, { HEADER_HEIGHT } from "@/components/AppHeader";
import { COLORS, SIZES } from "@/constants";
import { useNavigation } from "expo-router";
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
import { updateUserSqlite } from "@/services/database";
import {
  deleteAccount,
} from "@/services/api";
import ConfirmSheet from "@/components/ConfirmSheet";
import { describeRole, ROLE_LABEL } from "@/utils/roles";
import i18n from "@/constants/i18n";
import { persistLocalPhoto } from "@/utils/profilePhoto";
import { scheduleSync } from "@/services/sync";
import { formatDateFr } from "@/services/reminders";
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
        toast.warning(i18n.t("accountLockNeedsDeviceLock"));
        return;
      }
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: i18n.t("accountLockPrompt"),
        cancelLabel: i18n.t("annuler"),
      });
      if (result.success) updatePreference({ appLockEnabled: true });
    } catch (error) {
      console.error("Failed to enable app lock:", error);
      toast.error(i18n.t("accountLockFailed"));
    }
  };
  const navigation = useNavigation();
  const { surface, accentColor, accentContainer } = useDiscoveryTheme();
  const signedIn = useSelector(() => !!sessionState.token.get());
  const sessionEmail = useSelector(() => sessionState.user.get()?.email ?? "");

  // Confirmation en cours : "delete" | null
  const [confirm, setConfirm] = useState(null);
  const [accountBusy, setAccountBusy] = useState(false);

  const handleDeleteAccount = async () => {
    setAccountBusy(true);
    try {
      await deleteAccount();
      setConfirm(null);
      toast.success(i18n.t("accountDeleted"));
    } catch (error) {
      toast.error(error.message || i18n.t("accountDeleteFailed"));
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
        Alert.alert(i18n.t("accountPermissionDenied"), i18n.t("accountPhotoPermission"));
        return;
      }

      suspendAppLock();

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        // Local d'abord : la photo est enregistrée tout de suite sur le
        // téléphone ; la synchronisation l'envoie au serveur en arrière-plan
        // (et réessaie plus tard si le réseau manque).
        const profileImage = await persistLocalPhoto(result.assets[0].uri);
        updateUser({ ...user, profileImage }, { touch: true });
        await updateUserSqlite(
          user.id,
          user.username,
          user.profession,
          user.lastMenstruationDate,
          user.durationMenstruation,
          user.cycleDuration,
          user.email,
          profileImage
        );
        setProfileImage(profileImage);
        scheduleSync();
      }
    } catch (error) {
      console.error("Error picking image: ", error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: surface }]}>
      <DecorativeBlobs />
      <AppHeader
        navigation={navigation}
        title={i18n.t("accountAboutMe")}
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
            <Avatar
              uri={profileImage1}
              name={user?.username}
              size={120}
              borderWidth={2}
              borderColor={accentColor}
            />
            <View style={[styles.editBadge, { backgroundColor: accentColor }]}>
              <AntDesign name="camera" size={16} color={COLORS.neutral100} />
            </View>
          </TouchableOpacity>

          <Text style={[styles.username, { color: COLORS.primary }]}>{user.username}</Text>
          <Text style={styles.professionText}>{describeRole(user) || ROLE_LABEL.user}</Text>
        </View>


         {/* Infos cycle : une seule carte, lignes uniformes et action en pied */}
         <Text style={styles.sectionLabel}>{i18n.t("accountMyCycle")}</Text>
         <DiscoveryCard style={styles.infoCard}>
           {[
             { icon: "repeat-outline", label: i18n.t("accountCycleLength"), value: `${user.cycleDuration} ${i18n.t("jours")}` },
             { icon: "water-outline", label: i18n.t("accountPeriodLength"), value: `${user.durationMenstruation} ${i18n.t("jours")}` },
             {
               icon: "calendar-outline",
               label: i18n.t("accountLastPeriod"),
               // Lisible : « jeudi 1 octobre 2026 » plutôt que 2026-10-01.
               value: user.lastMenstruationDate
                 ? `${formatDateFr(user.lastMenstruationDate)} ${String(user.lastMenstruationDate).slice(0, 4)}`
                 : "—",
             },
           ].map((row, index) => (
             <View key={row.label}>
               {index > 0 && <View style={styles.divider} />}
               <View style={styles.infoRow}>
                 <View style={[styles.infoIconWrapper, { backgroundColor: accentContainer }]}>
                   <Ionicons name={row.icon} color={accentColor} size={18} />
                 </View>
                 <Text style={[styles.infoLabel, { color: COLORS.neutral400 }]}>{row.label}</Text>
                 <Text style={[styles.infoValue, { color: COLORS.primary }]} numberOfLines={1}>
                   {row.value}
                 </Text>
               </View>
             </View>
           ))}

           <TouchableOpacity
             onPress={() => navigation.navigate("settings/updatecycleinfo")}
             style={[styles.editCycleButton, { backgroundColor: accentContainer }]}
             activeOpacity={0.8}
           >
             <Ionicons name="create-outline" size={18} color={accentColor} />
             <Text style={[styles.editCycleText, { color: accentColor }]}>
               {i18n.t("accountEditCycle")}
             </Text>
             <Ionicons name="chevron-forward" size={16} color={accentColor} />
           </TouchableOpacity>
         </DiscoveryCard>

         {/* Compte et confidentialité (exigences Google Play : politique de
             confidentialité accessible, suppression de compte dans l'app) */}
         <Text style={styles.sectionLabel}>{i18n.t("accountAndSecurity")}</Text>
         <DiscoveryCard style={styles.accountCard}>
           {signedIn && (
             <>
               <View style={styles.linkRow}>
                 <Text style={[styles.linkText, { color: COLORS.neutral400 }]}>
                   {i18n.t("accountEmail")}
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
                 <Text style={[styles.linkText, { color: COLORS.primary }]}>{i18n.t("accountProtectApp")}</Text>
                 <Text style={styles.lockHint}>{i18n.t("accountProtectAppHint")}</Text>
               </View>
             </View>
             <Switch
               value={!!appLockEnabled}
               onValueChange={handleAppLockToggle}
               trackColor={{ false: "#E0E0E0", true: accentColor }}
               thumbColor={COLORS.neutral100}
             />
           </View>
           {/* La confidentialité et la déconnexion ne sont pas ici :
               la première est dans le menu Profil, la seconde est inutile
               (pas de mot de passe, la suppression de compte suffit). */}
           {signedIn && (
             <>
               <View style={styles.divider} />
               <TouchableOpacity
                 onPress={() => setConfirm("delete")}
                 style={styles.linkRow}
                 activeOpacity={0.7}
               >
                 <Text style={[styles.linkText, styles.dangerText]}>
                   {i18n.t("accountDeleteOnline")}
                 </Text>
                 <Feather name="trash-2" size={16} color="#E24C6B" />
               </TouchableOpacity>
             </>
           )}
         </DiscoveryCard>
      </ScrollView>

      <ConfirmSheet
        visible={confirm === "delete"}
        icon="trash-outline"
        danger
        title={i18n.t("accountDeleteTitle")}
        message={i18n.t("accountDeleteMessage")}
        confirmLabel={i18n.t("accountDeleteConfirm")}
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
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  infoLabel: {
    flex: 1,
    fontFamily: "Regular",
    fontSize: SIZES.small,
    marginLeft: 12,
  },
  infoValue: {
    fontFamily: "SBold",
    fontSize: SIZES.small,
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
  },
  editCycleButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 14,
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  editCycleText: {
    flex: 1,
    fontFamily: "SBold",
    fontSize: SIZES.small,
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