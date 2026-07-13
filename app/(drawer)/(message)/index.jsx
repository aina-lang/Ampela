import React, { useContext, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  FlatList,
  ActivityIndicator,
  Text,
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
import { auth, database } from "@/services/firebaseConfig";
import { useRouter } from "expo-router";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import i18n from "@/constants/i18n";
import { useAuth } from "@/hooks/AuthContext";
import { preferenceState } from "@/legendstate/AmpelaStates";
import { useSelector } from "@legendapp/state/react";
import NetInfo, { useNetInfo } from "@react-native-community/netinfo";
import AuthContent from "@/components/AuthContent";
import { useBottomSheet, useModal } from "@/hooks/ModalProvider";
import { useDiscoveryTheme } from "@/components/discovery";
import DiscoveryInput from "@/components/discovery/DiscoveryInput";
import DiscoveryCard from "@/components/discovery/DiscoveryCard";

const MessagesScreen = () => {
  const router = useRouter();
  const { theme } = useSelector(() => preferenceState.get());
  const [users, setUsers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const { surface, accentColor } = useDiscoveryTheme();

  const { isConnected, isInternetReachable } = useNetInfo();

  const handleSearch = (text) => {
    setSearchText(text);
  };

  const { openModal } = useModal();

  useEffect(() => {
    if (!auth.currentUser) {
      openModal(<AuthContent />);
    }
  }, [auth.currentUser]);

  const handleMessageItemPress = (target) => {
    if (user) {
      router.push({ pathname: "/(message)/onemessage", params: { target } });
    }
  };

  useEffect(() => {
    if (user) {
      getUsers();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      getUsers();
    }
  }, []);

  useEffect(() => {
    if (!isConnected) {
      setLoading(false);
      return;
    }

    if (isInternetReachable) {
      getUsers();
    }
  }, [isConnected]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (!state.isConnected) {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const getUsers = async () => {
    setLoading(true);
    let q;
    if (user) {
      q = query(
        collection(database, "users"),
        where("userId", "!=", user?.uid)
      );
    } else {
      q = query(collection(database, "users"));
    }
    const querySnapshot = await getDocs(q);
    let data = [];
    const userPromises = querySnapshot.docs.map(async (doc) => {
      const userData = doc.data();
      if (user) {
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
      }
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
    return sortedIds.join("_");
  };

  return (
    <View style={[styles.container, { backgroundColor: surface }]}>
      {!isConnected || !isInternetReachable ? (
        <View style={styles.offlineContainer}>
          <MaterialCommunityIcons
            name="wifi-off"
            size={24}
            color="red"
            style={styles.icon}
          />
          <Text style={styles.text}>Hors ligne</Text>
        </View>
      ) : (
        <View style={styles.searchSection}>
          <DiscoveryInput
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
            value={searchText}
            backgroundColor={COLORS.neutral100}
            borderColor={accentColor}
            containerStyle={styles.searchInput}
          />
        </View>
      )}

      {!loading && isConnected && isInternetReachable && (
        <FlatList
          showsVerticalScrollIndicator={false}
          data={users}
          renderItem={({ item, index }) => (
            <DiscoveryCard style={styles.messageCard}>
              <MessageItem
                key={index}
                onPress={() => handleMessageItemPress(item)}
                target={item}
                disabled={!user}
              />
            </DiscoveryCard>
          )}
        />
      )}

      {loading && isConnected && isInternetReachable && (
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
          style={{ marginTop: 20 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingTop: 200,
    paddingBottom: 16,
  },
  searchInput: {
    marginBottom: 8,
  },
  messageCard: {
    marginHorizontal: 20,
    marginBottom: 12,
  },
  offlineContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  icon: {
    marginBottom: 8,
  },
  text: {
    color: "red",
    fontWeight: "bold",
  },
});

export default MessagesScreen;
