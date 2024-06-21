import React, { useState, useCallback, useContext } from "react";
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  FlatList,
  Modal,
  Button,
} from "react-native";
import HeaderWithGoBack from "@/components/header-with-go-back";
import { COLORS, SIZES, images, icons } from "@/constants";
import { useNavigation } from "expo-router";
import { preferenceState, userState } from "@/legendstate/AmpelaStates";
import { useSelector } from "@legendapp/state/react";
import { AntDesign } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import BackgroundService from "react-native-background-actions";
import * as TaskManager from "expo-task-manager";
import * as BackgroundFetch from "expo-background-fetch";

TaskManager.defineTask("BACKGROUND_FETCH_TASK", async () => {
  try {
    console.log("data");
    return BackgroundFetch.Result.NewData;
  } catch (error) {
    return BackgroundFetch.Result.Failed;
  }
});

const registerBackgroundFetch = async () => {
  await BackgroundFetch.registerTaskAsync("BACKGROUND_FETCH_TASK", {
    minimumInterval: 60, // Fetch interval in seconds
    stopOnTerminate: false,
    startOnBoot: true,
  });
};

registerBackgroundFetch();

const AccountScreen = () => {
  const { theme } = useSelector(() => preferenceState.get());
  const user = useSelector(() => userState.get());
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
  const [profileImage, setProfileImage] = useState(user.profileImage);
  const navigation = useNavigation();

  const sleep = (time) => new Promise(() => setTimeout(() => resolve(), time));
  const veryIntensiveTask = async (taskDataArguments) => {
    const { delay } = taskDataArguments;
    await new Promise(async (resolve) => {
      for (let i = 0; BackgroundService.isRunning(); i++) {
        console.log(i);
        await sleep(delay);
      }
    });
  };

  const options = {
    taskName: "Ampela",
    taskTitle: "Date d'ovulation",
    taskDesc: "Votre prochaine dat ed'ovulation sera le 20 octobre 2002",

    color: "#ff00ff",
    parameters: {
      delay: 1000,
    },
  };

  const handleEditPress = async (field) => {
    setCurrentField(field);
    setIsModalVisible(true);

    //  await BackgroundService.start(veryIntensiveTask,options);
  };

  const handleSave = () => {
    if (currentField === "username") {
      userState.set((prev) => ({ ...prev, username }));
    } else if (currentField === "cycleDuration") {
      userState.set((prev) => ({ ...prev, cycleDuration }));
    } else if (currentField === "durationMenstruation") {
      userState.set((prev) => ({ ...prev, durationMenstruation }));
    } else if (currentField === "lastMenstruationDate") {
      userState.set((prev) => ({ ...prev, lastMenstruationDate }));
    }
    setIsModalVisible(false);
  };

  const handleProfileImageChange = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      // userState.set((prev) => ({ ...prev, profileImage: result.uri }));
      setProfileImage(result.assets[0].uri);
    }
  };

  // const startBackgroundService = async () => {
  //   const options = {
  //     taskName: 'MyTask',
  //     taskTitle: 'My Task Running',
  //     taskDesc: 'Description of the task',

  //   };

  //   try {
  //     await BackgroundService.start(() => console.log('Task started'), options);
  //   } catch (error) {
  //     console.error('Error starting background service:', error);
  //   }
  // };

  // startBackgroundService();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: COLORS.neutral100,
      }}
    >
      <HeaderWithGoBack title="Apropos de moi" navigation={navigation} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={[
          styles.container,
          {
            backgroundColor:
              theme === "pink" ? COLORS.neutral200 : COLORS.neutral100,
          },
        ]}
      >
        <View style={styles.profil}>
          <Image
            source={profileImage ? { uri: profileImage } : images.doctor01}
            style={{ height: 150, width: 150, borderRadius: 150 }}
          />
          <TouchableOpacity
            style={styles.flex}
            onPress={handleProfileImageChange}
          >
            <Text
              style={[
                styles.uploadImgText,
                {
                  color: theme === "pink" ? COLORS.accent600 : COLORS.accent800,
                },
              ]}
            >
              Changer la photo
            </Text>
            <Image
              source={
                theme === "pink" ? icons.uploadIcon : icons.uploadOrangeIcon
              }
              style={styles.uploadImg}
            />
          </TouchableOpacity>
        </View>
        <View className="mt-10 ">
          <View className="p-2 flex-row space-x-3 mt-3">
            <Text>Pseudo :</Text>
            <Text className="font-bold">{user.username}</Text>
            <TouchableOpacity onPress={() => handleEditPress("username")}>
              <AntDesign name="edit" size={20} />
            </TouchableOpacity>
          </View>
          <View className="p-2 flex-row space-x-3">
            <Text>Duree du cycle :</Text>
            <Text className="font-bold">{user.cycleDuration} jours </Text>
            <TouchableOpacity onPress={() => handleEditPress("cycleDuration")}>
              <AntDesign name="edit" size={20} />
            </TouchableOpacity>
          </View>
          <View className="p-2 flex-row space-x-3">
            <Text>Duree du regle :</Text>
            <Text className="font-bold">{user.durationMenstruation} jours</Text>
            <TouchableOpacity
              onPress={() => handleEditPress("durationMenstruation")}
            >
              <AntDesign name="edit" size={20} />
            </TouchableOpacity>
          </View>
          <View className="p-2 flex-row space-x-3">
            <Text>Premier jour du dernier cycle :</Text>
            <Text className="font-bold">{user.lastMenstruationDate}</Text>
            <TouchableOpacity
              onPress={() => handleEditPress("lastMenstruationDate")}
            >
              <AntDesign name="edit" size={20} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.input}
              value={
                currentField === "username"
                  ? username
                  : currentField === "cycleDuration"
                  ? String(cycleDuration)
                  : currentField === "durationMenstruation"
                  ? String(durationMenstruation)
                  : lastMenstruationDate
              }
              onChangeText={(text) => {
                if (currentField === "username") {
                  setUsername(text);
                } else if (currentField === "cycleDuration") {
                  setCycleDuration(Number(text));
                } else if (currentField === "durationMenstruation") {
                  setDurationMenstruation(Number(text));
                } else if (currentField === "lastMenstruationDate") {
                  setLastMenstruationDate(text);
                }
              }}
              keyboardType={
                currentField === "cycleDuration" ||
                currentField === "durationMenstruation"
                  ? "numeric"
                  : "default"
              }
              placeholder={
                currentField === "username"
                  ? "Entrez votre pseudo"
                  : currentField === "cycleDuration"
                  ? "Entrez la durée du cycle"
                  : currentField === "durationMenstruation"
                  ? "Entrez la durée de la menstruation"
                  : "Entrez la date du dernier cycle"
              }
            />
            <Button title="Enregistrer" onPress={handleSave} />
            <Button title="Annuler" onPress={() => setIsModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profil: {
    alignItems: "center",
    gap: 15,
    paddingVertical: 30,
  },
  uploadImgText: {
    fontFamily: "Regular",
    fontSize: SIZES.small,
  },
  flex: {
    display: "flex",
    flexDirection: "row",
    gap: 10,
  },
  uploadImg: {
    width: 20,
    height: 20,
  },
  inputContainer: {
    gap: 10,
    marginBottom: 20,
  },
  input: {
    fontFamily: "Regular",
    width: "100%",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.neutral100,
  },
  saveBtn: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 100,
    alignSelf: "flex-end",
  },
  title: {
    fontFamily: "SBold",
    fontSize: SIZES.xLarge,
    marginBottom: 15,
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  },
});

export default AccountScreen;
