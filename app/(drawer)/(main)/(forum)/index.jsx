import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  FlatList,
} from "react-native";
import ForumItem from "@/components/forum-item";
import { COLORS, SIZES } from "@/constants";
import BackgroundContainer from "@/components/background-container";
import { auth, database } from "@/services/firebaseConfig";
import { Link, useNavigation } from "expo-router";
import SearchForum from "@/components/SearchForum";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import AuthContent from "@/components/AuthContent";
import { useBottomSheet, useModal } from "@/hooks/ModalProvider";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useNetInfo } from "@react-native-community/netinfo";

const Index = () => {
  const navigation = useNavigation();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { openModal } = useModal();
  const { isConnected, isInternetReachable } = useNetInfo();

  useEffect(() => {
    if (isConnected && isInternetReachable) {
      const unsubscribe = onSnapshot(
        query(collection(database, "posts"), orderBy("createdAt", "desc")),
        (snapshot) => {
          const newPosts = snapshot.docs.map((doc) => doc.data());
          setPosts(newPosts);
          setIsLoading(false);
        }
      );
      return () => unsubscribe();
    } else {
      setIsLoading(false);
    }
  }, [isConnected, isInternetReachable]);

  useEffect(() => {
    if (!auth.currentUser) {
      openModal(<AuthContent />);
    }
  }, []);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <SafeAreaView style={styles.container}>
        <BackgroundContainer paddingBottom={0} paddingHorizontal={2}>
          <View
            style={{
              paddingTop: 12,
              paddingBottom: 40,
              paddingHorizontal: 16,
              height: SIZES.height * 0.2,
            }}
          >
            <View style={styles.headerContainer}>
              {auth.currentUser && (
                <Link
                  href={"(drawer)/(forum)/addpost"}
                  className="flex-row space-x-2 p-2 bg-white rounded-md shadow-sm shadow-black"
                >
                  <AntDesign name="edit" size={24} color={COLORS.accent600} />
                  <Text>Posez des questions</Text>
                </Link>
              )}
            </View>
            <SearchForum />
          </View>
          <View style={{ height: 8 }} />
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
          ) : isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : (
            <FlatList
              data={posts}
              renderItem={({ item }) => (
                <ForumItem post={item} navigation={navigation} />
              )}
              keyExtractor={(item, index) => index.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ padding: 12, paddingBottom: 80 }}
            />
          )}
        </BackgroundContainer>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    position: "absolute",
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 30001,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 8,
  },
  container: {
    flex: 1,
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

export default Index;
