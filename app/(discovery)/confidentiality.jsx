import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
} from "react-native";
import { Checkbox } from "expo-checkbox";
import { COLORS, SIZES } from "@/constants";
import { useNavigation } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import ModernButton from "@/components/ModernButton";
import { StatusBar } from "expo-status-bar";

const confidentiality = () => {
  const navigation = useNavigation();
  const { theme } = useSelector(() => preferenceState.get());
  const accentColor = theme === "pink" ? "#FF7575" : "#FE8729";
  const accentColorDisabled = theme === "pink" ? "#FFB5B5" : "#FED4A0";
  const [accepted, setAccepted] = useState(false);

  const handleNextBtnPress = useCallback(() => {
    navigation.navigate("login");
  }, []);

  const prevHandled = () => {
    navigation.goBack();
  };

  const confidentialiteData = [
    {
      title: "Utilisation de vos données",
      description:
        "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quia iusto nemo sunt fuga illum rem sit officia recusandae, magni nobis, nostrum expedita libero ut pariatur explicabo harum. Maxime, voluptatibus fugiat.",
    },
    {
      title: "Confidentialité et sécurité",
      description:
        "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quia iusto nemo sunt fuga illum rem sit officia recusandae, magni nobis, nostrum expedita libero ut pariatur explicabo harum. Maxime, voluptatibus fugiat.",
    },
    {
      title: "Partage avec des tiers",
      description:
        "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quia iusto nemo sunt fuga illum rem sit officia recusandae, magni nobis, nostrum expedita libero ut pariatur explicabo harum. Maxime, voluptatibus fugiat.",
    },
    {
      title: "Durée de conservation",
      description:
        "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quia iusto nemo sunt fuga illum rem sit officia recusandae, magni nobis, nostrum expedita libero ut pariatur explicabo harum. Maxime, voluptatibus fugiat.",
    },
    {
      title: "Vos droits",
      description:
        "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quia iusto nemo sunt fuga illum rem sit officia recusandae, magni nobis, nostrum expedita libero ut pariatur explicabo harum. Maxime, voluptatibus fugiat.",
    },
  ];

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardIcon}>
        <AntDesign name="lock" size={20} color={accentColor} />
      </View>
      <View style={styles.cardTextContainer}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDescription}>{item.description}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.meshBackground}>
        <View style={[styles.blob, { backgroundColor: COLORS.accent500 }]} />
        <View style={[styles.blob, styles.blob2, { backgroundColor: COLORS.accent400 }]} />
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.eyebrow, { color: accentColor }]}>Avant de continuer</Text>
          <Text style={styles.title}>Confidentialité</Text>
          <Text style={styles.subtitle}>
            Nous prenons la protection de vos données très au sérieux
          </Text>
        </View>

        <FlatList
          data={confidentialiteData}
          renderItem={renderItem}
          keyExtractor={(_, i) => String(i)}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.bottomArea}>
          <Pressable
            onPress={() => setAccepted(!accepted)}
            style={[
              styles.acceptRow,
              { borderColor: accepted ? accentColor : "#E5E5E5" },
            ]}
          >
            <Checkbox
              value={accepted}
              onValueChange={setAccepted}
              color={accepted ? accentColor : undefined}
              style={styles.checkbox}
            />
            <Text style={styles.acceptText}>
              J'ai lu et j'accepte les conditions ci-dessus
            </Text>
          </Pressable>

          <View style={styles.navRow}>
            <TouchableOpacity onPress={prevHandled} style={styles.backButton}>
              <AntDesign name="arrowleft" size={16} color="#9E9E9E" />
              <Text style={styles.backButtonText}>Retour</Text>
            </TouchableOpacity>

            <View style={{ flex: 1 }} />

            <ModernButton
              title="Continuer"
              onPress={handleNextBtnPress}
              disabled={!accepted}
              accentColor={accentColor}
              accentColorDisabled={accentColorDisabled}
              style={{ flex: 1, marginLeft: 12 }}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral100,
  },
  meshBackground: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  blob: {
    position: "absolute",
    width: 400,
    height: 400,
    borderRadius: 200,
    opacity: 0.05,
    top: -100,
    right: -100,
  },
  blob2: {
    width: 300,
    height: 300,
    bottom: 150,
    left: -100,
    top: undefined,
    right: undefined,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  header: {
    marginBottom: 24,
  },
  eyebrow: {
    fontFamily: "SBold",
    fontSize: SIZES.small,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: COLORS.accent500,
    marginBottom: 10,
  },
  title: {
    fontFamily: "Bold",
    fontSize: SIZES.width * 0.075,
    color: "#1A1A1A",
    lineHeight: SIZES.width * 0.09,
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: "Regular",
    fontSize: SIZES.small,
    color: "#8A8A8A",
    lineHeight: 20,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 16,
    gap: 12,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    gap: 14,
  },
  cardIcon: {
    marginTop: 2,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: "SBold",
    fontSize: SIZES.medium,
    color: "#1A1A1A",
    marginBottom: 6,
  },
  cardDescription: {
    fontFamily: "Regular",
    fontSize: SIZES.small,
    lineHeight: 20,
    color: "#7A7A7A",
  },
  bottomArea: {
    paddingBottom: 32,
    paddingTop: 16,
  },
  acceptRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
  },
  checkbox: {
    borderRadius: 6,
  },
  acceptText: {
    flex: 1,
    fontFamily: "Regular",
    fontSize: SIZES.small,
    color: "#3A3A3A",
    lineHeight: 20,
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    gap: 6,
  },
  backButtonText: {
    color: "#9E9E9E",
    fontSize: 15,
    fontFamily: "SBold",
  },
});

export default confidentiality;
