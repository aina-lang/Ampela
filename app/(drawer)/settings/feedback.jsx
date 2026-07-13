import AppHeader from "@/components/AppHeader";
import { useNavigation } from "expo-router";
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from "react-native";
import { SIZES, COLORS } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "@legendapp/state/react";
import { preferenceState } from "@/legendstate/AmpelaStates";
import { useDiscoveryTheme } from "@/components/discovery";
import DiscoveryCard from "@/components/discovery/DiscoveryCard";

const feedback = () => {
  const navigation = useNavigation();
  const { theme } = useSelector(() => preferenceState.get());
  const { surface, accentColor } = useDiscoveryTheme();

  const handlePress = (url) => {
    Linking.openURL(url);
  };

  const contacts = [
    {
      key: "facebook",
      label: "Ampela",
      url: "https://www.facebook.com/ampela",
      icon: "logo-facebook",
      color: "#3b5998",
    },
    {
      key: "email",
      label: "contact@ampela.com",
      url: "mailto:contact@ampela.com",
      icon: "mail-outline",
      color: "#D44638",
    },
    {
      key: "web",
      label: "www.ampela.com",
      url: "https://www.ampela.com",
      icon: "globe-outline",
      color: "#0000EE",
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: surface }]}>
      <AppHeader navigation={navigation} title="Feed-back" showBack absolute />
      <View style={styles.content}>
        <Text style={[styles.title, { color: COLORS.primary }]}>Contactez les développeurs</Text>
        <DiscoveryCard style={styles.card}>
          {contacts.map((item, index) => (
            <View key={item.key}>
              <TouchableOpacity
                style={styles.contactRow}
                onPress={() => handlePress(item.url)}
                activeOpacity={0.7}
              >
                <View style={styles.left}>
                  <View style={styles.iconWrapper}>
                    <Ionicons name={item.icon} size={18} color={item.color} />
                  </View>
                  <Text style={[styles.contactText, { color: COLORS.primary }]}>{item.label}</Text>
                </View>
                <Ionicons name="open-outline" size={16} color={COLORS.neutral400} />
              </TouchableOpacity>
              {index < contacts.length - 1 && (
                <View style={styles.divider} />
              )}
            </View>
          ))}
        </DiscoveryCard>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 200,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontFamily: "SBold",
    fontSize: 20,
    marginBottom: 20,
  },
  card: {
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconWrapper: {
    width: 32,
    alignItems: "center",
  },
  contactText: {
    fontFamily: "Regular",
    fontSize: SIZES.small,
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
  },
});

export default feedback;
