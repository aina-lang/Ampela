import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { enqueueMessage, flushOutbox, isQueueable, pendingFor, subscribeToOutbox, usePendingFor } from "@/services/outbox";
import { useCache, writeCache } from "@/services/localCache";
import Avatar from "@/components/ui/Avatar";
import i18n from "@/constants/i18n";
import { formatDateFr } from "@/services/reminders";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  Pressable,
  TextInput,
  Keyboard,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { AudioModule, RecordingPresets, setAudioModeAsync } from "expo-audio";
import NativeAudio from "expo-audio/build/AudioModule";
import { createRecordingOptions } from "expo-audio/build/utils/options";
import { useAnimatedRef } from "react-native-reanimated";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import {
  Bubble,
  GiftedChat,
  InputToolbar,
  Send,
  Time,
} from "react-native-gifted-chat";
import { SIZES } from "@/constants";
import AppHeader, { HEADER_HEIGHT } from "@/components/AppHeader";
import { useAuth } from "@/hooks/AuthContext";
import { useDiscoveryTheme } from "@/components/discovery";
import { Skeleton, toast } from "@/components/ui";
import ConfirmSheet from "@/components/ConfirmSheet";
import { describeRole } from "@/utils/roles";
import AudioBubble from "@/components/chat/AudioBubble";
import FileBubble from "@/components/chat/FileBubble";
import ImageViewer from "@/components/chat/ImageViewer";
import { uploadFile, uploadImage } from "@/services/api";
import {
  listMessages,
  roomIdFor,
  sendMessage,
  subscribeToMessages,
  subscribeToMessageEvents,
  editMessage,
  deleteMessage,
  markConversationRead,
  clearConversation,
  searchMessages,
} from "@/services/messagesAPI";
import { suspendAppLock } from "@/components/AppLockGate";

dayjs.locale("fr");

/** Message API → format GiftedChat (texte, image, fichier ou vocal). */
const toGifted = (m) => ({
  _id: m.id,
  text: m.text || "",
  createdAt: new Date(m.createdAt),
  user: {
    _id: m.userId,
    name: m.user?.username,
    avatar: m.user?.profileImage || undefined,
  },
  image: m.attachmentType === "image" ? m.attachmentUrl : undefined,
  audio: m.attachmentType === "audio" ? m.attachmentUrl : undefined,
  file:
    m.attachmentType === "file"
      ? { url: m.attachmentUrl, name: m.attachmentName, size: m.attachmentSize }
      : undefined,
  durationMs: m.durationMs,
  // Statut : supprimé / modifié / lu (accusés de lecture)
  deleted: !!m.deletedAt,
  edited: !!m.editedAt,
  readAt: m.readAt,
  attachmentType: m.attachmentType,
  // En attente d'envoi (écrit hors ligne) : horloge dans la bulle.
  pending: !!m.pending,
});

