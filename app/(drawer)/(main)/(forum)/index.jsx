import { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from "react-native";
import ForumItem from "@/components/forum-item";
import { COLORS, SIZES } from "@/constants";
import BackgroundContainer from "@/components/background-container";
import { auth } from "@/services/firebaseConfig";
import { Link, useNavigation } from "expo-router";
import SearchForum from "@/components/SearchForum";
import { AntDesign } from "@expo/vector-icons";
import AuthContent from "@/components/AuthContent";
import { useBottomSheet } from "@/hooks/BottomSheetProvider";

const index = () => {
  const navigation = useNavigation();
  const [posts, setPosts] = useState([{}, {}, {}]);
  const [isLoading, setIsLoading] = useState(false);

  const { openBottomSheet } = useBottomSheet();

  useEffect(() => {
    if (!auth.currentUser) {
      openBottomSheet(<AuthContent />);
    }
  }, []);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <SafeAreaView style={styles.container}>
        <BackgroundContainer paddingBottom={80} paddingHorizontal={2}>
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          )}

          <View
            className=" pt-3 pb-10 px-4"
            style={{ height: SIZES.height * 0.2 }}
          >
            <View className="flex-row justify-between items-center p-2 ">
              <Link
                href={"(drawer)/(forum)/addpost"}
                className="flex-row space-x-2 p-2 bg-white rounded-md shadow-sm shadow-black"
              >
                <AntDesign name="edit" size={24} color={COLORS.accent600} />
                <Text>Posez des questions</Text>
              </Link>
            </View>
            <SearchForum />
          </View>
          <View className="h-2" />
          <ScrollView
            showsVerticalScrollIndicator={false}
            className="p-3 mx-auto scroll-pb-20"
            style={{ width: "100%" }}
          >
            {posts.map((post, index) => (
              <ForumItem key={index} post={post} navigation={navigation} />
            ))}
          </ScrollView>
        </BackgroundContainer>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    position: "absolute",
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    zIndex: 30001,
  },
  box: {
    width: "90%",
    height: 316,
    backgroundColor: COLORS.neutral100,
    borderRadius: 10,
    marginTop: 90,
    marginLeft: "5%",
  },
  btnBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    position: "absolute",
    bottom: 20,
    width: "100%",
  },
  btnInsideBox: {
    width: 138,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 99,
  },
  askQuestionTextInput: {
    width: "90%",
    marginLeft: "5%",
    marginTop: 20,
    borderWidth: 2,
    borderColor: COLORS.neutral200,
    height: 200,
    borderRadius: 10,
    fontFamily: "Medium",
    padding: 10,
  },
  container: {
    flex: 1,
  },
  btn: {
    width: "100%",
    height: 44,
    borderRadius: 99,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  textBtn: {
    color: COLORS.neutral100,
    fontFamily: "Bold",
    // fontSize: RFValue(SIZES.small),
  },
});

export default index;
