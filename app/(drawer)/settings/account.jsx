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
import HeaderWithGoBack from "@/components/header-with-go-back";
import { COLORS, SIZES, images } from "@/constants";
import { useNavigation } from "expo-router";
import { updateUser, userState } from "@/legendstate/AmpelaStates";
import { useSelector } from "@legendapp/state/react";
import { AntDesign, Feather, FontAwesome } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { updateUserSqlite } from "@/services/database";

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
  const navigation = useNavigation();

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
    <View style={styles.container}>
      <HeaderWithGoBack title="À propos de moi" navigation={navigation} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 40 }}
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
              style={styles.avatar}
            />
            <View style={styles.editBadge}>
              <AntDesign name="camera" size={16} color={COLORS.neutral100} />
            </View>
          </TouchableOpacity>

          <View style={styles.usernameRow}>
            <Text style={styles.username}>{user.username}</Text>
            <TouchableOpacity onPress={() => handleEditPress("username")}>
              <Feather name="edit-2" size={18} color="#FF7575" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Infos cycle */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoIconWrapper}>
              <FontAwesome name="calendar" color="#FF7575" size={18} />
            </View>
            <Text style={styles.infoLabel}>Durée du cycle</Text>
            <Text style={styles.infoValue}>{user.cycleDuration} jours</Text>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIconWrapper}>
              <FontAwesome name="calendar-check-o" color="#FF7575" size={18} />
            </View>
            <Text style={styles.infoLabel}>Durée des règles</Text>
            <Text style={styles.infoValue}>
              {user.durationMenstruation} jours
            </Text>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIconWrapper}>
              <FontAwesome name="calendar-plus-o" color="#FF7575" size={18} />
            </View>
            <Text style={styles.infoLabel}>Dernier cycle</Text>
            <Text style={styles.infoValue}>{user.lastMenstruationDate}</Text>
          </View>
        </View>

        {/* Liens */}
        <View style={styles.linksCard}>
          <TouchableOpacity
            onPress={() => navigation.navigate("settings/updatecycleinfo")}
            style={styles.linkRow}
            activeOpacity={0.7}
          >
            <Text style={styles.linkText}>
              Modifier les informations du cycle
            </Text>
            <AntDesign name="right" size={16} color="#B0B0B0" />
          </TouchableOpacity>

          <View style={styles.infoDivider} />

          <TouchableOpacity
            onPress={() => navigation.navigate("settings/changepassword")}
            style={styles.linkRow}
            activeOpacity={0.7}
          >
            <Text style={styles.linkText}>Changer mon mot de passe</Text>
            <AntDesign name="right" size={16} color="#B0B0B0" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal d'édition */}
      <Modal
        visible={isModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {currentField ? fieldConfig[currentField]?.label : ""}
            </Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={
                  currentField
                    ? String(fieldValues[currentField] ?? "")
                    : ""
                }
                onChangeText={(text) => fieldSetters[currentField]?.(text)}
                keyboardType={
                  currentField ? fieldConfig[currentField].keyboardType : "default"
                }
                placeholder={
                  currentField ? fieldConfig[currentField].placeholder : ""
                }
                placeholderTextColor="#A0A0A0"
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                style={styles.confirmButton}
                activeOpacity={0.85}
              >
                <Text style={styles.confirmButtonText}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral100,
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profil: {
    alignItems: "center",
    paddingVertical: 28,
    marginTop:150
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
    borderColor: "#FF7575",
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FF7575",
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
    backgroundColor: "#FAFAFA",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    paddingHorizontal: 16,
    marginTop: 8,
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
    color: "#7A7A7A",
    marginLeft: 10,
  },
  infoValue: {
    fontFamily: "SBold",
    fontSize: SIZES.small,
    color: "#1A1A1A",
  },
  infoDivider: {
    height: 1,
    backgroundColor: "#F0F0F0",
  },
  linksCard: {
    backgroundColor: "#FAFAFA",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    paddingHorizontal: 16,
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
    color: "#1A1A1A",
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
    backgroundColor: COLORS.neutral100,
    borderRadius: 20,
  },
  modalTitle: {
    fontFamily: "Bold",
    fontSize: SIZES.medium,
    color: "#1A1A1A",
    marginBottom: 16,
    textAlign: "center",
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
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: "#FF7575",
    shadowColor: "#FF7575",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  confirmButtonText: {
    fontFamily: "SBold",
    fontSize: SIZES.small,
    color: COLORS.neutral100,
  },
});

export default AccountScreen;