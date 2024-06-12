// import React, { createContext, useEffect } from "react";
// import { usePersistedState, useSelector } from "@legendapp/state/react";
// import AsyncStorage from "@legendapp/state/persist-plugins/async-storage";
// import { preferenceState } from "@/legendstate/AmpelaStates";
// export const ThemeContext = createContext();

// export const ThemeProvider = ({ children }) => {
//   const theme = useSelector(() => preferenceState.get());

//   console.log(theme);
//   useEffect(() => {
//     const updateTheme = async () => {
//       const preferenceData = {
//         theme: theme,
//       };
//       await updatePreference(preferenceData);
//     };

//     updateTheme();
//   }, [theme, dispatch]);

//   return (
//     <ThemeContext.Provider value={{ theme, setTheme }}>
//       {children}
//     </ThemeContext.Provider>
//   );
// };
