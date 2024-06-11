import React, { useContext, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  FlatList,
  ActivityIndicator,
} from "react-native";
import {
  where,
  query,
  getDocs,
  collection,
  orderBy,
  limit,
} from "firebase/firestore";
import { COLORS, SIZES } from "@/constants";
import MessageItem from "@/components/messageItem";
import { database } from "@/services/firebaseConfig";
import { useNavigation } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import i18n from "@/constants/i18n";
import { ThemeContext } from "@/hooks/theme-context";
import { useAuth } from "@/hooks/AuthContext";

const MessagesScreen = () => {
  const { theme } = useContext(ThemeContext);
  const navigation = useNavigation();
  const [users, setUsers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const handleSearch = (text) => {
    setSearchText(text);
  };

  const handleMessageItemPress = (target) => {
    navigation.navigate("onemessage", { target });
  };

  useEffect(() => {
    if (user) {
      getUsers();
    }
  }, [user]);

  const getUsers = async () => {
    setLoading(true);
    const q = query(
      collection(database, "users"),
      where("userId", "!=", user?.uid)
    );
    const querySnapshot = await getDocs(q);
    let data = [];
    const userPromises = querySnapshot.docs.map(async (doc) => {
      const userData = doc.data();
      const roomId = getRoomId(user.uid, userData.userId);
      const messagesRef = collection(database, "rooms", roomId, "messages");
      const lastMessageQuery = query(
        messagesRef,
        orderBy("createdAt", "desc"),
        limit(1)
      );
      const lastMessageSnapshot = await getDocs(lastMessageQuery);
      const lastMessage = lastMessageSnapshot.docs[0]?.data();
      userData.lastMessage = lastMessage?.createdAt || null;
      return userData;
    });
    data = await Promise.all(userPromises);
    data.sort(
      (a, b) =>
        (b.lastMessage ? b.lastMessage.seconds : 0) -
        (a.lastMessage ? a.lastMessage.seconds : 0)
    );
    setUsers(data);
    setLoading(false);
  };

  const getRoomId = (userId1, userId2) => {
    const sortedIds = [userId1, userId2].sort();
    const roomId = sortedIds.join("_");
    return roomId;
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            theme === "pink" ? COLORS.neutral200 : COLORS.neutral100,
        },
      ]}
    >
      <View style={{ marginVertical: 30 }}>
        <View style={[styles.inputBox]} className="shadow-sm shadow-black ">
          <TextInput
            style={{
              fontFamily: "Medium",
              fontSize: SIZES.medium,
              width: "90%",
            }}
            placeholder={i18n.t("rechercher")}
            onChangeText={(text) => {
              handleSearch(text);
              const sanitizedText = text.replace(
                /[-[\]{}()*+?.,\\^$|#\s]/g,
                "\\$&"
              );
              const regex = new RegExp(sanitizedText, "i");
              const usersFiltered = users.filter((i) => regex.test(i.pseudo));
              setUsers(usersFiltered);
            }}
          />
          <AntDesign name="search1" size={20} />
        </View>
      </View>
      {loading ? (
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
          style={{ marginTop: 20 }}
        />
      ) : (
        <FlatList
          showsVerticalScrollIndicator={false}
          data={users}
          renderItem={({ item, index }) => (
            <MessageItem
              key={index}
              onPress={() => handleMessageItemPress(item)}
              customStyles={{ marginBottom: 10 }}
              target={item}
            />
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    flex: 1,
  },
  inputBox: {
    width: "100%",
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.neutral100,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 99,
  },
});

export default MessagesScreen;
