import React from "react";
import { View, StyleSheet } from "react-native";
import { Skeleton } from "@/components/ui";

/** Carte fantôme affichée pendant le chargement des publications. */
export const ForumPostSkeleton = () => (
  <View style={styles.card}>
    <View style={styles.header}>
      <Skeleton width={44} height={44} radius={22} />
      <View style={styles.headerLines}>
        <Skeleton width="45%" height={12} />
        <Skeleton width="30%" height={10} style={{ marginTop: 8 }} />
      </View>
    </View>
    <Skeleton width="85%" height={18} style={{ marginTop: 18 }} />
    <Skeleton width="100%" height={12} style={{ marginTop: 14 }} />
    <Skeleton width="95%" height={12} style={{ marginTop: 8 }} />
    <Skeleton width="60%" height={12} style={{ marginTop: 8 }} />
    <View style={styles.actions}>
      <Skeleton width={96} height={34} radius={17} />
      <Skeleton width={128} height={34} radius={17} />
    </View>
  </View>
);

/** Liste de cartes fantômes (3 par défaut). */
const ForumSkeleton = ({ count = 3 }) => (
  <View style={styles.list}>
    {Array.from({ length: count }).map((_, i) => (
      <ForumPostSkeleton key={i} />
    ))}
  </View>
);

const styles = StyleSheet.create({
  list: {
    padding: 12,
    gap: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerLines: {
    flex: 1,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
});

export default ForumSkeleton;
