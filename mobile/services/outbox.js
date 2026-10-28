import { observable } from "@legendapp/state";
import { persistObservable } from "@legendapp/state/persist";
import { useSelector } from "@legendapp/state/react";
import { sendMessage } from "@/services/messagesAPI";
import { isSignedIn } from "@/services/api";

/**
 * File d'attente des messages texte écrits hors ligne. Un message qui ne
 * part pas (pas de réseau) est gardé ici, affiché tout de suite dans la
 * conversation avec une horloge, puis envoyé dès que possible : retour du
 * réseau, retour de l'app au premier plan, ou prochaine ouverture.
 */
const outboxState = observable({ items: [] });
persistObservable(outboxState, { local: "outbox" });

const listeners = new Set();
const emit = (event) => listeners.forEach((l) => l(event));

/** Écoute `{ type: "sent", localId, saved }` ou `{ type: "failed", localId }`. */
export const subscribeToOutbox = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** Un message est mis en attente seulement s'il est purement textuel. */
export const isQueueable = (payload) => !!payload?.text && !payload.attachmentUrl;

export const enqueueMessage = (targetId, payload) => {
  const item = {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    targetId,
    payload,
    createdAt: new Date().toISOString(),
  };
  outboxState.items.set((items) => [...(items || []), item]);
  return item;
};

export const pendingFor = (targetId) =>
  (outboxState.items.get() || []).filter((item) => item.targetId === targetId);

export const usePendingFor = (targetId) =>
  useSelector(() => (outboxState.items.get() || []).filter((item) => item.targetId === targetId));

const remove = (id) => outboxState.items.set((items) => (items || []).filter((i) => i.id !== id));

let flushing = null;

/** Envoie la file dans l'ordre ; s'arrête au premier échec réseau. */
export const flushOutbox = () => {
  if (!isSignedIn()) return Promise.resolve();
  if (flushing) return flushing;
  flushing = (async () => {
    try {
      for (const item of [...(outboxState.items.get() || [])]) {
        try {
          const saved = await sendMessage(item.targetId, item.payload);
          remove(item.id);
          emit({ type: "sent", localId: item.id, saved });
        } catch (error) {
          if (!error?.status) return; // réseau : on réessaiera plus tard
          remove(item.id); // refusé par le serveur : inutile d'insister
          emit({ type: "failed", localId: item.id, error });
        }
      }
    } finally {
      flushing = null;
    }
  })();
  return flushing;
};
