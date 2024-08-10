import { COLORS, icons, images } from "@/constants";
import i18n from "@/constants/i18n";
import { preferenceState } from "@/legendstate/AmpelaStates";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { useSelector } from "@legendapp/state/react";
import { Image } from "expo-image";
import { router, useRouter } from "expo-router";
import { getAuth } from "firebase/auth";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

const oneForum = () => {
  const [comments, setComments] = useState([1, 1, 1, 1, 1, 1, 1, 1, 1, 1]);
  const [commentValue, setCommentValue] = useState("");
  const { theme } = useSelector(() => preferenceState.get());

  const handleSendComment = () => {
    if (commentValue.trim()) {
      setComments([...comments, { id: Date.now(), text: commentValue }]);
      setCommentValue("");
    }
  };

  return (
    <>
      <View className="flex-row justify-between z-50 items-center p-3 bg-gray-200">
        <View className="flex-row space-x-2 items-center">
          <Image
            source={images.avatar}
            style={{ height: 40, width: 40, borderRadius: 100 }}
          />
          <Text>Aina mercia</Text>
        </View>
        <Text>20 octobre 2041</Text>
      </View>
      <View className="flex-row  z-50 items-center p-3 bg-gray-200 justify-end">
        <View className="flex-row space-x-2 items-center ">
          <AntDesign name={"heart"} color={COLORS.accent600} size={24} />
          <Text>30 </Text>
        </View>
        <View className="flex-row space-x-2 ml-2">
          <Image source={icons.message} style={{ height: 20, width: 20 }} />
          <Text>20 </Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View>
          <Text style={{ fontSize: 24, fontWeight: "bold", marginTop: 10 }}>
            Lorem ipsum dolor sit amet consectetur, adipisicing elit. ?
          </Text>
          <Text style={{ marginBottom: 10, marginTop: 10 }}>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Sequi
            similique ad cum aspernatur unde enim soluta tempora cumque possimus
            optio magnam ducimus facilis in mollitia tenetur beatae alias,
          </Text>
        </View>
        <View>
          <View
            className="flex-row items-center space-x-4"
            style={{ marginBottom: 10, marginTop: 20 }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
              }}
            >
              Commentaires
            </Text>
            <View className="flex-grow h-[1px] rounded-full bg-gray-400" />
          </View>
          {comments.map((comment, index) => (
            <View key={index} style={styles.commentContainer}>
              <View className="flex-row justify-between z-50 items-center mb-2">
                <View
                  className="flex-row space-x-2 items-center"
                  style={{ backgroundColor: "#f0f0f0" }}
                >
                  <Image
                    source={images.avatar}
                    style={{ height: 40, width: 40, borderRadius: 100 }}
                  />
                  <Text>Aina mercia</Text>
                </View>
                <Text>20 octobre 2041</Text>
              </View>
              <Text className="p-2">
                Lorem ipsum, dolor sit amet consectetur adipisicing elit.
                Accusamus vel nobis nihil assumenda quis dignissimos laborum,
                similique minima inventore ratione vitae obcaecati eaque nam?
                Esse odit iusto optio recusandae quod.
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
      {getAuth().currentUser && (
        <View
          style={styles.inputToolbarContainer}
          className="shadow-md shadow-black bg-white w-[90%] rounded-md  -top-3 flex-row"
        >
          <TextInput
            multiline
            placeholder={i18n.t("ecrireUnCommentaire")}
            style={styles.commentInput}
            value={commentValue}
            onChangeText={setCommentValue}
          />
          <TouchableOpacity
            className="items-center justify-center"
            onPress={handleSendComment}
          >
            <Ionicons
              name="send"
              size={20}
              color={theme === "orange" ? COLORS.accent800 : COLORS.accent500}
            />
          </TouchableOpacity>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  commentContainer: {
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  commentInput: {
    padding: 10,
    width: "90%",
  },
  inputToolbarContainer: {
    bottom: 0,
    marginHorizontal: "auto",
  },
});

export default oneForum;
