import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { COLORS, SIZES } from "@/constants";

const MessageItem = ({
  urlImg,
  name,
  job,
  lastMessage,
  onPress,
  actifIndicator,
}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View className={`border border-gray-100 rounded-full relative`}>
        <Image
          source={urlImg}
          style={{ width: 50, height: 50, borderRadius: 100 }}
        />

        <View
          className={`w-[10px] ${
            actifIndicator ? "bg-green-500" : "bg-gray-500 "
          } h-[10px] absolute rounded-full left-1`}
        />
        {/* <View className="w-[10px] bg-gray-500 h-[10px] absolute rounded-full left-1" /> */}
      </View>
      <View style={{ marginLeft: 15 }}>
        <View style={{ display: "flex", flexDirection: "row" }}>
          <Text style={{ fontFamily: "Regular", fontSize: SIZES.medium }}>
            {name}
          </Text>
          <Text style={{ fontSize: SIZES.medium, color: COLORS.neutral400 }}>
            {" | "}
          </Text>
          <Text
            style={{
              color: COLORS.neutral400,
              fontFamily: "Regular",
              fontSize: SIZES.xSmall,
              textAlignVertical: "center",
            }}
          >
            {job}
          </Text>
        </View>
        <View>
          {lastMessage && (
            <Text
              style={{
                fontFamily: "Regular",
                fontSize: SIZES.small,
                color: COLORS.neutral400,
                marginTop: 5,
              }}
              numberOfLines={1}
            >
              {lastMessage}
              {/* {lastMessage.length > 20
                ? lastMessage.substring(0, 20) + "..."
                : lastMessage} */}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 40,
    marginLeft: 15,
  },
});

export default MessageItem;
