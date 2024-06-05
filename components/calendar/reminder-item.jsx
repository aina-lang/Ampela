import { useState } from "react";
import { View, Text, Switch, StyleSheet, TouchableOpacity } from "react-native";
import { COLORS, SIZES } from "../../constants";

const ReminderItem = ({ as, time, onPress, howmanytimeReminder }) => {
  const [isEnabled, setIsEnabled] = useState(false);

  const toggleSwitch = () => {
    setIsEnabled((v) => !v);
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.container}
      className="shadow-sm shadow-black"
    >
      <View style={styles.left}>
        <Text style={styles.textRegular}>{as}</Text>
        <View style={styles.time}>
          <Text style={styles.textMedium}>
            {time?.hour.toString().padStart(2, "0")}
          </Text>
          <Text style={styles.textMedium}>{":"}</Text>
          <Text style={styles.textMedium}>
            {time?.minutes.toString().padStart(2, "0")}
          </Text>
        </View>
        <Text style={styles.textRegular}>Rappeler: {howmanytimeReminder}</Text>
      </View>
      <View>
        <Switch
          trackColor={{
            false: "pink" === "pink" ? COLORS.neutral200 : COLORS.neutral250,
            true: "pink" === "pink" ? COLORS.accent600 : COLORS.accent800,
          }}
          thumbColor={isEnabled ? COLORS.neutral100 : COLORS.neutral100}
          ios_backgroundColor={COLORS.neutral200}
          onValueChange={toggleSwitch}
          value={isEnabled}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.neutral100,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  left: {
    gap: 12,
    alignItems: "flex-start",
  },
  time: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginLeft: 20,
  },
  textRegular: {
    fontFamily: "Regular",
    fontSize: SIZES.medium,
  },
  textMedium: {
    fontFamily: "Medium",
    fontSize: SIZES.large,
  },
});

export default ReminderItem;
