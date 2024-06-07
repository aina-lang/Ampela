import { useRef, useContext, useState, useEffect } from "react";
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  TextInput,
  TextArea,
  ActivityIndicator,
} from "react-native";

import HeaderForum from "@/components/header-forum";
import ForumItem from "@/components/forum-item";
// import { ThemeContext } from "@/components/theme-context";
import { COLORS, SIZES } from "@/constants";
import BackgroundContainer from "@/components/background-container";

import { addNewPost } from "@/services/firestoreAPI";
import { getAuth } from "firebase/auth";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { database } from "@/services/firebaseConfig";
import { Link, useNavigation } from "expo-router";
import SearchForum from "@/components/SearchForum";
import { AntDesign, Ionicons } from "@expo/vector-icons";

const index = () => {
  const navigation = useNavigation();
  const screenWidth = Dimensions.get("window").width + 200;
  const translateXAnim = useRef(new Animated.Value(screenWidth)).current;
  const [newPostContent, setNewPostContent] = useState("");
  const [posts, setPosts] = useState([{},{},{}]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isInputsDisabled, setIsInputsDisabled] = useState(false);

  // useEffect(() => {
  //   const unsubscribe = onSnapshot(
  //     query(collection(database, "posts"), orderBy("createdAt", "desc")),
  //     (snapshot) => {
  //       const newPosts = snapshot.docs.map((doc) => doc.data());

  //       setPosts(newPosts);
  //     }
  //   );

  //   return () => unsubscribe();
  // }, []);

  const handleAskQuestionBtnPress = () => {
    // Animated.timing(translateXAnim, {
    //   toValue: 0,
    //   duration: 0,
    //   useNativeDriver: true,
    // }).start();
    navigation.navigate("(drawer)/(forum)");
  };

  const handleCancelBtnPress = () => {
    setIsInputsDisabled(false);
    Animated.timing(translateXAnim, {
      toValue: screenWidth,
      duration: 0,
      useNativeDriver: true,
    }).start();
  };

  const handleSendBtnPress = async () => {
    setIsInputsDisabled(true);
    setIsLoading(true);
    const newPostData = {
      content: newPostContent,
      authorId: getAuth().currentUser.uid,
      like: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      const response = await addNewPost(newPostData);
      if (response && response.msg === "no-auth") {
        console.log("L'utilisateur n'est pas authentifié.");
      } else {
        console.log("Nouveau post ajouté avec succès.");

        setIsFormOpen(false);
        setNewPostContent("");

        Animated.timing(translateXAnim, {
          toValue: screenWidth,
          duration: 0,
          useNativeDriver: true,
        }).start();
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout du nouveau post : ", error);
    } finally {
      setIsInputsDisabled(false);
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <BackgroundContainer paddingBottom={0} paddingHorizontal={2}>
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        )}

        <View className=" pt-5 pb-10 px-5" style={{ height: SIZES.height * 0.2 }}>
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
        <View className="h-8" />
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="p-3 mx-auto scroll-pb-20"
          style={{ width:"100%" }}
        >
          {posts.map((post, index) => (
            <ForumItem key={index} post={post} navigation={navigation} />
          ))}
        </ScrollView>
      </BackgroundContainer>
    </View>
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
