import { COLORS, SIZES } from "@/constants";
import { ThemeContext } from "@/hooks/theme-context";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useNavigation } from "expo-router";
import React, { useState, useCallback, useEffect, useContext } from "react";
import {
  SafeAreaView,
  Text,
  Touchable,
  TouchableOpacity,
  View,
} from "react-native";
import { GiftedChat, InputToolbar, Send } from "react-native-gifted-chat";

export default function onemessage() {
  const [messages, setMessages] = useState([]);
  const navigation = useNavigation();
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    setMessages([
      {
        _id: 1,
        text: "Hello developer",
        createdAt: new Date(),
        user: {
          _id: 2,
          name: "Re",
        },
      },
    ]);
  }, []);

  const onSend = useCallback((messages = []) => {
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, messages)
    );
  }, []);

  const customtInputToolbar = (props) => {
    return (
      <View
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "95%",
          padding: 20,
          alignSelf: "center",
        }}
        className="shadow-md shadow-black "
      >
        <InputToolbar
          {...props}
          containerStyle={{
            backgroundColor:
              "pink" === "pink" ? "white" : "rgba(196, 196, 196, .2)",
            borderTopWidth: 0,
            borderRadius: 98,
            paddingHorizontal: 10,
          }}
        />
      </View>
    );
  };

  return (
    <>
      <View
        className=" w-full flex-row items-center pt-8  rounded-b-lg justify-between  shadow-md shadow-black"
        style={{
          backgroundColor:   theme=== "orange" ? COLORS.accent800 : COLORS.accent500,
          height: SIZES.height * 0.16,
          paddingHorizontal: 16,
        }}
      >
        <View className="flex flex-row  items-center justify-center ">
          <TouchableOpacity
            className="p-2 pl-0 mr-3"
            onPress={() => navigation.goBack()}
          >
            <AntDesign name="left" color={"white"} size={24} />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: "bold", color: "white" }}>
            Aina
          </Text>
        </View>
        <TouchableOpacity
          className="p-2 pl-0 "
          onPress={() => navigation.navigate("(message)")}
        >
          <AntDesign name="setting" color={"white"} size={24} />
        </TouchableOpacity>
      </View>

      <GiftedChat
        messages={messages}
        onSend={(messages) => onSend(messages)}
        user={{
          _id: 0,
        }}
        renderInputToolbar={(props) => customtInputToolbar(props)}
        renderSend={(props) => {
         
          // console.log(props.text);
          const { text, messageIdGenerator, user, onSend } = props;
          console.log(messageIdGenerator);
          return (
            text != "" && (
              <TouchableOpacity
                onPress={() => {
                  if (text && onSend) {
                    onSend(
                      {
                        text: text.trim(),
                        user: user,
                        _id: 1,
                      },
                      true
                    );
                  }
                }}
                className={` h-full items-center justify-center w-[40px] rounded-md`}
              >
                <AntDesign
                  name="arrowright"
                  size={24}
                  color={"rgb(248 113 113)"}
                />
                <Send/>
              </TouchableOpacity>
            )
          );
        }}
      />
    </>
  );
}
