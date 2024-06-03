import React, { useContext, useEffect, useState } from "react";
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Image,
  TextInput,
} from "react-native";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import HeaderWithGoBack from "@/components/header-with-go-back";

import { COLORS, SIZES, icons, images } from "@/constants";
import MessageItem from "@/components/messageItem";
import { auth, database } from "@/config/firebaseConfig";
import { useNavigation } from "expo-router";
import { AntDesign } from "@expo/vector-icons";

const index = () => {
  // const { t } = useTranslation();
  // const { theme, toggleTheme } = useContext(ThemeContext);
  const navigation = useNavigation();
  // const [users, setUsers] = useState([]);
  // const currentUserUid = auth.currentUser.uid;
  const [refreshList, setRefreshList] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);

  const handleSearch = (text) => {
    setSearchText(text);
  };
  const handleMessageItemPress = (user) => {
    navigation.navigate(
      "onemessage"
      // , {
      //   user,
      //   onMessageSent: () => {
      //     // fetchUsers();
      //   },
      //   handleRefreshList,
      // }
    );
  };

  const handleRefreshList = () => {
    setRefreshList(!refreshList);
    setUsers([]);
  };

  // const fetchUsers = () => {
  //   const db = database;
  //   const usersCollectionRef = collection(db, "users");

  //   const unsubscribeUsers = onSnapshot(usersCollectionRef, (snapshot) => {
  //     const unsubscribeMessages = [];
  //     const userList = [];

  //     snapshot.forEach((doc) => {
  //       const userData = doc.data();
  //       console.log(userData);
  //       if (userData.uid !== currentUserUid && userData.role === "docteur") {
  //         const conversationId =
  //           currentUserUid < userData.uid
  //             ? `${currentUserUid}_${userData.uid}`
  //             : `${userData.uid}_${currentUserUid}`;

  //         const messagesCollectionRef = collection(
  //           db,
  //           "conversations",
  //           conversationId,
  //           "messages"
  //         );

  //         const unsubscribe = onSnapshot(
  //           query(
  //             messagesCollectionRef,
  //             orderBy("createdAt", "desc"),
  //             limit(1)
  //           ),
  //           (messagesSnapshot) => {
  //             const lastMessage = messagesSnapshot.docs[0]?.data();

  //             userList.push({
  //               ...userData,
  //               lastMessage: lastMessage?.text || "",
  //               lastMessageCreatedAt:
  //                 lastMessage?.createdAt?.seconds * 1000 || 0,
  //             });

  //             if (userList.length === snapshot.size - 1) {
  //               userList.sort(
  //                 (a, b) => b.lastMessageCreatedAt - a.lastMessageCreatedAt
  //               );
  //               setUsers(userList);
  //             }
  //           }
  //         );

  //         unsubscribeMessages.push(unsubscribe);
  //       }
  //     });

  //     return () => {
  //       unsubscribeMessages.forEach((unsubscribe) => unsubscribe());
  //       unsubscribeUsers();
  //     };
  //   });

  //   // const newMessageEvent = EventListener.listen("newMessageSent", () => {
  //   //   fetchUsers();
  //   // });
  // };

  // useEffect(() => {
  //   fetchUsers();
  // }, [refreshList]);

  // useEffect(() => {
  const users = [
    {
      uid: 1,
      urlImg: images.logo1,
      pseudo: "mihangy",
      profession: "sage femme",
      lastMessage:
        "Bonjour docteur klzbelkf zjklebf bzelkfboz zeokjbf izhefb zoihef ozebf opzheedefbn ",
      actifIndicator: true,
      // onPress={() => handleMessageItemPress(user)}
      // customStyles={{ marginBottom: 10 }}
    },
    {
      uid: 2,
      urlImg: images.logo2,
      pseudo: "mihangy",
      profession: "sage femme",
      lastMessage: "Bonjour docteur",
      actifIndicator: false,
      // onPress={() => handleMessageItemPress(user)}
      // customStyles={{ marginBottom: 10 }}
    },
    {
      uid: 3,
      urlImg: images.logo2,
      pseudo: "mihangy",
      profession: "sage femme",
      lastMessage: "Bonjour docteur",
      actifIndicator: true,
      // onPress={() => handleMessageItemPress(user)}
      // customStyles={{ marginBottom: 10 }}
    },
    {
      uid: 4,
      urlImg: images.logo2,
      pseudo: "mihangy",
      profession: "sage femme",
      lastMessage: "Bonjour docteur",
      actifIndicator: false,
      // onPress={() => handleMessageItemPress(user)}
      // customStyles={{ marginBottom: 10 }}
    },
  ];
  // });
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            "pink" === "pink" ? COLORS.neutral200 : COLORS.neutral100,
        },
      ]}
    >
      <View style={{ marginVertical: 30 }}>
        <View
          style={[styles.inputBox, { borderWidth: "pink" === "pink" ? 0 : 1 }]}
          className="shadow-sm shadow-black "
        >
          <TextInput
            style={{
              fontFamily: "Medium",
              fontSize: SIZES.medium,
              width: "90%",
            }}
            placeholder={"rechercher"}
            onChangeText={(text) => {
              handleSearch(text);
              const sanitizedText = text.replace(
                /[-[\]{}()*+?.,\\^$|#\s]/g,
                "\\$&"
              );
              const regex = new RegExp(sanitizedText, "i");
              const usersFiltered = users.filter((i) => regex.test(i.pseudo));
              setFilteredUsers(usersFiltered);

              console.log(filteredUsers);
            }}
          />
          <AntDesign name="search1" size={20} />
        </View>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {searchText !== ""
          ? filteredUsers.map((user, index) => (
              <MessageItem
                key={user.uid}
                urlImg={{
                  uri:
                    "https://i.pravatar.cc/" +
                    (Math.floor(Math.random() * 1000) + 1),
                }}
                name={user.pseudo}
                job={user.profession}
                lastMessage={user.lastMessage}
                onPress={() => handleMessageItemPress(user)}
                customStyles={{ marginBottom: 10 }}
              />
            ))
          : users.map((user, index) => (
              <MessageItem
                key={user.uid}
                urlImg={user.urlImg}
                name={user.pseudo}
                job={user.profession}
                lastMessage={user.lastMessage}
                onPress={() => handleMessageItemPress(user)}
                customStyles={{ marginBottom: 10 }}
                actifIndicator={user.actifIndicator}
              />
            ))}
      </ScrollView>
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

export default index;
