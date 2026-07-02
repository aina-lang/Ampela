const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Force Metro to use the `react-native` export condition from package.json
// exports fields. This makes @firebase/auth resolve to dist/rn/index.js
// (the RN-specific bundle) instead of the web bundle, which fixes the
// "Component auth has not been registered yet" error — both initializeAuth
// and getReactNativePersistence end up in the same module instance.
config.resolver.unstable_enablePackageExports = true;
config.resolver.unstable_conditionNames = [
  "react-native",
  "require",
  "default",
];

module.exports = config;
