import { COLORS, SIZES, images } from "@/constants";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { Drawer } from "expo-router/drawer";
import { Image, Text, View } from "react-native";

export default function drawer() {
  return (
    <Drawer
      screenOptions={{
        headerShown: false,
        // drawerItemStyle:{display:"none"}
      }}
      drawerContent={(props) => {
        return (
          <DrawerContentScrollView {...props}>
            <View
              className="w-full   -top-10 justify-center items-center space-y-2"
              style={{
                backgroundColor: COLORS.neutral200,
                height: SIZES.height * 0.4,
              }}
            >
              <Image
                source={images.doctor01}
                height={80}
                width={80}
                resizeMode="cover"
                className="rounded-full mb-3"
              />

              <Text className="text-[16px] font-bold">RAFANDEFRANA Maminiaina Mercia</Text>
              <Text>Sage femme</Text>
            </View>

            <DrawerItem label={"test"} />
          </DrawerContentScrollView>
        );
      }}
    >
      {/* <Drawer.Screen
        name="setting"
        options={{ drawerStyle: { display: "none" } }}
      /> */}
    </Drawer>
  );
}
