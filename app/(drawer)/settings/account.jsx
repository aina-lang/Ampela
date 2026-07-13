import React, { useState } from "react";
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import AppHeader from "@/components/AppHeader";
import { COLORS, SIZES, images } from "@/constants";
import { useNavigation } from "expo-router";
import { updateUser, userState, preferenceState } from "@/legendstate/AmpelaStates";
import { useSelector } from "@legendapp/state/react";
import { AntDesign, Feather, FontAwesome } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { updateUserSqlite } from "@/services/database";
import { useDiscoveryTheme } from "@/components/discovery";
import DiscoveryCard from "@/components/discovery/DiscoveryCard";
import DiscoveryInput from "@/components/discovery/DiscoveryInput";
import ModernButton from "@/components/ModernButton";

const fieldConfig = {
  username: {
    label: "Pseudo",
    placeholder: "Entrez votre pseudo",
    keyboardType: "default",
  },
  cycleDuration: {
    label: "Durée du cycle",
    placeholder: "Entrez la durée du cycle",
    keyboardType: "numeric",
  },
  durationMenstruation: {
    label: "Durée des règles",
    placeholder: "Entrez la durée des règles",
    keyboardType: "numeric",
  },
  lastMenstruationDate: {
    label: "Dernier cycle",
    placeholder: "AAAA-MM-JJ",
    keyboardType: "default",
  },
};

