import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { SIZES, images } from "@/constants";
import { PrimaryButton, Input, DecorativeBlobs, toast } from "@/components/ui";
import { MeshBackground, DiscoveryHeader, useDiscoveryTheme } from "@/components/discovery";
import { uploadImage } from "@/services/api";
import { registerDoctor } from "@/services/otpAuth";
import { suspendAppLock } from "@/components/AppLockGate";

/**
 * Activation de l'accès professionnel : code d'invitation + profil (nom
 * affiché, spécialité, photo, informations de vérification). Le serveur
 * accorde le rôle « doctor » vérifié en consommant l'invitation.
 */
const DoctorProfile = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { accentColor, accentContainer, surface } = useDiscoveryTheme();

  const [code, setCode] = useState("");
  const [username, setUsername] = useState("");
  const [profession, setProfession] = useState("");
  const [fullName, setFullName] = useState("");
  const [institution, setInstitution] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const pickImage = async () => {
    suspendAppLock();
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      toast.warning("Autorisez l'accès aux photos pour ajouter votre portrait.");
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
      toast.error(error.message || "Envoi de la photo impossible.");
    } finally {
      setUploading(false);
    }
  };

  const canSave = code.trim().length >= 4 && !!username.trim() && !!profession.trim();

  const save = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      await registerDoctor({
        code: code.trim(),
        username: username.trim(),
        profession: profession.trim(),
        fullName: fullName.trim(),
        institution: institution.trim(),
        licenseNumber: licenseNumber.trim(),
        profileImage,
      });
      toast.success("Accès professionnel activé. Bienvenue !");
      router.replace("/(drawer)/(main)");
    } catch (error) {
      toast.error(error.message || "Impossible d'enregistrer le profil.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: surface }]}>
      <MeshBackground color={accentColor} surfaceColor={surface} />
      <DecorativeBlobs />
      <KeyboardAvoidingView behavior="padding" style={styles.container}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <DiscoveryHeader
            eyebrow="Votre profil"
            title="Activez votre accès"
            subtitle="Saisissez le code d'invitation reçu de l'équipe Ampela, puis présentez-vous : votre nom affiché et votre spécialité apparaîtront auprès des utilisatrices avec la mention « Professionnelle de santé »."
            accentColor={accentColor}
          />

          <View style={styles.centerZone}>
            <View style={styles.formCard}>
              <View style={styles.avatarSection}>
                <TouchableOpacity onPress={pickImage} activeOpacity={0.85} disabled={uploading} style={styles.avatarWrapper}>
                  <View style={[styles.avatarRing, { backgroundColor: accentContainer }]}>
                    {profileImage ? (
                      <Image source={{ uri: profileImage }} style={styles.avatar} />
                    ) : (
                      <Image source={images.doctor01} style={styles.avatar} />
                    )}
                  </View>
                  <View style={[styles.editBadge, { backgroundColor: accentColor }]}>
                    <Ionicons name="camera" size={14} color="#FFFFFF" />
                  </View>
                </TouchableOpacity>
                <Text style={styles.avatarHint}>
                  {uploading ? "Envoi de la photo…" : "Photo de profil (optionnel)"}
                </Text>
              </View>

              <Text style={styles.label}>Code d’invitation</Text>
              <Input
                icon={<Ionicons name="key-outline" size={20} color="#A9A4AE" />}
                placeholder="Ex : AMPELA2345"
                value={code}
                onChangeText={(t) => setCode(t.toUpperCase())}
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={32}
                editable={!saving}
                containerStyle={styles.field}
              />
              <Text style={styles.label}>Nom affiché</Text>
              <Input
                icon={<Ionicons name="person-outline" size={20} color="#A9A4AE" />}
                placeholder="Ex : Dr Nirina"
                value={username}
                onChangeText={setUsername}
                maxLength={40}
                editable={!saving}
                containerStyle={styles.field}
              />
              <Text style={styles.label}>Spécialité</Text>
              <Input
                icon={<Ionicons name="medkit-outline" size={20} color="#A9A4AE" />}
                placeholder="Ex : Sage-femme, Gynécologue, Infirmière…"
                value={profession}
                onChangeText={setProfession}
                maxLength={60}
                editable={!saving}
                containerStyle={styles.field}
              />

              <Text style={styles.sectionHint}>Informations professionnelles (optionnel, pour la vérification)</Text>
              <Input
                icon={<Ionicons name="id-card-outline" size={20} color="#A9A4AE" />}
                placeholder="Nom complet"
                value={fullName}
                onChangeText={setFullName}
                maxLength={120}
                editable={!saving}
                containerStyle={styles.field}
              />
              <Input
                icon={<Ionicons name="business-outline" size={20} color="#A9A4AE" />}
                placeholder="Établissement (CSB, clinique, cabinet…)"
                value={institution}
                onChangeText={setInstitution}
                maxLength={160}
                editable={!saving}
                containerStyle={styles.field}
              />
              <Input
                icon={<Ionicons name="ribbon-outline" size={20} color="#A9A4AE" />}
                placeholder="Numéro d'ordre (si applicable)"
                value={licenseNumber}
                onChangeText={setLicenseNumber}
                maxLength={80}
                editable={!saving}
                containerStyle={styles.field}
              />

              <PrimaryButton
                title="Activer mon accès"
                onPress={save}
                disabled={!canSave || saving || uploading}
                loading={saving}
                style={{ marginTop: 8 }}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  centerZone: {
    flex: 1,
    justifyContent: "center",
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 22,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 18,
  },
  avatarWrapper: {
    width: 108,
    height: 108,
  },
  avatarRing: {
    width: 108,
    height: 108,
    borderRadius: 54,
    padding: 4,
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 50,
  },
  editBadge: {
    position: "absolute",
    right: 2,
    bottom: 2,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  avatarHint: {
    fontFamily: "Regular",
    fontSize: SIZES.small - 1,
    color: "#8E8793",
    marginTop: 8,
  },
  label: {
    fontFamily: "SBold",
    fontSize: SIZES.small,
    color: "#5A525F",
    marginBottom: 8,
    marginLeft: 4,
  },
  field: {
    marginBottom: 16,
  },
  sectionHint: {
    fontFamily: "Regular",
    fontSize: SIZES.small - 1,
    color: "#8E8793",
    marginTop: 4,
    marginBottom: 10,
    marginLeft: 4,
  },
});

export default DoctorProfile;
