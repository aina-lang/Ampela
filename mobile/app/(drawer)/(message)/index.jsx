import { handleHeaderScroll } from "@/hooks/useHeaderScroll";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, StyleSheet, FlatList, Text, TouchableOpacity, RefreshControl } from "react-native";
import { SIZES } from "@/constants";
import MessageItem from "@/components/messageItem";
import { HEADER_HEIGHT } from "@/components/AppHeader";
import { listConversations, subscribeToMessages, clearConversation } from "@/services/messagesAPI";
import ConfirmSheet from "@/components/ConfirmSheet";
import { isDoctor } from "@/utils/roles";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/AuthContext";
import { preferenceState } from "@/legendstate/AmpelaStates";
import { useSelector } from "@legendapp/state/react";
import { useNetInfo } from "@react-native-community/netinfo";
import AuthContent from "@/components/AuthContent";
import { useModal } from "@/hooks/ModalProvider";
import { useDiscoveryTheme } from "@/components/discovery";
import { DecorativeBlobs, SearchBar, Skeleton, toast } from "@/components/ui";

const MessagesScreen = () => {
  const router = useRouter();
  const { theme } = useSelector(() => preferenceState.get());
  const [users, setUsers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const { surface, accentColor, accentContainer } = useDiscoveryTheme();

  const { isConnected, isInternetReachable } = useNetInfo();

  const handleSearch = (text) => {
    setSearchText(text);
  };

  const { openModal } = useModal();

  // Même logique que le forum : une invitation par visite, refermable.
  const promptedRef = useRef(false);
  useEffect(() => {
    if (user || promptedRef.current) return;
    promptedRef.current = true;
    const timer = setTimeout(() => openModal(<AuthContent />), 0);
    return () => clearTimeout(timer);
  }, [user, openModal]);

  const [tab, setTab] = useState("conversations");
  const [refreshing, setRefreshing] = useState(false);
  const [toClear, setToClear] = useState(null);
  const [clearing, setClearing] = useState(false);

  const handleClearConversation = async () => {
    if (!toClear) return;
    setClearing(true);
    try {
      await clearConversation(toClear.id);
      setUsers((prev) =>
        prev.map((u) => (u.id === toClear.id ? { ...u, lastMessage: null, unreadCount: 0 } : u))
      );
      toast.success("Conversation supprimée.");
    } catch (error) {
      toast.error(error.message || "Suppression impossible.");
    } finally {
      setClearing(false);
      setToClear(null);
    }
  };

  const handleMessageItemPress = (target) => {
    if (user) {
      router.push({
        pathname: "/(message)/onemessage",
        // Les params de route sont des chaînes : on sérialise en JSON.
        params: { target: JSON.stringify(target) },
      });
    }
  };

  const getUsers = async () => {
    setLoading(true);
    try {
      // L'API renvoie les autres membres avec le dernier message échangé,
      // déjà triées par conversation la plus récente.
      setUsers(await listConversations());
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && isConnected && isInternetReachable) {
      // Déféré pour éviter un setState synchrone dans l'effet.
      const timer = setTimeout(getUsers, 0);
      return () => clearTimeout(timer);
    }
  }, [user, isConnected, isInternetReachable]);

  // Au retour d'une conversation : compteurs de non-lus et aperçus à jour.
  const firstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (firstFocus.current) {
        firstFocus.current = false;
        return;
      }
      if (user && isConnected && isInternetReachable) {
        listConversations().then(setUsers).catch(() => {});
      }
    }, [user, isConnected, isInternetReachable])
  );

  // Un nouveau message (reçu ou envoyé) remonte la conversation en tête.
  useEffect(() => {
    if (!user) return;
    return subscribeToMessages((message) => {
      setUsers((prev) => {
        const otherId = message.roomId
          .split("_")
          .find((id) => id !== user.id);
        const idx = prev.findIndex((u) => u.id === otherId);
        if (idx === -1) return prev;
        const updated = {
          ...prev[idx],
          lastMessage: {
            text: message.text,
            userId: message.userId,
            createdAt: message.createdAt,
            attachmentType: message.attachmentType,
            deletedAt: message.deletedAt,
          },
          unreadCount:
            message.userId === user.id ? prev[idx].unreadCount ?? 0 : (prev[idx].unreadCount ?? 0) + 1,
        };
        return [updated, ...prev.filter((_, i) => i !== idx)];
      });
    });
  }, [user]);

  // Hors ligne, le spinner n'est pas affiché (le rendu est dérivé de
  // isConnected) : pas besoin de forcer loading=false dans un effet.
  const visibleUsers = searchText
    ? users.filter((u) =>
        (u.username || u.pseudo || "")
          .toLowerCase()
          .includes(searchText.toLowerCase())
      )
    : users;

  const offline = !isConnected || !isInternetReachable;
  // Onglets : conversations en cours, puis annuaire des professionnelles.
  // La messagerie est réservée aux échanges avec les professionnelles de santé
  // (pas de discussion entre utilisatrices) : l'API ne renvoie qu'elles.
  const TABS = [
    { key: "conversations", label: "Conversations", icon: "chatbubbles-outline" },
    { key: "doctors", label: "Professionnelles de santé", icon: "medkit-outline" },
  ];
  const dataByTab = {
    conversations: visibleUsers.filter((u) => u.lastMessage),
    doctors: visibleUsers.filter((u) => isDoctor(u)),
  };
  const listData = loading || offline ? [] : dataByTab[tab] ?? [];
  const unreadTotal = users.reduce((n, u) => n + (u.unreadCount ?? 0), 0);
  const emptyText = searchText
    ? "Aucune professionnelle ne correspond à votre recherche."
    :    tab === "conversations"
      ? "Aucune conversation pour l’instant. Choisissez une professionnelle de santé pour écrire."
      : "Aucune professionnelle de santé disponible pour l’instant.";

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      setUsers(await listConversations());
    } catch (_error) {
      toast.error("Impossible d’actualiser la liste.");
    } finally {
      setRefreshing(false);
    }
  };

  const renderSkeleton = () => (
    <View style={styles.listCard}>
      {[0, 1, 2, 3].map((i) => (
        <View key={i} style={[styles.skeletonRow, i < 3 && styles.skeletonDivider]}>
          <Skeleton width={52} height={52} radius={26} />
          <View style={{ flex: 1 }}>
            <Skeleton width="45%" height={12} />
            <Skeleton width="30%" height={10} style={{ marginTop: 8 }} />
            <Skeleton width="80%" height={10} style={{ marginTop: 8 }} />
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: surface }]}>
      <DecorativeBlobs />

      <FlatList
        onScroll={handleHeaderScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        data={listData}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={accentColor}
            colors={[accentColor]}
          />
        }
        ListHeaderComponent={
          <View style={styles.searchSection}>
            <SearchBar value={searchText} onChangeText={handleSearch} />
            <View style={styles.tabs}>
              {TABS.map((t) => {
                const active = t.key === tab;
                const badge = t.key === "conversations" ? unreadTotal : 0;
                return (
                  <TouchableOpacity
                    key={t.key}
                    onPress={() => setTab(t.key)}
                    activeOpacity={0.85}
                    style={[styles.tab, active && { backgroundColor: accentColor }]}
                  >
                    <Ionicons name={t.icon} size={16} color={active ? "#FFFFFF" : "#7A737F"} />
                    <Text style={[styles.tabText, active && { color: "#FFFFFF" }]}>{t.label}</Text>
                    {badge > 0 && (
                      <View style={[styles.tabBadge, active ? { backgroundColor: "#FFFFFF" } : { backgroundColor: accentColor }]}>
                        <Text style={[styles.tabBadgeText, active && { color: accentColor }]}>{badge > 99 ? "99+" : badge}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        }
        renderItem={({ item, index }) => (
          <View
            style={[
              styles.listCard,
              index === 0 && styles.listCardTop,
              index === listData.length - 1 && styles.listCardBottom,
            ]}
          >
            <MessageItem
              onPress={() => handleMessageItemPress(item)}
              onLongPress={item.lastMessage ? () => setToClear(item) : undefined}
              target={item}
              last={index === listData.length - 1}
            />
          </View>
        )}
        ListEmptyComponent={
          offline ? (
            <View style={styles.state}>
              <View style={[styles.stateIcon, { backgroundColor: accentContainer }]}>
                <MaterialCommunityIcons name="wifi-off" size={26} color={accentColor} />
              </View>
              <Text style={styles.stateTitle}>Vous êtes hors ligne</Text>
              <Text style={styles.stateText}>
                La messagerie a besoin d’une connexion. Vos conversations réapparaîtront dès le
                retour du réseau.
              </Text>
            </View>
          ) : loading ? (
            renderSkeleton()
          ) : (
            <View style={styles.state}>
              <View style={[styles.stateIcon, { backgroundColor: accentContainer }]}>
                <Ionicons name={TABS.find((t) => t.key === tab)?.icon ?? "chatbubbles-outline"} size={26} color={accentColor} />
              </View>
              <Text style={styles.stateTitle}>{searchText ? "Aucun résultat" : "Rien à afficher"}</Text>
              <Text style={styles.stateText}>{emptyText}</Text>
            </View>
          )
        }
      />

      <ConfirmSheet
        visible={!!toClear}
        icon="trash-outline"
        danger
        title={`Supprimer la conversation avec ${toClear?.username ?? ""} ?`}
        message="Les messages seront effacés de votre côté uniquement. Votre interlocutrice garde les siens."
        confirmLabel="Supprimer"
        loading={clearing}
        onConfirm={handleClearConversation}
        onCancel={() => setToClear(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingTop: HEADER_HEIGHT + 16,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  searchSection: {
    marginBottom: 0,
  },
  tabs: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    marginBottom: 14,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
  },
  tabText: {
    fontFamily: "SBold",
    fontSize: SIZES.small - 1,
    color: "#7A737F",
  },
  tabBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  tabBadgeText: {
    fontFamily: "SBold",
    fontSize: 10,
    color: "#FFFFFF",
  },
  // Les lignes d'une section forment une seule carte blanche.
  listCard: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
  },
  listCardTop: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingTop: 4,
  },
  listCardBottom: {
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    paddingBottom: 4,
  },
  skeletonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  skeletonDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#F3F0F4",
  },
  state: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  stateIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  stateTitle: {
    fontFamily: "Bold",
    fontSize: SIZES.medium + 1,
    color: "#2B2530",
    marginBottom: 6,
  },
  stateText: {
    fontFamily: "Regular",
    fontSize: SIZES.small,
    color: "#7A737F",
    textAlign: "center",
    lineHeight: 20,
  },
});

export default MessagesScreen;
