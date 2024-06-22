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
import { AntDesign, FontAwesome } from "@expo/vector-icons";
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
      userState.set((prev) => ({ ...prev, profileImage:result.assets[0].uri}));
      setProfileImage(result.assets[0].uri);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: COLORS.neutral100,
        justifyContent: "center",
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
          <TouchableOpacity
            className=" w-[150] h-[150] rounded-full relative"
            onPress={handleProfileImageChange}
          >
            <Image
              source={profileImage ? { uri: profileImage } : images.doctor01}
              style={{ height: 150, width: 150, borderRadius: 150 }}
            />

            <AntDesign
              name="camera"
              size={30}
              style={{
                display: "absolute",
                top: -45,
                right: -100,
                backgroundColor: "white",
                borderRadius: 100,
                padding: 10,
                width: 50,
              }}
              color={COLORS.accent600}
            />
          </TouchableOpacity>
          <View className="p-2 flex-row space-x-3 mt-3">
            <Text className="font-bold text-[18px]">{user.username}</Text>
            <TouchableOpacity onPress={() => handleEditPress("username")}>
              <AntDesign name="edit" size={24} />
            </TouchableOpacity>
          </View>
        </View>
        <View className="mt-10 py-5 ">
          <View className="p-2 flex-row justify-between">
            <View className="flex-row items-center space-x-2">
              <FontAwesome name="calendar" color={"green"} size={30} />
              <Text className="text-[18]">Durée du cycle :</Text>
              <Text className="font-bold text-[18]">
                {user.cycleDuration} jours
              </Text>
            </View>
          </View>
          <View className="p-2 flex-row justify-between">
            <View className="flex-row items-center space-x-2">
              <FontAwesome name="calendar-check-o" color={"green"} size={30} />
              <Text className="text-[18]">Durée des règles :</Text>
              <Text className="font-bold text-[18]">
                {user.durationMenstruation} jours
              </Text>
            </View>
          </View>
          <View className="p-2 flex-row justify-between">
            <View className="flex-row items-center space-x-2">
              <FontAwesome name="calendar-plus-o" color={"green"} size={30} />
              <Text className="text-[18]">Premier jour du dernier cycle :</Text>
              <Text className="font-bold text-[18]">
                {user.lastMenstruationDate}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={{ backgroundColor: COLORS.accent500 }}
            onPress={()=>{
              navigation.navigate("settings/updatecycleinfo")
            }}
            className="p-3 rounded-md mx-2 mt-5 shadow-md shadow-black flex-row justify-center space-x-2 items-center"
          >
            <Text className="text-white">
              Modifier les informations du cycles
            </Text>
            {/* <AntDesign name="right" size={20} color="white" className="ml-3" /> */}
          </TouchableOpacity>
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
            <View className="flex-row space-x-2 justify-between w-full  mt-3">
              <Button
                title="Enregistrer"
                onPress={handleSave}
                color={COLORS.accent600}
              />
              <Button
                title="Annuler"
                onPress={() => setIsModalVisible(false)}
              />
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
    paddingHorizontal: 10,
    paddingTop: 120,
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