const fmtDuration = (ms) => {
  const s = Math.floor((ms || 0) / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

export default function OneMessageScreen() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [attachMenu, setAttachMenu] = useState(false);
  const [viewerUri, setViewerUri] = useState(null);
  const [selected, setSelected] = useState(null); // message visé par l'appui long
  const [editing, setEditing] = useState(null); // message en cours de modification
  const [draft, setDraft] = useState("");
  const [toDelete, setToDelete] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [matchIdx, setMatchIdx] = useState(0);
  // Référence animée : GiftedChat la transmet à un worklet Reanimated, une
  // ref React classique déclenche « Tried to modify key current ».
  const listRef = useAnimatedRef();
  const inputRef = useRef(null);
  const navigation = useNavigation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  // Les params expo-router sont des chaînes : `target` arrive en JSON.
  const params = useLocalSearchParams();
  const target = useMemo(() => {
    try {
      return params.target ? JSON.parse(params.target) : null;
    } catch (_) {
      return null;
    }
  }, [params.target]);
  const { user } = useAuth();
  const { surface, accentColor, accentContainer } = useDiscoveryTheme();

  // Enregistreur créé à la demande (et libéré après chaque vocal) : le hook
  // de la librairie garde un objet natif qui peut être « déjà libéré »
  // après un rechargement, d'où l'erreur sur prepareToRecordAsync.
  const recorderRef = useRef(null);
  const recTimerRef = useRef(null);
  const [recording, setRecording] = useState(false);
  // Barre de saisie : décollée de la barre de gestes quand le clavier est
  // fermé, et décollée du clavier quand il est ouvert.
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", () => setKeyboardVisible(true));
    const hide = Keyboard.addListener("keyboardDidHide", () => setKeyboardVisible(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  const toolbarBottom = keyboardVisible ? 12 : insets.bottom + 12;
  const [recDuration, setRecDuration] = useState(0);

  const releaseRecorder = useCallback(() => {
    if (recTimerRef.current) clearInterval(recTimerRef.current);
    recTimerRef.current = null;
    try {
      recorderRef.current?.release?.();
    } catch (_error) {
      // déjà libéré
    }
    recorderRef.current = null;
  }, []);

  useEffect(() => releaseRecorder, [releaseRecorder]);

  const myId = user?.id;
  const targetId = target?.id;
  const targetAvatar = target?.profileImage || null;

  const appendMessage = useCallback((saved) => {
    setMessages((prev) =>
      prev.some((m) => m._id === saved.id) ? prev : GiftedChat.append(prev, [toGifted(saved)])
    );
  }, []);

  // Local d'abord : l'historique en cache s'affiche avant le réseau, et
  // les messages en attente d'envoi restent visibles.
  const roomKey = myId && targetId ? `messages:room:${roomIdFor(myId, targetId)}` : null;
  const cachedMessages = useCache(roomKey ?? "messages:none");
  const pendingItems = usePendingFor(targetId);
  useEffect(() => {
    if (!cachedMessages || messages.length > 0) return undefined;
    const timer = setTimeout(() => {
      const restored = cachedMessages.map((m) => ({ ...m, createdAt: new Date(m.createdAt) }));
      const queued = pendingItems.map((item) =>
        toGifted({ id: item.id, text: item.payload.text, userId: myId, createdAt: item.createdAt, pending: true })
      );
      setMessages((prev) => (prev.length > 0 ? prev : GiftedChat.append(restored, queued)));
      setLoading(false);
    }, 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cachedMessages]);
  useEffect(() => {
    if (!roomKey || messages.length === 0) return;
    // Les 100 derniers messages réellement envoyés (pas ceux en attente).
    writeCache(roomKey, messages.filter((m) => !m.pending).slice(0, 100));
  }, [roomKey, messages]);
  useEffect(() => {
    if (!targetId) return undefined;
    flushOutbox().catch(() => undefined);
    return subscribeToOutbox((event) => {
      if (event.type === "sent") {
        const gifted = toGifted(event.saved);
        setMessages((prev) => prev.map((m) => (m._id === event.localId ? gifted : m)));
      } else if (event.type === "failed") {
        setMessages((prev) => prev.filter((m) => m._id !== event.localId));
        toast.error(i18n.t("msgNotSent"));
      }
    });
  }, [targetId]);

  // Historique au montage, puis nouveaux messages poussés par WebSocket.
  useEffect(() => {
    if (!myId || !targetId) return;
    let cancelled = false;
    listMessages(targetId)
      .then((list) => {
        if (cancelled) return;
        const fresh = list.map(toGifted);
        const queued = pendingFor(targetId).map((item) =>
          toGifted({ id: item.id, text: item.payload.text, userId: myId, createdAt: item.createdAt, pending: true })
        );
        setMessages(GiftedChat.append(fresh, queued));
      })
      .catch((error) => {
        // Hors ligne avec un historique en cache : pas d'erreur à montrer.
        console.log("Messages loading error:", error?.message ?? error);
        if (!error?.status && messages.length > 0) return;
        toast.error(i18n.t("msgLoadFailed"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    const roomId = roomIdFor(myId, targetId);
    // Ouvrir la conversation = lire les messages reçus.
    markConversationRead(targetId).catch(() => {});
    const unsubscribe = subscribeToMessages((message) => {
      if (message.roomId !== roomId) return;
      appendMessage(message);
      if (message.userId !== myId) markConversationRead(targetId).catch(() => {});
    });
    const unsubscribeEvents = subscribeToMessageEvents((event, payload) => {
      if (payload?.roomId !== roomId) return;
      if (event === "message:updated") {
        const updated = toGifted(payload);
        setMessages((prev) => prev.map((m) => (m._id === updated._id ? updated : m)));
      } else if (event === "message:read") {
        const ids = new Set(payload.ids);
        setMessages((prev) =>
          prev.map((m) => (ids.has(m._id) ? { ...m, readAt: payload.readAt } : m))
        );
      }
    });
    return () => {
      cancelled = true;
      unsubscribe();
      unsubscribeEvents();
    };
  }, [myId, targetId, appendMessage]);

  const deliver = useCallback(
    async (payload) => {
      if (!targetId) return;
      try {
        appendMessage(await sendMessage(targetId, payload));
      } catch (error) {
        if (!error?.status && isQueueable(payload)) {
          // Pas de réseau : gardé sur le téléphone, envoyé dès que possible.
          const item = enqueueMessage(targetId, payload);
          appendMessage({ id: item.id, text: payload.text, userId: myId, createdAt: item.createdAt, pending: true });
          toast.info(i18n.t("msgQueued"));
          return;
        }
        console.log("Send failed:", error?.message ?? error);
        toast.error(i18n.t("msgNotSent"));
      }
    },
    [targetId, appendMessage, myId]
  );

  const handleSend = useCallback(
    async (newMessages = []) => {
      const text = newMessages[0]?.text?.trim();
      if (!text) return;
      if (editing) {
        try {
          const updated = await editMessage(targetId, editing._id, text);
          const gifted = toGifted(updated);
          setMessages((prev) => prev.map((m) => (m._id === gifted._id ? gifted : m)));
          toast.success(i18n.t("msgEdited"));
        } catch (error) {
          toast.error(error.message || i18n.t("msgEditFailed"));
        } finally {
          setEditing(null);
          setDraft("");
        }
        return;
      }
      deliver(text);
    },
    [deliver, editing, targetId]
  );

  // ---- Actions sur un message (appui long) ----
  const copyMessage = async () => {
    if (!selected) return;
    const content = selected.text || selected.image || selected.audio || selected.file?.url || "";
    await Clipboard.setStringAsync(content);
    setSelected(null);
    toast.success(i18n.t("msgCopied"));
  };

  const startEdit = () => {
    if (!selected) return;
    setEditing(selected);
    setDraft(selected.text);
    setSelected(null);
    // Curseur dans le champ, à la fin du texte, dès la fermeture du menu.
    setTimeout(() => inputRef.current?.focus(), 150);
  };

  const cancelEdit = () => {
    setEditing(null);
    setDraft("");
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      const updated = await deleteMessage(targetId, toDelete._id);
      const gifted = toGifted(updated);
      setMessages((prev) => prev.map((m) => (m._id === gifted._id ? gifted : m)));
      toast.success(i18n.t("msgDeleted"));
    } catch (error) {
      toast.error(error.message || i18n.t("forumDeleteFailed"));
    } finally {
      setToDelete(null);
    }
  };

  const handleClear = async () => {
    try {
      await clearConversation(targetId);
      setMessages([]);
      setConfirmClear(false);
      toast.success(i18n.t("msgConversationDeleted"));
      router.back();
    } catch (error) {
      toast.error(error.message || i18n.t("forumDeleteFailed"));
      setConfirmClear(false);
    }
  };

  // ---- Recherche dans la conversation (comme WhatsApp) ----
  // La conversation reste affichée ; les occurrences sont surlignées et
  // les flèches font défiler vers la précédente / la suivante.
  const searchTerm = searchOpen ? searchText.trim().toLowerCase() : "";
  // Les occurrences viennent de l'API (recherche tolérante aux fautes) ;
  // sans réponse (hors ligne), repli sur une recherche locale exacte.
  const debouncedTerm = useDebouncedValue(searchTerm);
  const [remoteMatchIds, setRemoteMatchIds] = useState(null);
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      if (!debouncedTerm || !targetId) {
        if (!cancelled) setRemoteMatchIds(null);
        return;
      }
      try {
        const list = await searchMessages(targetId, debouncedTerm);
        if (!cancelled) setRemoteMatchIds(new Set(list.map((m) => m.id)));
      } catch {
        if (!cancelled) setRemoteMatchIds(null);
      }
    }, 0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [debouncedTerm, targetId]);
  // Indices (dans la liste inversée : 0 = le plus récent) des messages qui contiennent le motif.
  const matches = useMemo(() => {
    if (!searchTerm) return [];
    return messages.reduce((acc, m, index) => {
      if (m.deleted) return acc;
      const hit = remoteMatchIds
        ? remoteMatchIds.has(m._id)
        : `${m.text || ""} ${m.file?.name || ""}`.toLowerCase().includes(searchTerm);
      if (hit) acc.push(index);
      return acc;
    }, []);
  }, [messages, searchTerm, remoteMatchIds]);
  const currentMatchId = matches.length ? messages[matches[matchIdx]]?._id : null;

  const scrollToMatch = useCallback(
    (position) => {
      const index = matches[position];
      if (index === undefined) return;
      listRef.current?.scrollToIndex?.({ index, viewPosition: 0.5, animated: true });
    },
    [matches, listRef]
  );

  // Nouveau motif : on repart de l'occurrence la plus récente (différé
  // d'un tick pour ne pas modifier l'état pendant l'effet).
  useEffect(() => {
    const timer = setTimeout(() => {
      setMatchIdx(0);
      if (matches.length) scrollToMatch(0);
    }, 50);
    return () => clearTimeout(timer);
  }, [matches, scrollToMatch]);

  const goToMatch = (delta) => {
    if (!matches.length) return;
    const next = (matchIdx + delta + matches.length) % matches.length;
    setMatchIdx(next);
    scrollToMatch(next);
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchText("");
    setMatchIdx(0);
  };

  /** Texte avec le motif surligné (plus fort sur l'occurrence courante). */
  const highlight = (text, mine, isCurrent) => {
    if (!searchTerm || !text) return text;
    const parts = [];
    const lower = text.toLowerCase();
    let from = 0;
    let at = lower.indexOf(searchTerm);
    while (at !== -1) {
      if (at > from) parts.push(text.slice(from, at));
      parts.push(
        <Text
          key={`${at}-${parts.length}`}
          style={[
            styles.mark,
            isCurrent ? styles.markCurrent : mine ? styles.markOnAccent : styles.markOnWhite,
          ]}
        >
          {text.slice(at, at + searchTerm.length)}
        </Text>
      );
      from = at + searchTerm.length;
      at = lower.indexOf(searchTerm, from);
    }
    if (from < text.length) parts.push(text.slice(from));
    return parts;
  };

  // ---- Pièces jointes ----
  const sendPhoto = async (fromCamera) => {
    setAttachMenu(false);
    suspendAppLock();
    const options = { mediaTypes: ["images"], quality: 0.8, allowsEditing: false };
    const result = fromCamera
      ? await (async () => {
          const perm = await ImagePicker.requestCameraPermissionsAsync();
          if (!perm.granted) {
            toast.warning(i18n.t("msgCameraPermission"));
            return { canceled: true };
          }
          return ImagePicker.launchCameraAsync(options);
        })()
      : await ImagePicker.launchImageLibraryAsync(options);
    if (result.canceled) return;
    setUploading(true);
    try {
      const url = await uploadImage(result.assets[0].uri);
      await deliver({ attachmentType: "image", attachmentUrl: url });
    } catch (error) {
      toast.error(error.message || i18n.t("msgPhotoSendFailed"));
    } finally {
      setUploading(false);
    }
  };

  const sendDocument = async () => {
    setAttachMenu(false);
    let result;
    try {
      suspendAppLock();
      result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "text/plain",
          "image/*",
        ],
        copyToCacheDirectory: true,
        multiple: false,
      });
    } catch (_error) {
      toast.error(i18n.t("msgFilePickerUnavailable"));
      return;
    }
    if (result.canceled || !result.assets?.length) return;
    const asset = result.assets[0];
    if (asset.size && asset.size > 10 * 1024 * 1024) {
      toast.warning(i18n.t("msgFileTooBig"));
      return;
    }
    setUploading(true);
    try {
      const isImage = asset.mimeType?.startsWith("image/");
      const uploaded = isImage
        ? { url: await uploadImage(asset.uri), name: asset.name, size: asset.size }
        : await uploadFile(asset.uri, asset.name, asset.mimeType || "application/octet-stream");
      await deliver({
        attachmentType: isImage ? "image" : "file",
        attachmentUrl: uploaded.url,
        attachmentName: uploaded.name ?? asset.name,
        attachmentSize: uploaded.size ?? asset.size,
      });
    } catch (error) {
      toast.error(error.message || i18n.t("msgFileSendFailed"));
    } finally {
      setUploading(false);
    }
  };

  // ---- Message vocal ----
  const startRecording = async () => {
    try {
      suspendAppLock();
      const perm = await AudioModule.requestRecordingPermissionsAsync();
      if (!perm.granted) {
        toast.warning(i18n.t("msgMicPermission"));
        return;
      }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      releaseRecorder();
      const recorder = new NativeAudio.AudioRecorder(
        createRecordingOptions(RecordingPresets.HIGH_QUALITY)
      );
      recorderRef.current = recorder;
      await recorder.prepareToRecordAsync();
      recorder.record();
      setRecDuration(0);
      setRecording(true);
      recTimerRef.current = setInterval(() => {
        try {
          setRecDuration(recorder.getStatus().durationMillis ?? 0);
        } catch (_error) {
          // enregistreur libéré entre-temps
        }
      }, 250);
    } catch (error) {
      console.error(error);
      releaseRecorder();
      setRecording(false);
      toast.error(i18n.t("msgRecordingUnavailable"));
    }
  };

  const finishRecording = async (send) => {
    const recorder = recorderRef.current;
    if (recTimerRef.current) clearInterval(recTimerRef.current);
    recTimerRef.current = null;
    setRecording(false);
    if (!recorder) return;
    let uri = null;
    let durationMs = recDuration;
    try {
      await recorder.stop();
      uri = recorder.uri;
      durationMs = recorder.getStatus?.().durationMillis || durationMs;
    } catch (error) {
      console.error(error);
    } finally {
      try {
        await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
      } catch (_error) {
        // ignoré
      }
      releaseRecorder();
    }
    if (!send || !uri) return;
    if (durationMs < 700) {
      toast.info(i18n.t("msgVoiceTooShort"));
      return;
    }
    setUploading(true);
    try {
      const ext = uri.split(".").pop()?.toLowerCase() || "m4a";
      const mime = ext === "m4a" ? "audio/m4a" : ext === "mp4" ? "audio/mp4" : `audio/${ext}`;
      const uploaded = await uploadFile(uri, `vocal-${Date.now()}.${ext}`, mime);
      await deliver({
        attachmentType: "audio",
        attachmentUrl: uploaded.url,
        attachmentName: uploaded.name,
        attachmentSize: uploaded.size,
        durationMs,
      });
    } catch (error) {
      toast.error(error.message || i18n.t("msgVoiceSendFailed"));
    } finally {
      setUploading(false);
    }
  };

  // ---- Rendu ----
  const renderBubble = (props) => {
    const { currentMessage } = props;
    const mine = currentMessage.user?._id === myId;
    if (currentMessage.deleted) {
      return (
        <View style={[styles.deletedBubble, mine ? styles.deletedRight : styles.deletedLeft]}>
          <Ionicons name="ban-outline" size={14} color="#A9A4AE" />
          <Text style={styles.deletedText}>{i18n.t("msgDeletedPlaceholder")}</Text>
        </View>
      );
    }
    return (
      <Bubble
        {...props}
        onLongPress={() => setSelected(currentMessage)}
        wrapperStyle={{
          left: [styles.bubbleLeft, currentMessage._id === currentMatchId && styles.bubbleCurrent],
          right: [
            styles.bubbleRight,
            { backgroundColor: accentColor },
            currentMessage._id === currentMatchId && styles.bubbleCurrent,
          ],
        }}
        textStyle={{ left: styles.bubbleTextLeft, right: styles.bubbleTextRight }}
        renderTicks={(message) => {
          if (message.user?._id !== myId) return null;
          const read = !!message.readAt;
          return (
            <Ionicons
              name={read ? "checkmark-done" : "checkmark"}
              size={14}
              color={read ? "#FFFFFF" : "rgba(255,255,255,0.7)"}
              style={styles.ticks}
            />
          );
        }}
      />
    );
  };

  const renderMessageText = (props) => {
    const { currentMessage } = props;
    const mine = currentMessage.user?._id === myId;
    const isCurrent = currentMessage._id === currentMatchId;
    return (
      <View style={styles.textWrap}>
        <Text style={mine ? styles.bubbleTextRight : styles.bubbleTextLeft} selectable>
          {highlight(currentMessage.text, mine, isCurrent)}
        </Text>
        {currentMessage.edited && (
          <Text style={[styles.edited, { color: mine ? "rgba(255,255,255,0.75)" : "#A9A4AE" }]}>
            {i18n.t("msgEditedMarker")}
          </Text>
        )}
      </View>
    );
  };

  // Image : notre visionneuse plein écran à la place de la lightbox de la librairie.
  const renderMessageImage = (props) => {
    const { currentMessage } = props;
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => setViewerUri(currentMessage.image)}
        onLongPress={() => setSelected(currentMessage)}
        style={styles.messageImageWrap}
      >
        <Image source={{ uri: currentMessage.image }} style={styles.messageImage} resizeMode="cover" />
      </TouchableOpacity>
    );
  };

  const renderMessageAudio = (props) => {
    const { currentMessage } = props;
    const mine = currentMessage.user?._id === myId;
    return (
      <AudioBubble
        uri={currentMessage.audio}
        durationMs={currentMessage.durationMs}
        mine={mine}
        accentColor={accentColor}
      />
    );
  };

  const renderCustomView = (props) => {
    const { currentMessage } = props;
    if (!currentMessage.file) return null;
    const mine = currentMessage.user?._id === myId;
    return (
      <FileBubble
        url={currentMessage.file.url}
        name={currentMessage.file.name}
        size={currentMessage.file.size}
        mine={mine}
        accentColor={accentColor}
      />
    );
  };

  const renderTime = (props) => (
    <Time {...props} timeTextStyle={{ left: styles.timeLeft, right: styles.timeRight }} />
  );

  // Séparateur de jour en français (le composant Day de la librairie
  // affiche « Today » / « Yesterday » en dur).
  const dayLabel = (date) => {
    const d = dayjs(date);
    if (d.isSame(dayjs(), "day")) return i18n.t("msgToday");
    if (d.isSame(dayjs().subtract(1, "day"), "day")) return i18n.t("msgYesterday");
    // Noms de jour et de mois dans la langue de l'app.
    return d.isSame(dayjs(), "year")
      ? formatDateFr(d.toDate())
      : `${formatDateFr(d.toDate())} ${d.year()}`;
  };
  const renderDay = (props) => {
    const { currentMessage, previousMessage } = props;
    if (!currentMessage?.createdAt) return null;
    if (
      previousMessage?.createdAt &&
      dayjs(currentMessage.createdAt).isSame(dayjs(previousMessage.createdAt), "day")
    ) {
      return null;
    }
    return (
      <View style={[styles.dayWrapper, { backgroundColor: accentContainer }]}>
        <Text style={styles.dayText}>{dayLabel(currentMessage.createdAt)}</Text>
      </View>
    );
  };

  const renderAvatar = () => (
    <Avatar uri={targetAvatar} name={target?.username} size={30} fontSize={12} />
  );

  const renderActions = () => (
    <TouchableOpacity
      onPress={() => setAttachMenu(true)}
      disabled={uploading || recording}
      style={styles.attachButton}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      accessibilityLabel={i18n.t("msgAttach")}
    >
      <Ionicons name="add-circle" size={30} color={accentColor} />
    </TouchableOpacity>
  );

  const renderInputToolbar = (props) => {
    if (recording) {
      return (
        <View style={[styles.toolbar, { backgroundColor: surface, paddingBottom: toolbarBottom }]}>
          <View style={[styles.toolbarPrimary, styles.recording]}>
            <View style={styles.recDot} />
            <Text style={styles.recText}>{i18n.t("msgRecording")} · {fmtDuration(recDuration)}</Text>
            <TouchableOpacity onPress={() => finishRecording(false)} style={styles.recCancel} hitSlop={{ top: 8, bottom: 8 }}>
              <Ionicons name="trash-outline" size={20} color="#E24C6B" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => finishRecording(true)}
              style={[styles.sendButton, { backgroundColor: accentColor }]}
              accessibilityLabel={i18n.t("msgSendVoice")}
            >
              <Ionicons name="send" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    return (
      <InputToolbar
        {...props}
        containerStyle={[styles.toolbar, { backgroundColor: surface, paddingBottom: toolbarBottom }]}
        primaryStyle={styles.toolbarPrimary}
      />
    );
  };

  const renderSend = (props) => {
    const hasText = !!props.text?.trim();
    if (!hasText) {
      return (
        <TouchableOpacity
          onPress={startRecording}
          disabled={uploading}
          style={[styles.sendContainer, styles.sendButton, { backgroundColor: accentColor }]}
          accessibilityLabel={i18n.t("msgRecordVoice")}
        >
          <Ionicons name="mic" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      );
    }
    return (
      <Send {...props} containerStyle={styles.sendContainer} alwaysShowSend>
        <View style={[styles.sendButton, { backgroundColor: accentColor }]}>
          <Ionicons name="send" size={16} color="#FFFFFF" />
        </View>
      </Send>
    );
  };

  // La liste de GiftedChat est inversée : son composant « vide » s'affiche
  // retourné et en bas. On dessine donc l'état vide nous-mêmes, par-dessus.
  const renderChatEmpty = () => null;
  const showEmpty = messages.length === 0;
  const emptyState = showEmpty && (
    <View
      pointerEvents="none"
      style={[styles.emptyOverlay, { top: HEADER_HEIGHT, bottom: 64 + insets.bottom + 12 }]}
    >
      {loading ? (
        <View style={styles.emptySkeleton}>
          <Skeleton width="55%" height={36} radius={18} style={{ alignSelf: "flex-start" }} />
          <Skeleton width="45%" height={36} radius={18} style={{ alignSelf: "flex-end" }} />
          <Skeleton width="65%" height={36} radius={18} style={{ alignSelf: "flex-start" }} />
        </View>
      ) : (
        <>
          <Avatar
            uri={targetAvatar}
            name={target?.username}
            size={84}
            borderWidth={3}
            borderColor={accentContainer}
            style={styles.emptyAvatar}
          />
          <Text style={styles.emptyTitle}>{target?.username}</Text>
          {!!describeRole(target) && <Text style={styles.emptySubtitle}>{describeRole(target)}</Text>}
          <Text style={styles.emptyHint}>
            {i18n.t("msgEmpty")}
          </Text>
        </>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: surface }]}>
      <AppHeader
        navigation={navigation}
        title={target?.username}
        subtitle={describeRole(target)}
        avatar={targetAvatar}
        avatarName={target?.username}
        showBack
        rightIcons={[
          { name: "search-outline", onPress: () => setSearchOpen(true) },
          { name: "ellipsis-vertical", onPress: () => setMenuOpen(true) },
        ]}
      />

      {searchOpen && (
        <View style={[styles.searchBar, { borderColor: accentContainer }]}>
          <Ionicons name="search" size={18} color={accentColor} />
          <TextInput
            autoFocus
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={() => goToMatch(1)}
            returnKeyType="search"
            placeholder={i18n.t("msgSearchPlaceholder")}
            placeholderTextColor="#A9A4AE"
            style={styles.searchInput}
            selectionColor={accentColor}
            cursorColor={accentColor}
          />
          {!!searchTerm && (
            <Text style={[styles.searchCount, !matches.length && { color: "#E24C6B" }]}>
              {matches.length ? `${matchIdx + 1} / ${matches.length}` : "0"}
            </Text>
          )}
          {/* ↑ occurrence plus ancienne, ↓ plus récente */}
          <TouchableOpacity
            onPress={() => goToMatch(1)}
            disabled={matches.length < 2}
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
          >
            <Ionicons name="chevron-up" size={22} color={matches.length < 2 ? "#D5D0D8" : accentColor} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => goToMatch(-1)}
            disabled={matches.length < 2}
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
          >
            <Ionicons name="chevron-down" size={22} color={matches.length < 2 ? "#D5D0D8" : accentColor} />
          </TouchableOpacity>
          <TouchableOpacity onPress={closeSearch} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close" size={20} color="#7A737F" />
          </TouchableOpacity>
        </View>
      )}

      {editing && (
        <View style={[styles.editBanner, { backgroundColor: accentContainer }]}>
          <Ionicons name="create-outline" size={16} color={accentColor} />
          <Text style={[styles.editBannerText, { color: accentColor }]} numberOfLines={1}>
            Modification du message
          </Text>
          <TouchableOpacity onPress={cancelEdit} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close" size={18} color={accentColor} />
          </TouchableOpacity>
        </View>
      )}
      <GiftedChat
        messageContainerRef={listRef}
        textInputRef={inputRef}
        messages={messages}
        onSend={handleSend}
        text={draft}
        onInputTextChanged={setDraft}
        user={{ _id: myId }}
        renderMessageText={renderMessageText}
        locale="fr"
        placeholder={i18n.t("msgWritePlaceholder")}
        alwaysShowSend
        showUserAvatar={false}
        renderAvatarOnTop
        renderBubble={renderBubble}
        renderMessageImage={renderMessageImage}
        renderMessageAudio={renderMessageAudio}
        renderCustomView={renderCustomView}
        renderTime={renderTime}
        renderDay={renderDay}
        renderAvatar={renderAvatar}
        renderActions={renderActions}
        renderInputToolbar={renderInputToolbar}
        renderSend={renderSend}
        renderChatEmpty={renderChatEmpty}
        bottomOffset={insets.bottom}
        minInputToolbarHeight={58 + toolbarBottom}
        textInputProps={{
          style: styles.textInput,
          selectionColor: accentColor,
          cursorColor: accentColor,
          placeholderTextColor: "#A9A4AE",
        }}
        messagesContainerStyle={styles.messagesContainer}
        listViewProps={{
          showsVerticalScrollIndicator: false,
          onScrollToIndexFailed: ({ index, averageItemLength }) => {
            listRef.current?.scrollToOffset?.({ offset: (averageItemLength || 80) * index, animated: true });
            setTimeout(
              () => listRef.current?.scrollToIndex?.({ index, viewPosition: 0.5, animated: true }),
              250
            );
          },
        }}
      />

      {emptyState}

      {uploading && (
        <View style={[styles.uploadBanner, { backgroundColor: accentContainer }]}>
          <Text style={[styles.uploadText, { color: accentColor }]}>Envoi en cours…</Text>
        </View>
      )}

      {/* Actions sur un message */}
      <Modal visible={!!selected} transparent animationType="fade" onRequestClose={() => setSelected(null)}>
        <Pressable style={styles.sheetOverlay} onPress={() => setSelected(null)}>
          <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
            {!!selected?.text && (
              <Text style={styles.sheetPreview} numberOfLines={2}>
                {selected.text}
              </Text>
            )}
            <TouchableOpacity style={styles.sheetAction} onPress={copyMessage} activeOpacity={0.7}>
              <Ionicons name="copy-outline" size={20} color="#2B2530" />
              <Text style={styles.sheetActionText}>{i18n.t("msgCopy")}</Text>
            </TouchableOpacity>
            {selected?.user?._id === myId && !selected?.attachmentType && (
              <TouchableOpacity style={styles.sheetAction} onPress={startEdit} activeOpacity={0.7}>
                <Ionicons name="create-outline" size={20} color="#2B2530" />
                <Text style={styles.sheetActionText}>{i18n.t("forumEdit")}</Text>
              </TouchableOpacity>
            )}
            {selected?.user?._id === myId && (
              <TouchableOpacity
                style={styles.sheetAction}
                onPress={() => {
                  setToDelete(selected);
                  setSelected(null);
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={20} color="#E24C6B" />
                <Text style={[styles.sheetActionText, { color: "#E24C6B" }]}>{i18n.t("msgDeleteForEveryone")}</Text>
              </TouchableOpacity>
            )}
          </View>
        </Pressable>
      </Modal>

      {/* Menu de la conversation */}
      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={styles.sheetOverlay} onPress={() => setMenuOpen(false)}>
          <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
            <TouchableOpacity
              style={styles.sheetAction}
              activeOpacity={0.7}
              onPress={() => {
                setMenuOpen(false);
                router.push({
                  pathname: "/(drawer)/(message)/media",
                  params: { target: JSON.stringify(target) },
                });
              }}
            >
              <Ionicons name="images-outline" size={20} color="#2B2530" />
              <Text style={styles.sheetActionText}>{i18n.t("msgMediaTitle")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sheetAction}
              activeOpacity={0.7}
              onPress={() => {
                setMenuOpen(false);
                setSearchOpen(true);
              }}
            >
              <Ionicons name="search-outline" size={20} color="#2B2530" />
              <Text style={styles.sheetActionText}>{i18n.t("rechercher")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sheetAction}
              activeOpacity={0.7}
              onPress={() => {
                setMenuOpen(false);
                setConfirmClear(true);
              }}
            >
              <Ionicons name="trash-outline" size={20} color="#E24C6B" />
              <Text style={[styles.sheetActionText, { color: "#E24C6B" }]}>{i18n.t("msgDeleteConversation")}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      <ConfirmSheet
        visible={!!toDelete}
        icon="trash-outline"
        danger
        title={i18n.t("msgDeleteMessageTitle")}
        message={i18n.t("msgDeleteMessageBody")}
        confirmLabel={i18n.t("forumDelete")}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
      <ConfirmSheet
        visible={confirmClear}
        icon="trash-outline"
        danger
        title={i18n.t("msgDeleteConversationTitle")}
        message={i18n.t("msgDeleteConversationMessage")}
        confirmLabel={i18n.t("forumDelete")}
        onConfirm={handleClear}
        onCancel={() => setConfirmClear(false)}
      />

      <ImageViewer uri={viewerUri} title={target?.username} onClose={() => setViewerUri(null)} />

      {/* Menu pièces jointes */}
      <Modal visible={attachMenu} transparent animationType="fade" onRequestClose={() => setAttachMenu(false)}>
        <Pressable style={styles.sheetOverlay} onPress={() => setAttachMenu(false)}>
          <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
            <Text style={styles.sheetTitle}>{i18n.t("msgAttach")}</Text>
            <View style={styles.sheetRow}>
              {[
                { icon: "camera-outline", label: i18n.t("msgCamera"), onPress: () => sendPhoto(true) },
                { icon: "images-outline", label: i18n.t("msgGallery"), onPress: () => sendPhoto(false) },
                { icon: "document-attach-outline", label: i18n.t("msgFile"), onPress: sendDocument },
              ].map((item) => (
                <TouchableOpacity key={item.label} onPress={item.onPress} style={styles.sheetItem} activeOpacity={0.8}>
                  <View style={[styles.sheetIcon, { backgroundColor: accentContainer }]}>
                    <Ionicons name={item.icon} size={24} color={accentColor} />
                  </View>
                  <Text style={styles.sheetLabel}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesContainer: {
    paddingHorizontal: 6,
    paddingBottom: 8,
  },
  bubbleLeft: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderBottomLeftRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginBottom: 2,
  },
  bubbleRight: {
    borderRadius: 18,
    borderBottomRightRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginBottom: 2,
  },
  bubbleTextLeft: {
    color: "#2B2530",
    fontFamily: "Regular",
    fontSize: SIZES.small + 1,
    lineHeight: 21,
  },
  bubbleTextRight: {
    color: "#FFFFFF",
    fontFamily: "Regular",
    fontSize: SIZES.small + 1,
    lineHeight: 21,
  },
  messageImageWrap: {
    padding: 2,
  },
  messageImage: {
    width: 220,
    height: 165,
    borderRadius: 14,
  },
  timeLeft: {
    color: "#A9A4AE",
    fontFamily: "Regular",
    fontSize: 10,
  },
  timeRight: {
    color: "rgba(255,255,255,0.8)",
    fontFamily: "Regular",
    fontSize: 10,
  },
  dayWrapper: {
    alignSelf: "center",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    marginVertical: 10,
  },
  dayText: {
    fontFamily: "SBold",
    fontSize: 11,
    color: "#7A737F",
    textTransform: "capitalize",
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  toolbar: {
    borderTopWidth: 0,
    paddingHorizontal: 12,
    paddingTop: 6,
  },
  toolbarPrimary: {
    alignItems: "flex-end",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingLeft: 6,
    paddingRight: 6,
    paddingVertical: 6,
    borderWidth: 1.5,
    borderColor: "#F0ECF2",
  },
  attachButton: {
    alignSelf: "flex-end",
    marginBottom: 3,
    marginRight: 2,
  },
  textInput: {
    flex: 1,
    fontFamily: "Regular",
    fontSize: SIZES.small + 1,
    color: "#2B2530",
    lineHeight: 20,
    maxHeight: 110,
    paddingTop: 8,
    paddingBottom: 8,
    marginRight: 6,
  },
  sendContainer: {
    justifyContent: "flex-end",
    alignSelf: "flex-end",
    marginBottom: 2,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  recording: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingLeft: 14,
    minHeight: 50,
  },
  recDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#E24C6B",
  },
  recText: {
    flex: 1,
    fontFamily: "SBold",
    fontSize: SIZES.small,
    color: "#2B2530",
  },
  recCancel: {
    paddingHorizontal: 6,
  },
  uploadBanner: {
    position: "absolute",
    top: 110,
    alignSelf: "center",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  uploadText: {
    fontFamily: "SBold",
    fontSize: SIZES.small - 1,
  },
  emptyOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 36,
  },
  emptySkeleton: {
    width: "100%",
    gap: 10,
  },
  emptyAvatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 3,
    marginBottom: 12,
  },
  emptyTitle: {
    fontFamily: "Bold",
    fontSize: SIZES.medium + 2,
    color: "#2B2530",
  },
  emptySubtitle: {
    fontFamily: "Regular",
    fontSize: SIZES.small,
    color: "#8E8793",
    marginTop: 2,
  },
  emptyHint: {
    fontFamily: "Regular",
    fontSize: SIZES.small,
    color: "#7A737F",
    textAlign: "center",
    lineHeight: 20,
    marginTop: 14,
  },
  deletedBubble: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E4DEE6",
    backgroundColor: "#FBFAFC",
    marginBottom: 2,
  },
  deletedLeft: {
    borderBottomLeftRadius: 6,
  },
  deletedRight: {
    borderBottomRightRadius: 6,
    alignSelf: "flex-end",
  },
  deletedText: {
    fontFamily: "Regular",
    fontStyle: "italic",
    fontSize: SIZES.small,
    color: "#A9A4AE",
  },
  textWrap: {
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: 2,
  },
  edited: {
    fontFamily: "Regular",
    fontSize: 10,
    marginTop: 2,
  },
  ticks: {
    marginLeft: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 12,
    marginTop: 4,
    marginBottom: 6,
    paddingHorizontal: 14,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    backgroundColor: "#FFFFFF",
  },
  searchInput: {
    flex: 1,
    fontFamily: "Regular",
    fontSize: SIZES.small + 1,
    color: "#2B2530",
    paddingVertical: 0,
  },
  mark: {
    fontFamily: "SBold",
    borderRadius: 3,
  },
  markOnWhite: {
    backgroundColor: "#FFE58A",
    color: "#2B2530",
  },
  markOnAccent: {
    backgroundColor: "rgba(255,255,255,0.35)",
    color: "#FFFFFF",
  },
  markCurrent: {
    backgroundColor: "#FFB300",
    color: "#2B2530",
  },
  bubbleCurrent: {
    borderWidth: 2,
    borderColor: "#FFB300",
  },
  searchCount: {
    fontFamily: "SBold",
    fontSize: SIZES.small - 2,
    color: "#8E8793",
  },
  editBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 12,
    marginTop: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  editBannerText: {
    flex: 1,
    fontFamily: "SBold",
    fontSize: SIZES.small - 1,
  },
  sheetPreview: {
    fontFamily: "Regular",
    fontSize: SIZES.small,
    color: "#7A737F",
    textAlign: "center",
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  sheetAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F0F4",
  },
  sheetActionText: {
    fontFamily: "SBold",
    fontSize: SIZES.small + 1,
    color: "#2B2530",
  },
  sheetOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 18,
    paddingHorizontal: 24,
  },
  sheetTitle: {
    fontFamily: "Bold",
    fontSize: SIZES.medium,
    color: "#2B2530",
    textAlign: "center",
    marginBottom: 18,
  },
  sheetRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  sheetItem: {
    alignItems: "center",
    gap: 8,
  },
  sheetIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetLabel: {
    fontFamily: "SBold",
    fontSize: SIZES.small - 1,
    color: "#5C5661",
  },
});
