import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, RefreshControl } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "@legendapp/state/react";
import { SIZES, images } from "@/constants";
import { HEADER_HEIGHT } from "@/components/AppHeader";
import { handleHeaderScroll } from "@/hooks/useHeaderScroll";
import { useDiscoveryTheme } from "@/components/discovery";
import { DecorativeBlobs, Skeleton, toast } from "@/components/ui";
import { userState } from "@/legendstate/AmpelaStates";
import { useUnreadNotifications } from "@/hooks/useUnreadNotifications";
import { listPosts } from "@/services/forumAPI";
import { listConversations } from "@/services/messagesAPI";
import { relativeDate } from "@/components/forum/CommentThread";
import { describeRole } from "@/utils/roles";

/**
 * Tableau de bord de la professionnelle : questions en attente de réponse
 * sur le forum, conversations récentes, raccourcis.
 */
const Dashboard = () => {
  const router = useRouter();
  const user = useSelector(() => userState.get());
  const { surface, accentColor, accentContainer } = useDiscoveryTheme();
  const unreadNotifications = useUnreadNotifications();
  const [posts, setPosts] = useState(null);
  const [conversations, setConversations] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [p, c] = await Promise.all([listPosts(), listConversations()]);
      setPosts(p);
      setConversations(c);
    } catch (error) {
      toast.error(error.message || "Impossible de charger le tableau de bord.");
      setPosts((prev) => prev ?? []);
      setConversations((prev) => prev ?? []);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      const timer = setTimeout(load, 0);
      return () => clearTimeout(timer);
    }, [load])
  );

  const unanswered = (posts ?? []).filter((p) => (p.commentCount ?? 0) === 0).slice(0, 5);
  const unreadMessages = (conversations ?? []).reduce((n, c) => n + (c.unreadCount ?? 0), 0);
  const recentConversations = (conversations ?? []).filter((c) => c.lastMessage).slice(0, 3);
  const hour = new Date().getHours();
  const greeting = hour < 18 ? "Bonjour" : "Bonsoir";

  const stat = (icon, value, label, onPress) => (
    <TouchableOpacity style={styles.stat} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.statIcon, { backgroundColor: accentContainer }]}>
        <Ionicons name={icon} size={20} color={accentColor} />
      </View>
      {value === null ? (
        <Skeleton width={28} height={22} style={{ marginTop: 8 }} />
      ) : (
        <Text style={[styles.statValue, { color: accentColor }]}>{value}</Text>
      )}
      <Text style={styles.statLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: surface }]}>
      <DecorativeBlobs />
      <ScrollView
        onScroll={handleHeaderScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
            tintColor={accentColor}
            colors={[accentColor]}
          />
        }
      >
        {/* Bienvenue */}
        <View style={styles.hero}>
          <Image
            source={user.profileImage ? { uri: user.profileImage } : images.doctor01}
            style={[styles.avatar, { borderColor: accentContainer }]}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>
              {greeting}, {user.username || "docteure"}
            </Text>
            <Text style={styles.role}>{describeRole(user) || "Professionnelle de santé"}</Text>
          </View>
        </View>

        {/* Chiffres clés */}
        <View style={styles.stats}>
          {stat("help-circle-outline", posts ? unanswered.length : null, "à répondre", () =>
            router.push("/(drawer)/(main)/(forum)")
          )}
          {stat("chatbubbles-outline", conversations ? unreadMessages : null, "messages non lus", () =>
            router.push("/(drawer)/(message)")
          )}
          {stat("notifications-outline", unreadNotifications, "notifications", () =>
            router.push("/(drawer)/notifications")
          )}
        </View>

        {/* Questions sans réponse */}
        <View style={styles.sectionHead}>
          <Text style={styles.sectionLabel}>Questions en attente</Text>
          <TouchableOpacity onPress={() => router.push("/(drawer)/(main)/(forum)")}>
            <Text style={[styles.sectionLink, { color: accentColor }]}>Tout le forum</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.card}>
          {posts === null ? (
            [0, 1, 2].map((i) => (
              <View key={i} style={[styles.row, i < 2 && styles.rowDivider]}>
                <Skeleton width="80%" height={12} />
                <Skeleton width="40%" height={10} style={{ marginTop: 8 }} />
              </View>
            ))
          ) : unanswered.length === 0 ? (
            <Text style={styles.empty}>Toutes les questions ont une réponse. Bravo !</Text>
          ) : (
            unanswered.map((post, i) => (
              <TouchableOpacity
                key={post.id}
                style={[styles.row, i < unanswered.length - 1 && styles.rowDivider]}
                onPress={() => router.push({ pathname: "/(drawer)/(forum)/post", params: { id: post.id } })}
                activeOpacity={0.7}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle} numberOfLines={2}>
                    {post.title}
                  </Text>
                  <Text style={styles.rowMeta} numberOfLines={1}>
                    {post.authorName} · {relativeDate(post.createdAt)} · {post.likeCount ?? 0} réaction
                    {(post.likeCount ?? 0) > 1 ? "s" : ""}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#C9C3CC" />
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Conversations récentes */}
        <View style={styles.sectionHead}>
          <Text style={styles.sectionLabel}>Conversations récentes</Text>
          <TouchableOpacity onPress={() => router.push("/(drawer)/(message)")}>
            <Text style={[styles.sectionLink, { color: accentColor }]}>Messagerie</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.card}>
          {conversations === null ? (
            [0, 1].map((i) => (
              <View key={i} style={[styles.row, i < 1 && styles.rowDivider]}>
                <Skeleton width={40} height={40} radius={20} />
                <View style={{ flex: 1 }}>
                  <Skeleton width="50%" height={12} />
                  <Skeleton width="80%" height={10} style={{ marginTop: 8 }} />
                </View>
              </View>
            ))
          ) : recentConversations.length === 0 ? (
            <Text style={styles.empty}>Aucune conversation pour l’instant.</Text>
          ) : (
            recentConversations.map((c, i) => (
              <TouchableOpacity
                key={c.id}
                style={[styles.row, i < recentConversations.length - 1 && styles.rowDivider]}
                onPress={() =>
                  router.push({
                    pathname: "/(drawer)/(message)/onemessage",
                    params: { target: JSON.stringify(c) },
                  })
                }
                activeOpacity={0.7}
              >
                <Image source={c.profileImage ? { uri: c.profileImage } : images.doctor03} style={styles.rowAvatar} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle} numberOfLines={1}>
                    {c.username}
                  </Text>
                  <Text style={styles.rowMeta} numberOfLines={1}>
                    {c.lastMessage?.text || "Pièce jointe"}
                  </Text>
                </View>
                {c.unreadCount > 0 ? (
                  <View style={[styles.badge, { backgroundColor: accentColor }]}>
                    <Text style={styles.badgeText}>{c.unreadCount}</Text>
                  </View>
                ) : (
                  <Ionicons name="chevron-forward" size={18} color="#C9C3CC" />
                )}
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingTop: HEADER_HEIGHT + 16,
    paddingHorizontal: 20,
    paddingBottom: 110,
  },
  hero: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 18,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
  },
  greeting: {
    fontFamily: "Bold",
    fontSize: SIZES.large,
    color: "#2B2530",
  },
  role: {
    fontFamily: "Regular",
    fontSize: SIZES.small,
    color: "#8E8793",
    marginTop: 2,
  },
  stats: {
    flexDirection: "row",
    gap: 10,
  },
  stat: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 14,
    alignItems: "center",
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    fontFamily: "Bold",
    fontSize: SIZES.large,
    marginTop: 8,
  },
  statLabel: {
    fontFamily: "Regular",
    fontSize: SIZES.small - 2,
    color: "#7A737F",
    textAlign: "center",
    marginTop: 2,
  },
  sectionHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  sectionLabel: {
    fontFamily: "SBold",
    fontSize: SIZES.small - 1,
    color: "#A9A4AE",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  sectionLink: {
    fontFamily: "SBold",
    fontSize: SIZES.small - 1,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#F3F0F4",
  },
  rowAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  rowTitle: {
    fontFamily: "SBold",
    fontSize: SIZES.small + 1,
    color: "#2B2530",
  },
  rowMeta: {
    fontFamily: "Regular",
    fontSize: SIZES.small - 1,
    color: "#8E8793",
    marginTop: 3,
  },
  empty: {
    fontFamily: "Regular",
    fontSize: SIZES.small,
    color: "#8E8793",
    textAlign: "center",
    paddingVertical: 16,
  },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontFamily: "SBold",
    fontSize: 11,
    color: "#FFFFFF",
  },
});

export default Dashboard;
