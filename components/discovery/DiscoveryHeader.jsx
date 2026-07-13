import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useDiscoveryTheme } from "./DiscoveryTheme";

const DiscoveryHeader = ({ eyebrow, title, subtitle, accentColor }) => {
  const { text, accentColor: themeAccent } = useDiscoveryTheme();
  const color = accentColor || themeAccent;

  return (
    <View style={styles.header}>
      <Text style={[text.eyebrow, { color }]}>{eyebrow}</Text>
      <Text style={text.title}>{title}</Text>
      {subtitle && <Text style={text.subtitle}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: 28,
  },
});

export default DiscoveryHeader;
