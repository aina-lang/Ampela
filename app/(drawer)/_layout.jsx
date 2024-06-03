import { Drawer } from "expo-router/drawer";

export default function drawer() {
  return (
    <Drawer screenOptions={{ headerShown: false,
    // drawerItemStyle:{display:"none"} 
    }}>
      {/* <Drawer.Screen
        name="setting"
        options={{ drawerStyle: { display: "none" } }}
      /> */}
    </Drawer>
  );
}
