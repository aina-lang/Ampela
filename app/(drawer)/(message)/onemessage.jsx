import OptionMenu from "@/components/OptionMenu";
import { COLORS, SIZES } from "@/constants";
import { useAuth } from "@/hooks/AuthContext";
import { preferenceState } from "@/legendstate/AmpelaStates";
import { database } from "@/services/firebaseConfig";
import { Feather, Ionicons } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useSelector } from "@legendapp/state/react";
import { useRoute } from "@react-navigation/native";
import { router, useNavigation } from "expo-router";
import {
  Timestamp,
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
} from "firebase/firestore";
import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import {
  Bubble,
  GiftedChat,
  InputToolbar,
  Send,
} from "react-native-gifted-chat";

export default function OneMessageScreen() {
  const [messages, setMessages] = useState([]);
  const navigation = useNavigation();
  const { theme } = useSelector(() => preferenceState.get());
  const route = useRoute();
  const { target } = route?.params;
  const { user, userProfile } = useAuth();
  const menuItems = [
    {
      title: "Settings",
      action: () => console.log("Navigate to Settings"),
    },
    {
      title: "Other Option",
      action: () => console.log("Handle Other Option"),
    },
    {
      title: "Another Option",
      action: () => console.log("Handle Another Option"),
    },
  ];
  useEffect(() => {
    createRoomIfNotExists();
    const roomId = getRoomId(user?.uid, target?.id);
    const docRef = doc(database, "rooms", roomId);
    const messagesRef = collection(docRef, "messages");
    const q = query(messagesRef, orderBy("createdAt", "desc"));

    const unsub = onSnapshot(q, (snapshot) => {
      const allMessages = snapshot.docs.map((doc) => {
        const data = doc.data();
        if (data.createdAt) {
          const date = data.createdAt.toDate();
          data.createdAt = date.toISOString();
        }
        return data;
      });
      setMessages(allMessages);
    });

    return unsub;
  }, [user, target]);

  const createRoomIfNotExists = async () => {
    const roomId = getRoomId(user?.uid, target?.id);
    await setDoc(doc(database, "rooms", roomId), {
      roomId,
      createdAt: Timestamp.fromDate(new Date()),
    });
  };

  const getRoomId = (id1, id2) => {
    const sortedIds = [id1, id2].sort();
    const roomId = sortedIds.join("_");
    return roomId;
  };

  const handleSend = useCallback(async (newMessages = []) => {
    console.log("yes", user);
    try {
      const roomId = getRoomId(user?.uid, target?.id);
      const docRef = doc(database, "rooms", roomId);
      const messagesRef = collection(docRef, "messages");
      let message = newMessages[0];

      // console.log({... userProfile});
      let myMsg = {
        ...message,
        id: user?.uid,
        avatar: userProfile?.profileImage,
        expediteur: userProfile?.username,
        createdAt: Timestamp.now(),
      };

      await addDoc(messagesRef, myMsg);

      setMessages((previousMessages) =>
        GiftedChat.append(...previousMessages, myMsg)
      );
    } catch (error) {
      console.error(error);
    }
  }, []);

  console.log(userProfile?.profileImage);
  const renderBubble = (props) => {
    // console.log("currentMessage:", props.currentMessage);
    // console.log("currentMessage.user:", props.currentMessage.user);
    const { currentMessage } = props;
    return (
      <Bubble
        key={currentMessage._id}
        {...props}
        wrapperStyle={{
          left: {
            backgroundColor:
              theme === "pink" ? COLORS.neutral100 : "rgba(196, 196, 196, .5)",
            borderRadius: 15,
          },
          right: {
            backgroundColor:
              theme === "pink" ? COLORS.accent500 : COLORS.accent800,
            borderRadius: 15,
          },
        }}
        textStyle={{
          left: {
            color: COLORS.primary,
            fontFamily: "Regular",
          },
          right: {
            color: "white",
            fontFamily: "Regular",
          },
        }}
        // position={
        //   props.user._id === currentUser.uid ? "right" : "left"
        // }
        // bottomContainerStyle={m}
      />
    );
  };

  const customInputToolbar = (props) => {
    return (
      <View style={styles.inputToolbarContainer} className="">
        <InputToolbar {...props} containerStyle={styles.inputToolbar} />
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 " style={{ backgroundColor: COLORS.bg100 }}>
      <View
        className="w-full flex-row items-center pt-10  pb-3 rounded-b-lg justify-between  absolute  z-50"
        style={{
          backgroundColor:
            theme === "orange" ? COLORS.accent800 : COLORS.accent500,
          height: SIZES.height * 0.14,
          paddingHorizontal: 16,
        }}
      >
        <View className="flex flex-row  items-center justify-center ">
          <TouchableOpacity
            className="p-2 pl-0 mr-3"
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" color={"white"} size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{target?.username}</Text>
        </View>
        <OptionMenu menuItems={menuItems} />
      </View>

      <GiftedChat
        // showUserAvatar
        placeholder="ecrire un message"
        messages={messages}
        onSend={(messages) => handleSend(messages)}
        user={{
          _id: user?.uid,
          avatar: userProfile?.profileImage,
        }}
        renderBubble={renderBubble}
        renderInputToolbar={(props) => customInputToolbar(props)}
        renderSend={(props) => {
          return (
            <Send {...props}>
              <View style={styles.sendButton}>
                <Feather
                  name="send"
                  size={24}
                  color={theme === "pink" ? COLORS.accent500 : COLORS.accent800}
                />
              </View>
            </Send>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.accent800,
    height: SIZES.height * 0.16,
    paddingHorizontal: 16,
    display: "absolute",
  },
  backButton: {
    padding: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  settingsButton: {
    padding: 12,
  },
  inputToolbarContainer: {
    width: "95%",
    padding: 20,
    bottom: 0,
    alignSelf: "center",
  },
  inputToolbar: {
    // elevation: 2,
    backgroundColor: "white",
    borderTopWidth: 0,
    borderRadius: 98,
    paddingHorizontal: 10,
    // borderWidth: 2,
    // borderColor: "",
  },
  sendButton: {
    height: "100%",
    alignItems: "center",
    // backgroundColor:"red",
    elevation: 0,
    justifyContent: "center",
  },
});
