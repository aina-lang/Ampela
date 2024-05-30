import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import { SafeAreaView } from "react-native";

export default function TabLayout() {
  return (
    <SafeAreaView>
      <Tabs
        screenOptions={{ tabBarActiveTintColor: "#FF7575", headerShown: false }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => (
              <FontAwesome size={28} name="home" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="calendarScreen"
          options={{
            title: "calendarScreen",
            tabBarIcon: ({ color }) => (
              <FontAwesome size={28} name="cog" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="setting"
          options={{
            title: "Setting",
            tabBarIcon: ({ color }) => (
              <FontAwesome size={28} name="cog" color={color} />
            ),
          }}
        />
     
      </Tabs>
    </SafeAreaView>
  );
}
