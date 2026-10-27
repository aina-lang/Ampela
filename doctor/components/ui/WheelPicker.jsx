import React, { useMemo, useRef, useState } from "react";
import { View, Text, Animated, StyleSheet } from "react-native";
import { useDiscoveryTheme } from "@/components/discovery/DiscoveryTheme";

const ITEM_HEIGHT = 44;
const VISIBLE = 3; // nombre de lignes visibles (impair : une au centre)

/**
 * Roue de sélection 100 % JS (aucun module natif) : une liste qui
 * s'aimante sur une valeur, avec fondu et réduction des lignes voisines
 * et un cadre coloré au centre, comme un sélecteur d'heure natif.
 *
 * Props : items (tableau de valeurs), value, onChange(value),
 * format(value) → libellé (par défaut la valeur).
 */
const WheelPicker = ({ items, value, onChange, format = String, width = 72 }) => {
  const { accentColor, accentContainer } = useDiscoveryTheme();
  // useState (pas useRef) : la règle React interdit de lire une ref pendant le rendu.
  const [scrollY] = useState(() => new Animated.Value(0));
  const listRef = useRef(null);
  const [ready, setReady] = useState(false);

  const initialIndex = Math.max(0, items.indexOf(value));
  const padding = ((VISIBLE - 1) / 2) * ITEM_HEIGHT;

  // Positionne la roue sur la valeur courante dès que le contenu est
  // mesuré (un setTimeout(0) arrivait avant la mise en page et tombait
  // sur une mauvaise ligne).
  const handleContentSizeChange = () => {
    if (ready) return;
    // ScrollView (pas FlatList) : la méthode est scrollTo.
    listRef.current?.scrollTo({ y: initialIndex * ITEM_HEIGHT, animated: false });
    setReady(true);
  };

  const handleSettle = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.y / ITEM_HEIGHT);
    const clamped = Math.min(items.length - 1, Math.max(0, index));
    if (items[clamped] !== value) onChange?.(items[clamped]);
  };

  const rendered = useMemo(
    () =>
      items.map((item, index) => {
        const center = index * ITEM_HEIGHT;
        const inputRange = [center - ITEM_HEIGHT, center, center + ITEM_HEIGHT];
        const opacity = scrollY.interpolate({
          inputRange,
          outputRange: [0.35, 1, 0.35],
          extrapolate: "clamp",
        });
        const scale = scrollY.interpolate({
          inputRange,
          outputRange: [0.82, 1, 0.82],
          extrapolate: "clamp",
        });
        return (
          <Animated.View
            key={String(item)}
            style={[styles.item, { opacity, transform: [{ scale }] }]}
          >
            <Text style={styles.label}>{format(item)}</Text>
          </Animated.View>
        );
      }),
    [items, scrollY, format]
  );

  return (
    <View style={[styles.wrapper, { width, height: ITEM_HEIGHT * VISIBLE }]}>
      {/* Cadre de la valeur sélectionnée */}
      <View
        pointerEvents="none"
        style={[
          styles.highlight,
          { top: padding, backgroundColor: accentContainer, borderColor: accentColor },
        ]}
      />
      <Animated.ScrollView
        ref={listRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        contentContainerStyle={{ paddingVertical: padding }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        onContentSizeChange={handleContentSizeChange}
        onMomentumScrollEnd={handleSettle}
        nestedScrollEnabled
        onScrollEndDrag={(e) => {
          // Sans inertie (petit geste), on aimante tout de suite.
          if (!e.nativeEvent.velocity || Math.abs(e.nativeEvent.velocity.y) < 0.1) {
            handleSettle(e);
          }
        }}
        scrollEventThrottle={16}
        style={{ opacity: ready ? 1 : 0 }}
      >
        {rendered}
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    overflow: "hidden",
  },
  highlight: {
    position: "absolute",
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  item: {
    height: ITEM_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontFamily: "Bold",
    fontSize: 22,
    color: "#433C47",
  },
});

export default WheelPicker;
