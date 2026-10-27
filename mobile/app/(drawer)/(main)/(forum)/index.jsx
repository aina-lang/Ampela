import { handleHeaderScroll } from "@/hooks/useHeaderScroll";
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
import { listPosts } from "@/services/forumAPI";
import { useNetInfo } from "@react-native-community/netinfo";
import { useDiscoveryTheme } from "@/components/discovery";

const Index = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { openModal } = useModal();
  const router = useRouter();
  const { accentColor } = useDiscoveryTheme();
  const { isConnected, isInternetReachable } = useNetInfo();

  const [refreshing, setRefreshing] = useState(false);
  const canLoad = !!user && isConnected && isInternetReachable;

  const loadPosts = useCallback(async () => {
    if (!canLoad) return;
    try {
      setPosts(await listPosts());
    } catch (error) {
      console.error("Posts loading error:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [canLoad]);

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
                  accessibilityLabel="Poser une question"
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
          ) : !user ? (
            <View style={styles.signedOutContainer}>
              <MaterialCommunityIcons
                name="account-heart-outline"
                size={40}
                color={accentColor}
                style={styles.icon}
              />
              <Text style={styles.signedOutTitle}>
                Le forum est réservé aux membres
              </Text>
              <Text style={styles.signedOutText}>
                Connectez-vous avec votre e-mail pour lire et poser des
                questions.
              </Text>
              <SecondaryButton
                title="Se connecter"
                onPress={() => openModal(<AuthContent />)}
                style={{ marginTop: 16 }}
              />
            </View>
          ) : isLoading ? (
            <ForumSkeleton />
          ) : (
            <FlatList
        onScroll={handleHeaderScroll}
        scrollEventThrottle={16}
              data={
                searchText
                  ? posts.filter((p) =>
                      `${p.title ?? ""} ${p.description ?? ""}`
                        .toLowerCase()
                        .includes(searchText.toLowerCase())
                    )
                  : posts
              }
              renderItem={({ item }) => (
                <ForumItem post={item} onChange={handlePostChange} />
              )}
              keyExtractor={(item) => item.id}
              refreshing={refreshing}
              onRefresh={handleRefresh}
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
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    paddingBottom: 120,
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
