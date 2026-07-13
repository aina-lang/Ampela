import { COLORS, SIZES } from "@/constants";
import { useAuth } from "@/hooks/AuthContext";
import { preferenceState } from "@/legendstate/AmpelaStates";
import { database } from "@/services/firebaseConfig";
import { Feather } from "@expo/vector-icons";
import AppHeader from "@/components/AppHeader";
import { useSelector } from "@legendapp/state/react";
import { useRoute } from "expo-router";
import { useNavigation } from "expo-router";
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
  StyleSheet,
  SafeAreaView,
} from "react-native";
import {
  Bubble,
  GiftedChat,
  InputToolbar,
  Send,
} from "react-native-gifted-chat";
import { useDiscoveryTheme } from "@/components/discovery";

export default function OneMessageScreen() {
  const [messages, setMessages] = useState([]);
  const navigation = useNavigation();
  const { theme } = useSelector(() => preferenceState.get());
  const route = useRoute();
  const { target } = route?.params;
  const { user, userProfile } = useAuth();
  const { surface, accentColor } = useDiscoveryTheme();

  useEffect(() => {
    createRoomIfNotExists();
    const roomId = getRoomId(user?.uid, target?.userId);
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
    const roomId = getRoomId(user?.uid, target?.userId);
    await setDoc(doc(database, "rooms", roomId), {
      roomId,
      createdAt: Timestamp.fromDate(new Date()),
    });
  };

  const getRoomId = (userId1, userId2) => {
    const sortedIds = [userId1, userId2].sort();
    const roomId = sortedIds.join("_");
    return roomId;
  };

  const handleSend = useCallback(async (newMessages = []) => {
    console.log("yes", user);
    try {
      const roomId = getRoomId(user?.uid, target?.userId);
      const docRef = doc(database, "rooms", roomId);
      const messagesRef = collection(docRef, "messages");
      let message = newMessages[0];

      let myMsg = {
        ...message,
        userId: user?.uid,
        avatar: userProfile?.profileImage,
        expediteur: userProfile?.username,
        createdAt: Timestamp.now(),
      };

      await addDoc(messagesRef, myMsg);

      // setMessages((previousMessages) =>
      //   GiftedChat.append(previousMessages, myMsg)
      // );
    } catch (error) {
      console.error(error);
    }
  }, []);

  console.log(userProfile?.profileImage);
  const renderBubble = (props) => {
    const { currentMessage } = props;
    return (
      <Bubble
        key={currentMessage._id}
        {...props}
        wrapperStyle={{
          left: {
            backgroundColor: COLORS.neutral100,
            borderRadius: 15,
          },
          right: {
            backgroundColor: accentColor,
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
      />
    );
  };

  const customInputToolbar = (props) => {
    return (
      <View style={styles.inputToolbarContainer}>
        <InputToolbar {...props} containerStyle={styles.inputToolbar} />
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: surface }}>
      <AppHeader
        navigation={navigation}
        title={target?.username}
        showBack
        rightIcons={[{ name: "settings", onPress: () => navigation.navigate("Settings") }]}
      />

      <GiftedChat
        showUserAvatar
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
                <Feather name="send" size={24} color={accentColor} />
              </View>
            </Send>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  inputToolbarContainer: {
    width: "95%",
    padding: 20,
    bottom: 0,
    alignSelf: "center",
  },
  inputToolbar: {
    backgroundColor: COLORS.neutral100,
    borderTopWidth: 0,
    borderRadius: 98,
    paddingHorizontal: 10,
  },
  sendButton: {
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});
