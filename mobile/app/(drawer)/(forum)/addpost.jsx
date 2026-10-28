import React, { useState } from "react";
import i18n from "@/constants/i18n";
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
import { SIZES } from "@/constants";
import { HEADER_HEIGHT } from "@/components/AppHeader";
import { handleHeaderScroll } from "@/hooks/useHeaderScroll";
import { useDiscoveryTheme } from "@/components/discovery";
import DiscoveryCard from "@/components/discovery/DiscoveryCard";
import { Input, PrimaryButton, DecorativeBlobs, toast } from "@/components/ui";
import { createPost } from "@/services/forumAPI";
import { uploadImage } from "@/services/api";
import { suspendAppLock } from "@/components/AppLockGate";

const TITLE_MAX = 80;
const DESCRIPTION_MAX = 600;

const AddPost = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const { surface, accentColor, accentContainer } = useDiscoveryTheme();

  const canPublish = !!title.trim() && !!description.trim() && !loading;

  const selectPhoto = async () => {
    suspendAppLock();
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  const submitPost = async () => {
    setLoading(true);
    try {
      // L'image locale est d'abord envoyée au serveur pour que les autres
      // membres puissent la voir.
      let photoUrl = null;
      if (photo) {
        try {
          photoUrl = await uploadImage(photo);
        } catch (error) {
          console.error("Photo upload failed: ", error);
          toast.error(i18n.t("forumPhotoUploadFailed"));
          return;
        }
      }
      await createPost({ title: title.trim(), description: description.trim(), photos: photoUrl });
      toast.success(i18n.t("forumQuestionPublished"));
      navigation.goBack();
    } catch (error) {
      console.error("Error creating post: ", error);
      toast.error(error.message || i18n.t("forumPublishFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: surface }]}>
      <DecorativeBlobs />
      <KeyboardAvoidingView style={styles.container} behavior="padding">
        <ScrollView
          onScroll={handleHeaderScroll}
          scrollEventThrottle={16}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Rappel du cadre : anonymat et bienveillance */}
          <DiscoveryCard style={styles.introCard} color={accentContainer} elevated={false}>
            <View style={[styles.introIcon, { backgroundColor: "#FFFFFF" }]}>
              <Ionicons name="people-outline" size={20} color={accentColor} />
            </View>
            <Text style={styles.introText}>{i18n.t("forumAskIntro")}</Text>
          </DiscoveryCard>

          <DiscoveryCard style={styles.formCard}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>{i18n.t("forumTitleLabel")}</Text>
              <Text style={styles.counter}>
                {title.length}/{TITLE_MAX}
              </Text>
            </View>
            <Input
              value={title}
              onChangeText={setTitle}
              placeholder={i18n.t("forumTitlePlaceholder")}
              maxLength={TITLE_MAX}
              editable={!loading}
              containerStyle={styles.field}
            />

            <View style={styles.labelRow}>
              <Text style={styles.label}>{i18n.t("forumDescriptionLabel")}</Text>
              <Text style={styles.counter}>
                {description.length}/{DESCRIPTION_MAX}
              </Text>
            </View>
            <Input
              value={description}
              onChangeText={setDescription}
              placeholder={i18n.t("forumDescriptionPlaceholder")}
              multiline
              maxLength={DESCRIPTION_MAX}
              editable={!loading}
              containerStyle={styles.field}
              inputStyle={styles.multilineInput}
            />

            <Text style={styles.label}>{i18n.t("forumPhotoOptional")}</Text>
            {photo ? (
              <View style={styles.photoWrapper}>
                <Image source={{ uri: photo }} style={styles.photo} />
                <View style={styles.photoActions}>
                  <TouchableOpacity
                    onPress={selectPhoto}
                    disabled={loading}
                    style={[styles.photoChip, { backgroundColor: accentContainer }]}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="swap-horizontal" size={16} color={accentColor} />
                    <Text style={[styles.photoChipText, { color: accentColor }]}>{i18n.t("forumPhotoChange")}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setPhoto(null)}
                    disabled={loading}
                    style={[styles.photoChip, { backgroundColor: "#FFECEE" }]}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="trash-outline" size={16} color="#E24C6B" />
                    <Text style={[styles.photoChipText, { color: "#E24C6B" }]}>{i18n.t("forumPhotoRemove")}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                onPress={selectPhoto}
                disabled={loading}
                activeOpacity={0.8}
                style={[styles.photoPicker, { borderColor: accentColor, backgroundColor: accentContainer }]}
              >
                <Ionicons name="image-outline" size={26} color={accentColor} />
                <Text style={[styles.photoPickerText, { color: accentColor }]}>
                  {i18n.t("forumPhotoAdd")}
                </Text>
                <Text style={styles.photoPickerHint}>{i18n.t("forumPhotoHint")}</Text>
              </TouchableOpacity>
            )}
          </DiscoveryCard>
        </ScrollView>

        {/* Action principale toujours visible en bas */}
        <View style={styles.footer}>
          <PrimaryButton
            title={i18n.t("forumPublish")}
            onPress={submitPost}
            disabled={!canPublish}
            loading={loading}
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
  introCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
  },
  introIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  introText: {
    flex: 1,
    fontFamily: "Regular",
    fontSize: SIZES.small,
    lineHeight: 19,
    color: "#5A525F",
  },
  formCard: {
    marginTop: 16,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginRight: 4,
  },
  label: {
    fontFamily: "SBold",
    fontSize: SIZES.small,
    color: "#5A525F",
    marginBottom: 8,
    marginLeft: 4,
  },
  counter: {
    fontFamily: "Regular",
    fontSize: SIZES.small - 2,
    color: "#A9A4AE",
    marginBottom: 8,
  },
  field: {
    marginBottom: 18,
  },
  multilineInput: {
    minHeight: 140,
  },
  photoPicker: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderRadius: 18,
    paddingVertical: 22,
    alignItems: "center",
    gap: 6,
  },
  photoPickerText: {
    fontFamily: "SBold",
    fontSize: SIZES.small,
  },
  photoPickerHint: {
    fontFamily: "Regular",
    fontSize: SIZES.small - 2,
    color: "#A9A4AE",
  },
  photoWrapper: {
    gap: 10,
  },
  photo: {
    width: "100%",
    aspectRatio: 4 / 3,
    borderRadius: 18,
  },
  photoActions: {
    flexDirection: "row",
    gap: 10,
  },
  photoChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  photoChipText: {
    fontFamily: "SBold",
    fontSize: SIZES.small,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
});

export default AddPost;
