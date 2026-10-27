import React from "react";
import { Stack } from "expo-router";

const Layout = () => {
  return (
    <Stack
      screenOptions={{
        // L'écran article gère son propre header flottant (effet sliver :
        // bouton retour transparent + barre qui apparaît au scroll).
        headerShown: false,
      }}
    />
  );
};

export default Layout;
