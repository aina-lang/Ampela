import React, { useEffect } from "react";
import i18n from "@/constants/i18n";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { downloadToDevice } from "@/utils/downloads";
import { toast } from "@/components/ui";

const fmt = (seconds) => {
  const s = Math.max(0, Math.round(seconds || 0));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

/** Message vocal : bouton lecture / pause, barre de progression, durée. */
const AudioBubble = ({ uri, durationMs, mine, accentColor }) => {
  const player = useAudioPlayer({ uri });
  const status = useAudioPlayerStatus(player);
  const total = status.duration || (durationMs ? durationMs / 1000 : 0);
  const progress = total ? Math.min(1, status.currentTime / total) : 0;
  const fg = mine ? "#FFFFFF" : accentColor;
  const track = mine ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.08)";

  // Revient au début une fois la lecture terminée.
  useEffect(() => {
    if (status.didJustFinish) {
      player.seekTo(0);
      player.pause();
    }
  }, [status.didJustFinish, player]);

  const toggle = () => {
    if (status.playing) player.pause();
    else player.play();
  };

  const download = async () => {
    try {
      const ext = (uri.split(".").pop() || "m4a").toLowerCase().split("?")[0];
      await downloadToDevice(uri, `vocal-${Date.now()}.${ext}`, ext === "m4a" ? "audio/mp4" : `audio/${ext}`);
    } catch (error) {
      toast.error(error.message || i18n.t("msgDownloadFailed"));
    }
  };

  return (
    <View style={styles.row}>
      <TouchableOpacity
        onPress={toggle}
        style={[styles.play, { backgroundColor: mine ? "rgba(255,255,255,0.25)" : `${accentColor}22` }]}
        activeOpacity={0.8}
        accessibilityLabel={status.playing ? i18n.t("msgPause") : i18n.t("msgListen")}
      >
        <Ionicons name={status.playing ? "pause" : "play"} size={18} color={fg} />
      </TouchableOpacity>
      <View style={styles.track}>
        <View style={[styles.trackBg, { backgroundColor: track }]} />
        <View style={[styles.trackFg, { backgroundColor: fg, width: `${progress * 100}%` }]} />
      </View>
      <Text style={[styles.time, { color: mine ? "rgba(255,255,255,0.9)" : "#5C5661" }]}>
        {status.playing ? fmt(status.currentTime) : fmt(total)}
      </Text>
      <TouchableOpacity onPress={download} hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }} accessibilityLabel={i18n.t("msgDownload")}>
        <Ionicons name="download-outline" size={16} color={fg} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    minWidth: 190,
  },
  play: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  track: {
    flex: 1,
    height: 4,
    justifyContent: "center",
  },
  trackBg: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 4,
    borderRadius: 2,
  },
  trackFg: {
    height: 4,
    borderRadius: 2,
  },
  time: {
    fontFamily: "SBold",
    fontSize: 11,
    minWidth: 32,
    textAlign: "right",
  },
});

export default AudioBubble;
