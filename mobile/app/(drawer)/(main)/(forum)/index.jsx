import { handleHeaderScroll } from "@/hooks/useHeaderScroll";
import { useCache, writeCache } from "@/services/localCache";
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ForumItem from "@/components/forum-item";
import ForumSkeleton from "@/components/forum-skeleton";
import { HEADER_HEIGHT } from "@/components/AppHeader";
import { SIZES } from "@/constants";
import BackgroundContainer from "@/components/background-container";
import { useFocusEffect, useRouter } from "expo-router";
import SearchForum from "@/components/SearchForum";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AuthContent from "@/components/AuthContent";
import { useModal } from "@/hooks/ModalProvider";
import { useAuth } from "@/hooks/AuthContext";
import { SecondaryButton } from "@/components/ui";
import { listPosts, searchPosts } from "@/services/forumAPI";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { subscribeToMessageEvents } from "@/services/messagesAPI";
import { useNetInfo } from "@react-native-community/netinfo";
import { useDiscoveryTheme } from "@/components/discovery";
import { useTabBarSpace } from "@/components/MyTabBar";
import i18n from "@/constants/i18n";
import { useSelector } from "@legendapp/state/react";
import { preferenceState } from "@/legendstate/AmpelaStates";

const Index = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [searchText, setSearchText] = useState("");
  // Recherche servie par l'API (tolérante aux fautes) ; hors ligne, filtre local.
  const debouncedSearch = useDebouncedValue(searchText.trim());
  const [searchResults, setSearchResults] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { openModal } = useModal();
  const router = useRouter();
  const { accentColor } = useDiscoveryTheme();
  const tabBarSpace = useTabBarSpace();
  const { isConnected, isInternetReachable } = useNetInfo();

  const [refreshing, setRefreshing] = useState(false);
  // Le forum se lit sans compte ; un compte sert à poser, réagir, commenter.
  const canLoad = isConnected && isInternetReachable;
  useSelector(() => preferenceState.language.get());

  // Local d'abord : la dernière liste connue s'affiche tout de suite.
  const cachedPosts = useCache("forum:posts");
  useEffect(() => {
    if (!cachedPosts || posts.length > 0) return undefined;
    const timer = setTimeout(() => {
      setPosts(cachedPosts);
      setIsLoading(false);
    }, 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cachedPosts]);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      if (!debouncedSearch || !isConnected || !isInternetReachable) {
        if (!cancelled) setSearchResults(null);
        return;
      }
      try {
        const results = await searchPosts(debouncedSearch);
        if (!cancelled) setSearchResults(results);
      } catch {
        if (!cancelled) setSearchResults(null);
      }
    }, 0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [debouncedSearch, isConnected, isInternetReachable]);

  const localFilter = (list, text) =>
    list.filter((p) => `${p.title ?? ""} ${p.description ?? ""}`.toLowerCase().includes(text.toLowerCase()));

  const loadPosts = useCallback(async () => {
    if (!canLoad) return;
    try {
      const fresh = await listPosts();
      setPosts(fresh);
      writeCache("forum:posts", fresh);
    } catch (error) {
      console.error("Posts loading error:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
    // user?.id : après connexion, « likedByMe » doit être rechargé.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canLoad, user?.id]);

  // Rechargé à chaque retour sur l'écran (après un nouveau post, etc.).
  useFocusEffect(
    useCallback(() => {
      const timer = setTimeout(loadPosts, 0);
      return () => clearTimeout(timer);
    }, [loadPosts])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadPosts();
  };

  /** Remplace un post dans la liste (après un like, un commentaire…). */
  const handlePostChange = useCallback((updated) => {
    setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }, []);

  // Temps réel : nouvelles publications, compteurs et suppressions des
  // autres membres arrivent sans recharger. Le cache suit.
  useEffect(() => {
    if (!user) return undefined;
    return subscribeToMessageEvents((event, payload) => {
      setPosts((prev) => {
        let next = prev;
        if (event === "post:new" && !prev.some((p) => p.id === payload.id)) {
          next = [payload, ...prev];
        } else if (event === "post:updated") {
          next = prev.map((p) => {
            if (p.id !== payload.id) return p;
            const merged = { ...p, likeCount: payload.likeCount ?? p.likeCount, commentCount: payload.commentCount ?? p.commentCount };
            if (payload.title !== undefined) merged.title = payload.title;
            if (payload.description !== undefined) merged.description = payload.description;
            if (payload.photos !== undefined) merged.photos = payload.photos;
            return merged;
          });
        } else if (event === "post:deleted") {
          next = prev.filter((p) => p.id !== payload.id);
        }
        if (next !== prev) writeCache("forum:posts", next);
        return next;
      });
    });
  }, [user]);

  // Invitation à se connecter : une seule fois par ouverture de l'écran,
  // l'utilisatrice peut ensuite la fermer et rester sur le forum.
  const promptedRef = useRef(false);
  useEffect(() => {
    if (user || promptedRef.current) return;
    promptedRef.current = true;
    const timer = setTimeout(() => openModal(<AuthContent />), 0);
    return () => clearTimeout(timer);
  }, [user, openModal]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Le header du Stack gère la barre de statut et la tab bar flotte
          par-dessus le contenu : aucun inset vertical, sinon des bandes
          vides apparaissent en haut et en bas. */}
      <SafeAreaView style={styles.container} edges={["left", "right"]}>
        <BackgroundContainer paddingBottom={0} paddingHorizontal={2}>
          <View
            style={{
              paddingTop: HEADER_HEIGHT + 8,
              paddingBottom: 4,
              paddingHorizontal: 16,
            }}
          >
            <View style={styles.toolbar}>
              <View style={styles.searchWrapper}>
                <SearchForum value={searchText} onChangeText={setSearchText} />
              </View>
              {user && (
                <TouchableOpacity
                  accessibilityLabel={i18n.t("forumAskQuestion")}
                  activeOpacity={0.85}
                  onPress={() => router.push("/(drawer)/(forum)/addpost")}
                  style={[styles.askButton, { backgroundColor: accentColor }]}
                >
                  <Ionicons name="create-outline" size={22} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </View>
          </View>
          <View style={{ height: 8 }} />
          {(!isConnected || !isInternetReachable) && posts.length === 0 ? (
            <View style={styles.offlineContainer}>
              <MaterialCommunityIcons
                name="wifi-off"
                size={24}
                color="red"
                style={styles.icon}
              />
              <Text style={styles.text}>{i18n.t("forumOffline")}</Text>
            </View>
          ) : isLoading ? (
            <ForumSkeleton />
          ) : (
            <FlatList
        onScroll={handleHeaderScroll}
        scrollEventThrottle={16}
              data={searchText ? (searchResults ?? localFilter(posts, searchText)) : posts}
              renderItem={({ item }) => (
                <ForumItem post={item} onChange={handlePostChange} />
              )}
              keyExtractor={(item) => item.id}
              ListHeaderComponent={
                !user ? (
                  <View style={styles.signedOutContainer}>
                    <MaterialCommunityIcons
                      name="account-heart-outline"
                      size={28}
                      color={accentColor}
                      style={styles.icon}
                    />
                    <Text style={styles.signedOutTitle}>{i18n.t("forumSignedOutTitle")}</Text>
                    <Text style={styles.signedOutText}>{i18n.t("forumSignedOutText")}</Text>
                    <SecondaryButton
                      title={i18n.t("forumSignIn")}
                      onPress={() => openModal(<AuthContent />)}
                      style={{ marginTop: 12 }}
                    />
                  </View>
                ) : null
              }
              refreshing={refreshing}
              onRefresh={handleRefresh}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ padding: 12, paddingBottom: tabBarSpace }}
            />
          )}
        </BackgroundContainer>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchWrapper: {
    flex: 1,
  },
  // Même hauteur que la barre de recherche (48) pour une rangée alignée.
  askButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    flex: 1,
  },
  signedOutContainer: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 18,
    marginBottom: 12,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  signedOutTitle: {
    fontFamily: "SBold",
    fontSize: SIZES.medium,
    color: "#433C47",
    textAlign: "center",
    marginBottom: 8,
  },
  signedOutText: {
    fontFamily: "Regular",
    fontSize: SIZES.small,
    color: "#7A737F",
    textAlign: "center",
    lineHeight: 20,
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
