import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Linking,
  Dimensions,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SIZES } from "@/constants";
import { HEADER_HEIGHT } from "@/components/AppHeader";
import { handleHeaderScroll } from "@/hooks/useHeaderScroll";
import { useDiscoveryTheme } from "@/components/discovery";
import { DecorativeBlobs, Skeleton, toast } from "@/components/ui";
import { listMedia } from "@/services/messagesAPI";
import { relativeDate } from "@/components/forum/CommentThread";
import ImageViewer from "@/components/chat/ImageViewer";
import { downloadToDevice } from "@/utils/downloads";

const TABS = [
  { key: "image", label: "Médias", icon: "images-outline" },
  { key: "file", label: "Docs", icon: "document-attach-outline" },
  { key: "audio", label: "Vocaux", icon: "mic-outline" },
  { key: "link", label: "Liens", icon: "link-outline" },
];
const URL_RE = /https?:\/\/[^\s]+/gi;
const GRID_GAP = 4;
const COLS = 3;
const TILE = (Dimensions.get("window").width - 32 - GRID_GAP * (COLS - 1)) / COLS;

/** Nom de secours horodaté pour une pièce jointe sans nom. */
const downloadAttachment = (item) => {
  const ext = (item.attachmentUrl.split(".").pop() || "bin").split("?")[0];
  const fallback = `${item.attachmentType}-${new Date().toISOString().replace(/[:.]/g, "-")}.${ext}`;
  return downloadToDevice(item.attachmentUrl, item.attachmentName || fallback);
};

const formatSize = (bytes) => {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
};
const fmtDuration = (ms) => {
  const s = Math.floor((ms || 0) / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

/** Historique « Médias, liens et docs » d'une conversation, comme WhatsApp. */
const MediaScreen = () => {
  const params = useLocalSearchParams();
  const target = useMemo(() => {
    try {
      return params.target ? JSON.parse(params.target) : null;
    } catch (_) {
      return null;
    }
  }, [params.target]);
  const { surface, accentColor, accentContainer } = useDiscoveryTheme();
  const [tab, setTab] = useState("image");
  const [items, setItems] = useState(null);
  const [viewerUri, setViewerUri] = useState(null);

  useEffect(() => {
    if (!target?.id) return;
    let cancelled = false;
    // Différé d'un tick : pas de setState synchrone dans l'effet.
    const timer = setTimeout(() => {
      setItems(null);
      listMedia(target.id, tab)
        .then((list) => {
          if (!cancelled) setItems(list);
        })
        .catch(() => {
          if (!cancelled) {
            setItems([]);
            toast.error("Impossible de charger l'historique.");
          }
        });
    }, 0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [target?.id, tab]);

  const open = (url) => Linking.openURL(url).catch(() => toast.error("Ouverture impossible."));
  const download = (item) =>
    downloadAttachment(item).catch((error) =>
      toast.error(error.message || "Téléchargement impossible.")
    );

  const renderItem = ({ item }) => {
    if (tab === "image") {
      return (
        <TouchableOpacity onPress={() => setViewerUri(item.attachmentUrl)} activeOpacity={0.85}>
          <Image source={{ uri: item.attachmentUrl }} style={styles.tile} />
        </TouchableOpacity>
      );
    }
    if (tab === "link") {
      const links = item.text.match(URL_RE) ?? [];
      return (
        <View style={styles.row}>
          <View style={[styles.rowIcon, { backgroundColor: accentContainer }]}>
            <Ionicons name="link-outline" size={20} color={accentColor} />
          </View>
          <View style={styles.rowText}>
            {links.map((l) => (
              <Text key={l} style={[styles.link, { color: accentColor }]} numberOfLines={2} onPress={() => open(l)}>
                {l}
              </Text>
            ))}
            <Text style={styles.rowMeta} numberOfLines={1}>
              {item.user?.username} · {relativeDate(item.createdAt)}
            </Text>
          </View>
        </View>
      );
    }
    const isAudio = tab === "audio";
    return (
      <TouchableOpacity style={styles.row} onPress={() => download(item)} activeOpacity={0.8}>
        <View style={[styles.rowIcon, { backgroundColor: accentContainer }]}>
          <Ionicons name={isAudio ? "mic-outline" : "document-text-outline"} size={20} color={accentColor} />
        </View>
        <View style={styles.rowText}>
          <Text style={styles.rowTitle} numberOfLines={2}>
            {isAudio ? `Message vocal · ${fmtDuration(item.durationMs)}` : item.attachmentName || "Fichier"}
          </Text>
          <Text style={styles.rowMeta} numberOfLines={1}>
            {[item.user?.username, relativeDate(item.createdAt), formatSize(item.attachmentSize)]
              .filter(Boolean)
              .join(" · ")}
          </Text>
        </View>
        <Ionicons name="download-outline" size={18} color={accentColor} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: surface }]}>
      <DecorativeBlobs />
      <FlatList
        key={tab}
        onScroll={handleHeaderScroll}
        scrollEventThrottle={16}
        data={items ?? []}
        keyExtractor={(item) => item.id}
        numColumns={tab === "image" ? COLS : 1}
        columnWrapperStyle={tab === "image" ? { gap: GRID_GAP } : undefined}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={renderItem}
        ListHeaderComponent={
          <View style={styles.tabs}>
            {TABS.map((t) => {
              const active = t.key === tab;
              return (
                <TouchableOpacity
                  key={t.key}
                  onPress={() => setTab(t.key)}
                  style={[styles.tab, active && { backgroundColor: accentColor }]}
                  activeOpacity={0.85}
                >
                  <Ionicons name={t.icon} size={16} color={active ? "#FFFFFF" : "#7A737F"} />
                  <Text style={[styles.tabText, active && { color: "#FFFFFF" }]}>{t.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        }
        ListEmptyComponent={
          items === null ? (
            <View style={styles.skeleton}>
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} width="100%" height={tab === "image" ? TILE : 56} radius={14} />
              ))}
            </View>
          ) : (
            <View style={styles.empty}>
              <View style={[styles.emptyIcon, { backgroundColor: accentContainer }]}>
                <Ionicons name={TABS.find((t) => t.key === tab).icon} size={26} color={accentColor} />
              </View>
              <Text style={styles.emptyText}>
                {"Rien à afficher pour l'instant dans cette conversation."}
              </Text>
            </View>
          )
        }
      />
      <ImageViewer uri={viewerUri} title={target?.username} onClose={() => setViewerUri(null)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingTop: HEADER_HEIGHT + 16,
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: GRID_GAP,
  },
  tabs: {
    flexDirection: "row",
    gap: 8,
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
  tile: {
    width: TILE,
    height: TILE,
    borderRadius: 10,
    backgroundColor: "#ECE8EE",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
  },
  rowIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    fontFamily: "SBold",
    fontSize: SIZES.small,
    color: "#2B2530",
  },
  rowMeta: {
    fontFamily: "Regular",
    fontSize: SIZES.small - 2,
    color: "#8E8793",
    marginTop: 3,
  },
  link: {
    fontFamily: "SBold",
    fontSize: SIZES.small,
    textDecorationLine: "underline",
  },
  skeleton: {
    gap: 8,
  },
  empty: {
    alignItems: "center",
    paddingTop: 40,
    paddingHorizontal: 30,
  },
  emptyIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  emptyText: {
    fontFamily: "Regular",
    fontSize: SIZES.small,
    color: "#7A737F",
    textAlign: "center",
    lineHeight: 20,
  },
});

export default MediaScreen;