const AccountScreen = () => {
  const user = useSelector(() => userState.get());
  const { theme } = useSelector(() => preferenceState.get());
  const navigation = useNavigation();
  const { surface, accentColor, accentColorDisabled } = useDiscoveryTheme();

  const [username, setUsername] = useState(user.username);
  const [cycleDuration, setCycleDuration] = useState(user.cycleDuration);
  const [durationMenstruation, setDurationMenstruation] = useState(
    user.durationMenstruation
  );
  const [lastMenstruationDate, setLastMenstruationDate] = useState(
    user.lastMenstruationDate
  );
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentField, setCurrentField] = useState(null);
  const [profileImage1, setProfileImage] = useState(user.profileImage);

  const fieldValues = {
    username,
    cycleDuration,
    durationMenstruation,
    lastMenstruationDate,
  };
  const fieldSetters = {
    username: setUsername,
    cycleDuration: (v) => setCycleDuration(Number(v)),
    durationMenstruation: (v) => setDurationMenstruation(Number(v)),
    lastMenstruationDate: setLastMenstruationDate,
  };

  const handleEditPress = (field) => {
    setCurrentField(field);
    setIsModalVisible(true);
  };

  const handleSave = () => {
    if (!currentField) return;
    userState.set((prev) => ({
      ...prev,
      [currentField]: fieldValues[currentField],
    }));
    setIsModalVisible(false);
  };

  const handleProfileImageChange = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission refusée",
          "Nous avons besoin d'accéder à vos photos pour changer l'avatar."
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
        const profileImage = result.assets[0].uri;
        updateUser({ ...user, profileImage });
        await updateUserSqlite(
          user.id,
          user.username,
          user.password,
          user.profession,
          user.lastMenstruationDate,
          user.durationMenstruation,
          user.cycleDuration,
          user.email,
          profileImage
        );
        setProfileImage(profileImage);
      }
    } catch (error) {
      console.error("Error picking image: ", error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: surface }]}>
      <AppHeader navigation={navigation} title="À propos de moi" showBack absolute />

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={{ paddingTop: 200, paddingBottom: 40 }}
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

          <View style={styles.usernameRow}>
            <Text style={[styles.username, { color: COLORS.primary }]}>{user.username}</Text>
            <TouchableOpacity onPress={() => handleEditPress("username")}>
              <Feather name="edit-2" size={18} color={accentColor} />
            </TouchableOpacity>
          </View>
        </View>

         {/* Infos cycle */}
         <DiscoveryCard style={styles.infoCard}>
           <View style={styles.infoRow}>
             <View style={styles.infoIconWrapper}>
               <FontAwesome name="calendar" color={accentColor} size={18} />
             </View>
             <Text style={[styles.infoLabel, { color: COLORS.neutral400 }]}>Durée du cycle</Text>
             <Text style={[styles.infoValue, { color: COLORS.primary }]}>{user.cycleDuration} jours</Text>
           </View>

           <View style={styles.divider} />

           <View style={styles.infoRow}>
             <View style={styles.infoIconWrapper}>
               <FontAwesome name="calendar-check-o" color={accentColor} size={18} />
             </View>
             <Text style={[styles.infoLabel, { color: COLORS.neutral400 }]}>Durée des règles</Text>
             <Text style={[styles.infoValue, { color: COLORS.primary }]}>
               {user.durationMenstruation} jours
             </Text>
           </View>

           <View style={styles.divider} />

           <View style={styles.infoRow}>
             <View style={styles.infoIconWrapper}>
               <FontAwesome name="calendar-plus-o" color={accentColor} size={18} />
             </View>
             <Text style={[styles.infoLabel, { color: COLORS.neutral400 }]}>Dernier cycle</Text>
             <Text style={[styles.infoValue, { color: COLORS.primary }]}>{user.lastMenstruationDate}</Text>
           </View>
         </DiscoveryCard>

         {/* Liens */}
         <DiscoveryCard style={styles.linksCard}>
           <TouchableOpacity
             onPress={() => navigation.navigate("settings/updatecycleinfo")}
             style={styles.linkRow}
             activeOpacity={0.7}
           >
             <Text style={[styles.linkText, { color: COLORS.primary }]}>
               Modifier les informations du cycle
             </Text>
             <AntDesign name="right" size={16} color={COLORS.neutral400} />
           </TouchableOpacity>

           <View style={styles.divider} />

           <TouchableOpacity
             onPress={() => navigation.navigate("settings/changepassword")}
             style={styles.linkRow}
             activeOpacity={0.7}
           >
             <Text style={[styles.linkText, { color: COLORS.primary }]}>Changer mon mot de passe</Text>
             <AntDesign name="right" size={16} color={COLORS.neutral400} />
           </TouchableOpacity>
         </DiscoveryCard>
      </ScrollView>

      {/* Modal d'édition */}
      <Modal
        visible={isModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <DiscoveryCard style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {currentField ? fieldConfig[currentField]?.label : ""}
            </Text>

            <DiscoveryInput
              value={currentField ? String(fieldValues[currentField] ?? "") : ""}
              onChangeText={(text) => fieldSetters[currentField]?.(text)}
              keyboardType={currentField ? fieldConfig[currentField].keyboardType : "default"}
              placeholder={currentField ? fieldConfig[currentField].placeholder : ""}
              backgroundColor={COLORS.neutral100}
              borderColor={accentColor}
              containerStyle={styles.inputSpacing}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <ModernButton
                title="Enregistrer"
                onPress={handleSave}
                accentColor={accentColor}
                accentColorDisabled={accentColorDisabled}
                style={{ flex: 1 }}
              />
            </View>
          </DiscoveryCard>
        </View>
      </Modal>
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
  usernameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 14,
  },
  username: {
    fontFamily: "Bold",
    fontSize: SIZES.medium + 2,
    color: "#1A1A1A",
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 24,
  },
  modalContent: {
    width: "100%",
    padding: 24,
  },
  modalTitle: {
    fontFamily: "Bold",
    fontSize: SIZES.medium,
    color: "#1A1A1A",
    marginBottom: 16,
    textAlign: "center",
  },
  inputSpacing: {
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: "#EFEFEF",
  },
  cancelButtonText: {
    fontFamily: "SBold",
    fontSize: SIZES.small,
    color: "#7A7A7A",
  },
});

export default AccountScreen;