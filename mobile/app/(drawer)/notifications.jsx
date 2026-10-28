import React, { useCallback, useEffect, useState } from "react";
import { useCache, writeCache } from "@/services/localCache";
import Avatar from "@/components/ui/Avatar";
import i18n from "@/constants/i18n";
import { View, Text, StyleSheet, SectionList, TouchableOpacity, RefreshControl } from "react-native";
import { useNavigation, useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import { SIZES } from "@/constants";
import AppHeader, { HEADER_HEIGHT } from "@/components/AppHeader";
import { handleHeaderScroll } from "@/hooks/useHeaderScroll";
import { useDiscoveryTheme } from "@/components/discovery";
import { DecorativeBlobs, Skeleton, GhostButton, toast } from "@/components/ui";
import { useAuth } from "@/hooks/AuthContext";
import { setUnreadNotifications } from "@/hooks/useUnreadNotifications";
import { relativeDate } from "@/components/forum/CommentThread";
import { formatDateFr } from "@/services/reminders";
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/services/notificationsAPI";
import { subscribeToMessageEvents } from "@/services/messagesAPI";

// Titres traduits à l'affichage (le serveur les stocke en français) :
// reconstruits depuis le type et l'autrice quand le type est connu.
const TITLE_KEYS = { like: "notifLike", comment: "notifComment", reply: "notifReply", message: "notifMessage" };
const notificationTitle = (n) =>
  TITLE_KEYS[n.type]
    ? i18n.t(TITLE_KEYS[n.type], { name: n.actor?.username || i18n.t("anonymous") })
    : n.title;

const ICONS = {
  like: "heart",
  comment: "chatbubble-ellipses",
  reply: "return-down-forward",
  message: "mail",
  reminder: "alarm",
};

const pad = (n) => String(n).padStart(2, "0");

/** Centre de notifications : activité du forum et de la messagerie + rappels programmés. */
const NotificationsScreen = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const { user } = useAuth();
  const { surface, accentColor, accentContainer } = useDiscoveryTheme();
  const [items, setItems] = useState(null);
  const [reminders, setReminders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Local d'abord : dernière liste connue affichée avant le réseau.
  const cachedItems = useCache("notifications:list");
  useEffect(() => {
    if (!cachedItems || items !== null) return undefined;
    const timer = setTimeout(() => setItems((prev) => prev ?? cachedItems), 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cachedItems]);

  const load = useCallback(async () => {
    try {
      const [list, scheduled] = await Promise.all([
        user ? listNotifications() : Promise.resolve([]),
        Notifications.getAllScheduledNotificationsAsync().catch(() => []),
      ]);
      setItems(list);
      if (user) writeCache("notifications:list", list);
      // Les 5 prochains rappels planifiés sur l'appareil (date absolue uniquement).
      const upcoming = scheduled
        .map((n) => ({
          id: n.identifier,
          title: n.content?.title,
          body: n.content?.body,
          date:
            n.trigger?.type === "date" || n.trigger?.value
              ? new Date(n.trigger.value ?? n.trigger.date)
              : null,
        }))
        .filter((r) => r.date && !Number.isNaN(r.date.getTime()) && r.date > new Date())
        .sort((a, b) => a.date - b.date)
        .slice(0, 5);
      setReminders(upcoming);
    } catch (error) {
      // Hors ligne avec un cache : on garde la liste connue.
      if (!error?.status && items && items.length > 0) return;
      toast.error(error.message || i18n.t("notifLoadFailed"));
      setItems([]);
    } finally {
      setRefreshing(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      const timer = setTimeout(load, 0);
      return () => clearTimeout(timer);
    }, [load])
  );

  // Nouvelle notification pendant que l'écran est ouvert : en tête de liste.
  useEffect(
    () =>
      subscribeToMessageEvents((event, payload) => {
        if (event === "notification:new") setItems((prev) => (prev ? [payload, ...prev] : prev));
      }),
    []
  );

  const openSource = async (n) => {
    if (!n.readAt) {
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, readAt: new Date().toISOString() } : x)));
      markNotificationRead(n.id).catch(() => {});
      setUnreadNotifications(Math.max(0, (items ?? []).filter((x) => !x.readAt && x.id !== n.id).length));
    }
    if (n.type === "message" && n.actor) {
      router.push({
        pathname: "/(drawer)/(message)/onemessage",
        params: { target: JSON.stringify(n.actor) },
      });
      return;
    }
    if (n.postId) {
      router.push({ pathname: "/(drawer)/(forum)/post", params: { id: n.postId } });
    }
  };

  const readAll = async () => {
    try {
      await markAllNotificationsRead();
      setItems((prev) => prev.map((x) => ({ ...x, readAt: x.readAt ?? new Date().toISOString() })));
      setUnreadNotifications(0);
    } catch (_error) {
      toast.error(i18n.t("notifReadAllFailed"));
    }
  };

  const unreadCount = (items ?? []).filter((x) => !x.readAt).length;
  const today = new Date().toDateString();
  const recent = (items ?? []).filter((x) => new Date(x.createdAt).toDateString() === today);
  const earlier = (items ?? []).filter((x) => new Date(x.createdAt).toDateString() !== today);
  const sections = [
    ...(reminders.length ? [{ key: "reminders", title: i18n.t("notifUpcomingReminders"), data: reminders }] : []),
    ...(recent.length ? [{ key: "today", title: i18n.t("msgToday"), data: recent }] : []),
    ...(earlier.length ? [{ key: "earlier", title: i18n.t("notifEarlier"), data: earlier }] : []),
  ];

  const renderNotification = (n, index, total) => (
    <TouchableOpacity
      onPress={() => openSource(n)}
      activeOpacity={0.75}
      style={[
        styles.row,
        index === 0 && styles.rowTop,
        index === total - 1 && styles.rowBottom,
        index < total - 1 && styles.rowDivider,
        !n.readAt && { backgroundColor: accentContainer },
      ]}
    >
      <View style={styles.avatarWrap}>
        <Avatar uri={n.actor?.profileImage} name={n.actor?.username} size={46} />
        <View style={[styles.typeBadge, { backgroundColor: accentColor }]}>
          <Ionicons name={ICONS[n.type] || "notifications"} size={11} color="#FFFFFF" />
        </View>
      </View>
      <View style={styles.text}>
        <Text style={[styles.title, !n.readAt && styles.titleUnread]} numberOfLines={2}>
          {notificationTitle(n)}
        </Text>
        {!!n.body && (
          <Text style={styles.body} numberOfLines={2}>
            {n.body}
          </Text>
        )}
        <Text style={styles.time}>{relativeDate(n.createdAt)}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#C9C3CC" />
    </TouchableOpacity>
  );

  const renderReminder = (r, index, total) => (
    <TouchableOpacity
      onPress={() => router.push("/(drawer)/(main)")}
      activeOpacity={0.75}
      style={[
        styles.row,
        index === 0 && styles.rowTop,
        index === total - 1 && styles.rowBottom,
        index < total - 1 && styles.rowDivider,
      ]}
    >
      <View style={[styles.reminderIcon, { backgroundColor: accentContainer }]}>
        <Ionicons name="alarm-outline" size={20} color={accentColor} />
      </View>
      <View style={styles.text}>
        <Text style={styles.title} numberOfLines={1}>
          {r.title}
        </Text>
        <Text style={styles.body} numberOfLines={2}>
          {r.body}
        </Text>
        <Text style={styles.time}>
          {formatDateFr(r.date)} {i18n.t("notifAt")} {pad(r.date.getHours())}:{pad(r.date.getMinutes())}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#C9C3CC" />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: surface }]}>
      <DecorativeBlobs />
      <AppHeader navigation={navigation} title={i18n.t("notifTitle")} showBack absolute />
      <SectionList
        onScroll={handleHeaderScroll}
        scrollEventThrottle={16}
        sections={items === null ? [] : sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
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
        ListHeaderComponent={
          unreadCount > 0 ? (
            <View style={styles.toolbar}>
              <Text style={styles.toolbarText}>
                {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
              </Text>
              <GhostButton title={i18n.t("notifReadAll")} size="sm" onPress={readAll} />
            </View>
          ) : null
        }
        renderSectionHeader={({ section }) => <Text style={styles.sectionLabel}>{section.title}</Text>}
        renderItem={({ item, index, section }) =>
          section.key === "reminders"
            ? renderReminder(item, index, section.data.length)
            : renderNotification(item, index, section.data.length)
        }
        ListEmptyComponent={
          items === null ? (
            <View style={styles.skeleton}>
              {[0, 1, 2].map((i) => (
                <View key={i} style={styles.skeletonRow}>
                  <Skeleton width={44} height={44} radius={22} />
                  <View style={{ flex: 1 }}>
                    <Skeleton width="70%" height={12} />
                    <Skeleton width="90%" height={10} style={{ marginTop: 8 }} />
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.empty}>
              <View style={[styles.emptyIcon, { backgroundColor: accentContainer }]}>
                <Ionicons name="notifications-off-outline" size={26} color={accentColor} />
              </View>
              <Text style={styles.emptyTitle}>{i18n.t("notifEmptyTitle")}</Text>
              <Text style={styles.emptyText}>
                {user ? i18n.t("notifEmptySignedIn") : i18n.t("notifEmptySignedOut")}
              </Text>
            </View>
          )
        }
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
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  toolbarText: {
    fontFamily: "SBold",
    fontSize: SIZES.small,
    color: "#5C5661",
  },
  sectionLabel: {
    fontFamily: "SBold",
    fontSize: SIZES.small - 1,
    color: "#A9A4AE",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginTop: 18,
    marginBottom: 10,
    marginLeft: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  rowTop: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  rowBottom: {
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#F3F0F4",
  },
  avatarWrap: {
    width: 46,
    height: 46,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  typeBadge: {
    position: "absolute",
    right: -3,
    bottom: -3,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  reminderIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    flex: 1,
  },
  title: {
    fontFamily: "Regular",
    fontSize: SIZES.small + 1,
    color: "#2B2530",
  },
  titleUnread: {
    fontFamily: "SBold",
  },
  body: {
    fontFamily: "Regular",
    fontSize: SIZES.small,
    color: "#5C5661",
    marginTop: 2,
  },
  time: {
    fontFamily: "Regular",
    fontSize: SIZES.small - 2,
    color: "#A9A4AE",
    marginTop: 4,
  },
  skeleton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 14,
    gap: 14,
  },
  skeletonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  empty: {
    alignItems: "center",
    paddingTop: 48,
    paddingHorizontal: 24,
  },
  emptyIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  emptyTitle: {
    fontFamily: "Bold",
    fontSize: SIZES.medium + 1,
    color: "#2B2530",
    marginBottom: 6,
  },
  emptyText: {
    fontFamily: "Regular",
    fontSize: SIZES.small,
    color: "#7A737F",
    textAlign: "center",
    lineHeight: 20,
  },
});

export default NotificationsScreen;
