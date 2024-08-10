import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  FlatList,
  RefreshControl,
} from "react-native";
import ForumItem from "@/components/forum-item";
import { COLORS, SIZES } from "@/constants";
import BackgroundContainer from "@/components/background-container";
import { auth, database } from "@/services/firebaseConfig";
import { Link, useNavigation } from "expo-router";
import SearchForum from "@/components/SearchForum";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";

import { useModal } from "@/hooks/ModalProvider";
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  where,
} from "firebase/firestore";
import { useNetInfo } from "@react-native-community/netinfo";
import AuthContent from "@/components/AuthContentFromSetting";

const PAGE_SIZE = 10;

const mypost = () => {
  const navigation = useNavigation();
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [lastVisible, setLastVisible] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const { openModal } = useModal();
  const { isConnected, isInternetReachable } = useNetInfo();
  const { closeModal } = useModal();

  const fetchPosts = async (loadMore = false) => {
    if (!isConnected || !isInternetReachable) {
      setIsLoading(false);
      return;
    }

    try {
      let postsQuery = query(
        collection(database, "posts"),
        orderBy("createdAt", "desc"),
        limit(PAGE_SIZE)
      );

      if (loadMore && lastVisible) {
        postsQuery = query(postsQuery, startAfter(lastVisible));
      }

      const snapshot = await getDocs(postsQuery);

      if (!snapshot.empty) {
        const newPosts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPosts((prevPosts) =>
          loadMore ? [...prevPosts, ...newPosts] : newPosts
        );
        setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      } else if (loadMore) {
        setIsFetchingMore(false);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      if (!loadMore) setIsLoading(false);
      else setIsFetchingMore(false);
    }
  };

  const searchPosts = useCallback(
    async (searchText) => {
      if (!isConnected || !isInternetReachable) {
        setIsLoading(false);
        return;
      }

      try {
        let postsQuery = query(
          collection(database, "posts"),
          where("title", ">=", searchText.toLowerCase()),
          where("title", "<=", searchText.toLowerCase() + "\uf8ff"),
          orderBy("createdAt", "desc"),
          limit(PAGE_SIZE)
        );

        const snapshot = await getDocs(postsQuery);

        if (!snapshot.empty) {
          const newPosts = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setFilteredPosts(newPosts);
        } else {
          setFilteredPosts([]);
        }
      } catch (error) {
        console.error("Error searching posts:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [isConnected, isInternetReachable]
  );

  useEffect(() => {
    fetchPosts();
  }, [isConnected, isInternetReachable]);

  useEffect(() => {
    if (!auth.currentUser) {
      openModal(<AuthContent closeModal={closeModal} />);
    }
  }, []);

  const handleSearch = (text) => {
    setSearchText(text);
    searchPosts(text);
  };

  const handleLoadMore = () => {
    if (!isFetchingMore) {
      setIsFetchingMore(true);
      fetchPosts(true);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setLastVisible(null);
    await fetchPosts();
    setRefreshing(false);
  };


  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <SafeAreaView style={styles.container}>
        <BackgroundContainer paddingBottom={0} paddingHorizontal={2}>
        
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
          ) : isLoading && posts.length === 0 && filteredPosts.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : (
            <View className="mt-2">
              <SearchForum onSearch={handleSearch} />
              {auth.currentUser && (
                <View className="flex-row space-x-2 items-center justify-end px-5 mb-10">
                  <Link
                    href={"(drawer)/(forum)/addpost"}
                    className="flex-row space-x-2 p-2 bg-white rounded-md shadow-sm shadow-black"
                  >
                    <AntDesign name="edit" size={24} color={COLORS.accent600} />
                    <Text>Poser une question</Text>
                  </Link>
               
                </View>
              )}
              <FlatList
                data={searchText ? filteredPosts : posts}
                renderItem={({ item, index }) => (
                  <ForumItem post={item} navigation={navigation} key={index} />
                )}
                keyExtractor={(item, index) => index.toString()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 12, paddingBottom: 80 }}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListEmptyComponent={
                  !isLoading &&
                  !searchText &&
                  posts.length === 0 &&
                  filteredPosts.length === 0 ? (
                    <View style={styles.emptyContainer}>
                      <Text>Pas de données pour le moment</Text>
                    </View>
                  ) : null
                }
                ListFooterComponent={
                  isFetchingMore &&
                  posts.length != 0 && (
                    <View style={{ paddingVertical: 20 }}>
                      <ActivityIndicator size="large" color={COLORS.primary} />
                    </View>
                  )
                }
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                  />
                }
              />
            </View>
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
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
});

export default mypost;
