import { useState, useCallback } from "react";
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
import i18n from "@/constants/i18n";

const confidentiality = () => {
  const navigation = useNavigation();
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
      title: "Confidentialité et sécurité",
      description:
        "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quia iusto nemo sunt fuga illum rem sit officia recusandae, magni nobis, nostrum expedita libero ut pariatur explicabo harum. Maxime, voluptatibus fugiat.",
    },
      {
      title: "Confidentialité et sécurité",
      description:
        "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quia iusto nemo sunt fuga illum rem sit officia recusandae, magni nobis, nostrum expedita libero ut pariatur explicabo harum. Maxime, voluptatibus fugiat.",
    },
      {
      title: "Confidentialité et sécurité",
      description:
        "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quia iusto nemo sunt fuga illum rem sit officia recusandae, magni nobis, nostrum expedita libero ut pariatur explicabo harum. Maxime, voluptatibus fugiat.",
    },
      {
      title: "Confidentialité et sécurité",
      description:
        "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quia iusto nemo sunt fuga illum rem sit officia recusandae, magni nobis, nostrum expedita libero ut pariatur explicabo harum. Maxime, voluptatibus fugiat.",
    },  {
      title: "Confidentialité et sécurité",
      description:
        "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quia iusto nemo sunt fuga illum rem sit officia recusandae, magni nobis, nostrum expedita libero ut pariatur explicabo harum. Maxime, voluptatibus fugiat.",
    },
  ];

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardDescription}>{item.description}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Avant de continuer</Text>
        <Text style={styles.title}>{i18n.t("confidentialite")}</Text>
      </View>

      {/* Liste des sections */}
      <FlatList
        data={confidentialiteData}
        renderItem={renderItem}
        keyExtractor={(_, i) => String(i)}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Acceptation */}
      <Pressable
        onPress={() => setAccepted(!accepted)}
        style={[
          styles.acceptRow,
          { borderColor: accepted ? "#FF7575" : "#E5E5E5" },
        ]}
      >
        <Checkbox
          value={accepted}
          onValueChange={setAccepted}
          color={accepted ? "#FF7575" : undefined}
          style={styles.checkbox}
        />
        <Text style={styles.acceptText}>
          J'ai lu et j'accepte les conditions ci-dessus
        </Text>
      </Pressable>

      {/* Navigation */}
      <View style={styles.btnBox}>
        <TouchableOpacity onPress={prevHandled} style={styles.backButton}>
          <AntDesign name="arrow-left" size={16} color="#9E9E9E" />
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleNextBtnPress}
          disabled={!accepted}
          activeOpacity={0.85}
          style={[
            styles.nextBtn,
            { backgroundColor: accepted ? "#FF7575" : "#EFEFEF" },
          ]}
        >
          <Text
            style={[
              styles.nextBtnText,
              { color: accepted ? COLORS.neutral100 : "#B0B0B0" },
            ]}
          >
            Suivant
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral100,
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 70,
    paddingBottom: 20,
  },
  eyebrow: {
    color: "#FF7575",
    fontFamily: "SBold",
    fontSize: SIZES.small,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  title: {
    fontFamily: "Bold",
    fontSize: SIZES.width * 0.07,
    color: "#1A1A1A",
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 12,
    gap: 14,
  },
  card: {
    backgroundColor: "#FAFAFA",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  cardTitle: {
    fontFamily: "SBold",
    fontSize: SIZES.medium,
    color: "#1A1A1A",
    marginBottom: 8,
  },
  cardDescription: {
    fontFamily: "Regular",
    fontSize: SIZES.small,
    lineHeight: 21,
    color: "#7A7A7A",
  },
  acceptRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 14,
    marginTop: 14,
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
  btnBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 20,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  backButtonText: {
    color: "#9E9E9E",
    fontSize: 15,
    fontFamily: "SBold",
    marginLeft: 6,
  },
  nextBtn: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
  },
  nextBtnText: {
    fontFamily: "SBold",
    fontSize: SIZES.medium,
  },
});

export default confidentiality;