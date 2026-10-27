import React, { useState } from "react";
import {
  Modal,
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { SIZES } from "@/constants";
import { toast } from "@/components/ui";
import { downloadToDevice } from "@/utils/downloads";

/**
 * Visionneuse d'image plein écran : fond sombre, image entière, zoom par
 * pincement (iOS) et appui long, bouton fermer, téléchargement sur l'appareil.
 */
const ImageViewer = ({ uri, title, onClose }) => {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [zoomed, setZoomed] = useState(false);
  const scrollRef = React.useRef(null);

  const toggleZoom = () => {
    const next = !zoomed;
    setZoomed(next);
    scrollRef.current?.setNativeProps?.({ zoomScale: next ? 2 : 1 });
  };

  const [saving, setSaving] = useState(false);
  const download = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const ext = (uri.split(".").pop() || "jpg").toLowerCase().split("?")[0];
      await downloadToDevice(uri, `ampela-${Date.now()}.${ext}`, ext === "png" ? "image/png" : "image/jpeg");
    } catch (error) {
      toast.error(error.message || "Téléchargement impossible.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={!!uri} transparent={false} animationType="fade" onRequestClose={onClose}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <View style={styles.container}>
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          maximumZoomScale={4}
          minimumZoomScale={1}
          bouncesZoom
          centerContent
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity activeOpacity={1} onPress={onClose} onLongPress={toggleZoom} style={styles.touch}>
            <Image
              source={{ uri }}
              style={[styles.image, zoomed && styles.imageZoomed]}
              resizeMode="contain"
              onLoadEnd={() => setLoading(false)}
              onError={() => {
                setLoading(false);
                toast.error("Image introuvable.");
              }}
            />
          </TouchableOpacity>
        </ScrollView>

        {loading && (
          <View style={styles.loader} pointerEvents="none">
            <ActivityIndicator size="large" color="#FFFFFF" />
          </View>
        )}

        {/* Barre du haut */}
        <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity onPress={onClose} style={styles.iconButton} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={1}>
            {title || "Photo"}
          </Text>
          <TouchableOpacity
            onPress={download}
            disabled={saving}
            style={styles.iconButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Télécharger"
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="download-outline" size={22} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>

        <Text style={[styles.hint, { paddingBottom: insets.bottom + 14 }]}>
          Toucher pour fermer · appui long pour zoomer
        </Text>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  touch: {
    flex: 1,
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageZoomed: {
    transform: [{ scale: 2 }],
  },
  loader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 12,
    paddingBottom: 10,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  title: {
    flex: 1,
    fontFamily: "SBold",
    fontSize: SIZES.small + 1,
    color: "#FFFFFF",
  },
  hint: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    textAlign: "center",
    fontFamily: "Regular",
    fontSize: SIZES.small - 2,
    color: "rgba(255,255,255,0.7)",
    paddingTop: 10,
  },
});

export default ImageViewer;
