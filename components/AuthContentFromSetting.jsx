// import React, { useEffect, useRef, useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   StyleSheet,
//   Dimensions,
//   TouchableOpacity,
//   FlatList,
//   Modal,
// } from "react-native";
// import { COLORS } from "@/constants";
// import {
//   auth,
//   database,
//   realtimeDatabase,
//   storage,
// } from "@/services/firebaseConfig";
// import {
//   createUserWithEmailAndPassword,
//   sendEmailVerification,
//   sendPasswordResetEmail,
//   signInWithEmailAndPassword,
// } from "firebase/auth";
// import { getDownloadURL, uploadBytes } from "firebase/storage";
// import { useSelector } from "@legendapp/state/react";
// import {
//   cycleMenstruelState,
//   preferenceState,
//   updateCycleMenstruelData,
//   updateUser,
//   userState,
// } from "@/legendstate/AmpelaStates";
// import Animated, { BounceIn } from "react-native-reanimated";
// import { ref as dbRef, set as dbSet } from "firebase/database";
// import { ref as storageRef } from "firebase/storage";
// import * as FileSystem from "expo-file-system";
// import * as MediaLibrary from "expo-media-library";
// import i18n from "@/constants/i18n";
// import { fetchUserDataFromRealtimeDB } from "@/services/firestoreAPI";
// import { getAllCycle } from "@/services/database";

// const { width } = Dimensions.get("window");

// const AuthContent = ({ closeModal }) => {
//   const user = useSelector(() => userState.get());
//   const [loginEmail, setLoginEmail] = useState("");
//   const [loginPassword, setLoginPassword] = useState("");
//   const [loginError, setLoginError] = useState("");
//   const [signupEmail, setSignupEmail] = useState("");
//   const [signupPassword, setSignupPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [loginEmailError, setLoginEmailError] = useState("");
//   const [loginPasswordError, setLoginPasswordError] = useState("");
//   const [signupEmailError, setSignupEmailError] = useState("");
//   const [signupPasswordError, setSignupPasswordError] = useState("");
//   const [confirmPasswordError, setConfirmPasswordError] = useState("");
//   const [loginErrorPresent, setLoginErrorPresent] = useState(false);
//   const [signupErrorPresent, setSignupErrorPresent] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [isModalVisible, setModalVisible] = useState(false);
//   const [isVerificationModalVisible, setVerificationModalVisible] =
//     useState(false);
//   const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
//   const [forgotPasswordEmailError, setForgotPasswordEmailError] = useState("");

//   const [forgotPasswordModalVisible, setForgotPasswordModalVisible] =
//     useState(false);
//   const [resetEmailSentModalVisible, setResetEmailSentModalVisible] =
//     useState(false);

//   const handleForgotPassword = async () => {
//     await sendPasswordResetEmail(loginEmail);
//     if (!validateEmail(loginEmail)) {
//       setForgotPasswordEmailError("Veuillez saisir une adresse e-mail valide");
//       return;
//     }

//     setLoading(true);
//     try {

//       setForgotPasswordModalVisible(false);
//       setResetEmailSentModalVisible(true);
//     } catch (error) {
//       let errorMessage;
//       console.log(error);
//       switch (error.code) {
//         case "auth/invalid-email":
//           errorMessage = "Adresse e-mail invalide";
//           break;
//         case "auth/user-not-found":
//           errorMessage = "Aucun utilisateur trouvé avec cette adresse e-mail";
//           break;
//         default:
//           errorMessage = "Erreur inconnue, veuillez réessayer";
//       }
//       setForgotPasswordEmailError(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const { theme } = useSelector(() => preferenceState.get());

//   const flatListRef = useRef(null);
//   const { cyclesData } = useSelector(() => cycleMenstruelState.get());
//   const cycles = cyclesData?.cyclesData ? cyclesData?.cyclesData : cyclesData;
//   const handleLoginEmailChange = (text) => {
//     setLoginEmail(text);
//     if (!text) {
//       setLoginEmailError("Veuillez saisir votre adresse e-mail");
//     } else if (!validateEmail(text)) {
//       setLoginEmailError("Veuillez saisir une adresse e-mail valide");
//     } else {
//       setLoginEmailError("");
//     }
//   };

//   const handleLoginPasswordChange = (text) => {
//     setLoginPassword(text);
//     if (!text) {
//       setLoginPasswordError("Veuillez saisir votre mot de passe");
//     } else {
//       setLoginPasswordError("");
//     }
//   };

//   const handleSignupEmailChange = (text) => {
//     setSignupEmail(text);
//     if (!text) {
//       setSignupEmailError("Veuillez saisir votre adresse e-mail");
//     } else if (!validateEmail(text)) {
//       setSignupEmailError("Veuillez saisir une adresse e-mail valide");
//     } else {
//       setSignupEmailError("");
//     }
//   };

//   const handleSignupPasswordChange = (text) => {
//     setSignupPassword(text);
//     if (!text) {
//       setSignupPasswordError("Veuillez saisir votre mot de passe");
//     } else if (!validatePassword(text)) {
//       setSignupPasswordError(
//         "Le mot de passe doit contenir au moins 8 caractères, inclure au moins une majuscule, une minuscule et un chiffre"
//       );
//     } else {
//       setSignupPasswordError("");
//     }
//   };

//   const handleConfirmPasswordChange = (text) => {
//     setConfirmPassword(text);
//     if (!text) {
//       setConfirmPasswordError("Veuillez confirmer votre mot de passe");
//     } else if (text !== signupPassword) {
//       setConfirmPasswordError("Les mots de passe ne correspondent pas");
//     } else {
//       setConfirmPasswordError("");
//     }
//   };

//   const handleSignUp = async () => {
//     setLoading(true);
//     createUserWithEmailAndPassword(auth, signupEmail, signupPassword)
//       .then(async (userCredential) => {
//         const { emailVerified } = userCredential.user;

//         if (!emailVerified) {
//           await sendEmailVerification(userCredential.user).then((response) => {
//             console.log(response);
//           });
//           handleScrollToIndex(0);
//           setSignupEmail("");
//           setSignupPassword("");
//           setConfirmPassword("");
//           setVerificationModalVisible(true);
//         }
//       })
//       .catch((error) => {
//         let errorMessage;
//         switch (error.code) {
//           case "auth/invalid-email":
//             errorMessage = "Adresse e-mail invalide";
//             break;
//           case "auth/user-disabled":
//             errorMessage = "Ce compte a été désactivé";
//             break;
//           case "auth/network-request-failed":
//             errorMessage = "Problème de connexion réseau";
//             break;
//           case "auth/email-already-in-use":
//             errorMessage = "L'adresse e-mail est déjà associée à un compte.";
//             break;
//           case "auth/weak-password":
//             errorMessage =
//               "Le mot de passe est trop faible. Veuillez choisir un mot de passe plus fort.";
//             break;
//           default:
//             errorMessage = "Erreur inconnue, veuillez réessayer";
//         }
//         setLoginError(errorMessage);
//         setModalVisible(true);
//         setLoading(false);
//       })
//       .finally(() => {
//         setLoading(false);
//       });
//   };

//   const handleLogin = async () => {
//     setLoading(true);
//     try {
//       const userCredential = await signInWithEmailAndPassword(
//         auth,
//         loginEmail,
//         loginPassword
//       );

//       if (!userCredential.user.emailVerified) {
//         await sendEmailVerification(userCredential.user);
//         setVerificationModalVisible(true);
//       } else {
//         const userId = userCredential.user.uid;
//         // const userData = await fetchUserDataFromRealtimeDB(userId);
//         console.log("USER DATA ", user);

//         if (user) {
//           console.log("JE SUIS ICI");
//           const { username, email, profileImage } = user;

//           let localUri;
//           if (profileImage.startsWith("file://")) {
//             // L'image est déjà téléchargée localement
//             localUri = profileImage;
//           } else if (profileImage) {
//             // Télécharger l'image de profil depuis une URL HTTP/HTTPS
//             localUri = `${FileSystem.documentDirectory}${username}_avatar.jpg`;
//             try {
//               await FileSystem.downloadAsync(profileImage, localUri);
//               console.log("Finished downloading to ", localUri);

//               // Sauvegarder l'image dans la bibliothèque de médias
//               await MediaLibrary.saveToLibraryAsync(localUri);
//             } catch (error) {
//               console.error("Error downloading image:", error);
//               throw new Error("Erreur lors du téléchargement de l'image.");
//             }
//           }

//           // Mettre à jour les données de l'utilisateur avec les informations locales
//           await updateUser({
//             id: userCredential.user.uid,
//             email: userCredential.user.email,
//             username: user.username,
//             profileImage: localUri || null,
//             onlineImage: profileImage ? profileImage : null,
//           });
//           const updatedCycles = await getAllCycle();
//           updateCycleMenstruelData({ cyclesData: updatedCycles });
//           closeModal();
//           setLoading(false);
//         } else {
//           console.log("ICIII", user);
//           // Télécharger l'image en ligne et la téléverser sur Firebase Storage
//           if (user.profileImage) {
//             const blob = await new Promise((resolve, reject) => {
//               const xhr = new XMLHttpRequest();
//               xhr.onload = function () {
//                 resolve(xhr.response);
//               };
//               xhr.onerror = function () {
//                 reject(new TypeError("Network request failed"));
//               };
//               xhr.responseType = "blob";
//               xhr.open("GET", user.profileImage, true);
//               xhr.send(null);
//             });

//             const avatarStorageRef = storageRef(
//               storage,
//               `Avatar/${user.username}_avatar`
//             );
//             await uploadBytes(avatarStorageRef, blob);
//             const profilePhotoUrl = await getDownloadURL(avatarStorageRef);

//             console.log("ici");
//             const userDbRef = dbRef(realtimeDatabase, `users/${userId}`);
//             await dbSet(userDbRef, {
//               userId: userId,
//               username: user.username,
//               lastMenstruationDate: user.lastMenstruationDate,
//               durationMenstruation: user.durationMenstruation,
//               cycleDuration: user.cycleDuration,
//               email: loginEmail,
//               profileImage: profilePhotoUrl,
//             });

//             await updateUser({
//               id: userId,
//               username: user.username,
//               email: loginEmail,
//               profileImage: profilePhotoUrl,
//             });
//             const updatedCycles = await getAllCycle();
//             updateCycleMenstruelData({ cyclesData: updatedCycles });
//           }
//         }

//         setLoading(false);
//       }
//     } catch (error) {
//       let errorMessage;
//       console.log(error);
//       auth.signOut();
//       switch (error.code) {
//         case "auth/user-not-found":
//           errorMessage = "Adresse e-mail non trouvée";
//           break;
//         case "auth/invalid-credential":
//           errorMessage = "Vérifier votre identifiants et votre mot de passe";
//           break;
//         case "auth/wrong-password":
//           errorMessage = "Mot de passe incorrect";
//           break;
//         case "auth/invalid-email":
//           errorMessage = "Adresse e-mail invalide";
//           break;
//         case "auth/user-disabled":
//           errorMessage = "Ce compte a été désactivé";
//           break;
//         case "auth/network-request-failed":
//           errorMessage = "Problème de connexion réseau";
//           break;
//         case "auth/too-many-requests":
//           errorMessage = "Réessayer plus tard";
//           break;
//         default:
//           errorMessage = "Erreur inconnue, veuillez réessayer";
//       }
//       setLoginError(errorMessage);
//       setModalVisible(true);
//       setLoading(false);
//     }
//   };

//   const validateEmail = (email) => {
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return emailRegex.test(email);
//   };

//   const validatePassword = (password) => {
//     const passwordRegex = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z]).{8,}$/;
//     return passwordRegex.test(password);
//   };

//   const handleScrollToIndex = (index) => {
//     flatListRef.current.scrollToIndex({ index });
//   };

//   useEffect(() => {
//     setLoginErrorPresent(!loginEmail || !loginPassword);
//     setSignupErrorPresent(
//       !signupEmail ||
//         !signupPassword ||
//         !confirmPassword ||
//         signupPasswordError ||
//         confirmPasswordError
//     );
//   }, [
//     loginEmail,
//     loginPassword,
//     signupEmail,
//     signupPassword,
//     confirmPassword,
//     signupPasswordError,
//     confirmPasswordError,
//   ]);

//   const pages = [
//     {
//       key: "1",
//       title: i18n.t("connecter"),
//       content: (
//         <>
//           <View style={styles.inputContainer}>
//             <TextInput
//               style={styles.input}
//               placeholder={i18n.t("adressemail")}
//               keyboardType="email-address"
//               onChangeText={handleLoginEmailChange}
//               editable={!loading}
//             />
//           </View>
//           {loginEmailError && (
//             <Text style={styles.errorText}>{loginEmailError}</Text>
//           )}
//           <View style={styles.inputContainer}>
//             <TextInput
//               style={styles.input}
//               placeholder={i18n.t("motDePasse")}
//               secureTextEntry
//               onChangeText={handleLoginPasswordChange}
//               editable={!loading}
//             />
//           </View>
//           <View className="mt-3 flex-row justify-end">
//             <TouchableOpacity
//               style={styles.forgotPasswordButton}
//               onPress={() => {
//                 setResetEmailSentModalVisible(true);
//                 handleForgotPassword();
//               }}
//               className=""
//             >
//               <Text style={styles.forgotPasswordText}>
//                 {i18n.t("motDePasseOublie")}
//                 {/* mot de passe oublié ? */}
//               </Text>
//             </TouchableOpacity>
//           </View>
//           {loginPasswordError && (
//             <Text style={styles.errorText}>{loginPasswordError}</Text>
//           )}
//           <TouchableOpacity
//             style={[
//               styles.button,
//               {
//                 backgroundColor:
//                   loginErrorPresent || loading
//                     ? theme === "pink"
//                       ? COLORS.accent500_40
//                       : COLORS.accent800_40
//                     : theme === "pink"
//                     ? COLORS.accent500
//                     : COLORS.accent800,
//               },
//             ]}
//             onPress={handleLogin}
//             disabled={loginErrorPresent || loading}
//           >
//             <Text style={styles.buttonText}>
//               {loading ? i18n.t("chargement") : i18n.t("connection")}
//             </Text>
//           </TouchableOpacity>
//           {/* {loginError && <Text style={styles.errorText}>{loginError}</Text>} */}
//           <Text style={styles.orText} className="lowercase">
//             {i18n.t("ou")}
//           </Text>
//           <TouchableOpacity
//             style={[
//               styles.switchButton,
//               {
//                 borderColor:
//                   theme === "pink" ? COLORS.accent500 : COLORS.accent800,
//               },
//             ]}
//             onPress={() => handleScrollToIndex(1)}
//           >
//             <Text
//               style={[
//                 styles.switchButtonText,
//                 {
//                   color: theme === "pink" ? COLORS.accent500 : COLORS.accent800,
//                 },
//               ]}
//             >
//               {i18n.t("inscription")}
//             </Text>
//           </TouchableOpacity>
//         </>
//       ),
//     },
//     {
//       key: "2",
//       title: i18n.t("inscription"),
//       content: (
//         <>
//           <View style={styles.inputContainer}>
//             <TextInput
//               style={styles.input}
//               placeholder={i18n.t("adressemail")}
//               keyboardType="email-address"
//               onChangeText={handleSignupEmailChange}
//               editable={!loading}
//             />
//           </View>
//           {signupEmailError && (
//             <Text style={styles.errorText}>{signupEmailError}</Text>
//           )}
//           <View style={styles.inputContainer}>
//             <TextInput
//               style={styles.input}
//               placeholder={i18n.t("motDePasse")}
//               secureTextEntry
//               onChangeText={handleSignupPasswordChange}
//               editable={!loading}
//             />
//           </View>
//           {signupPasswordError && (
//             <Text style={styles.errorText}>{signupPasswordError}</Text>
//           )}
//           <View style={styles.inputContainer}>
//             <TextInput
//               style={styles.input}
//               placeholder={i18n.t("confirmerpassword")}
//               secureTextEntry
//               onChangeText={handleConfirmPasswordChange}
//               editable={!loading}
//             />
//           </View>
//           {confirmPasswordError && (
//             <Text style={styles.errorText}>{confirmPasswordError}</Text>
//           )}
//           <TouchableOpacity
//             style={[
//               styles.button,
//               {
//                 backgroundColor:
//                   signupErrorPresent || loading
//                     ? theme === "pink"
//                       ? COLORS.accent500_40
//                       : COLORS.accent800_40
//                     : theme === "pink"
//                     ? COLORS.accent500
//                     : COLORS.accent800,
//               },
//             ]}
//             onPress={handleSignUp}
//             disabled={signupErrorPresent || loading}
//           >
//             <Text style={styles.buttonText}>
//               {loading ? i18n.t("chargement") : i18n.t("connection")}
//             </Text>
//           </TouchableOpacity>
//           <Text style={styles.orText} className="lowercase">
//             {i18n.t("ou")}
//           </Text>
//           <TouchableOpacity
//             style={[
//               styles.switchButton,
//               {
//                 borderColor:
//                   theme === "pink" ? COLORS.accent500 : COLORS.accent800,
//               },
//             ]}
//             onPress={() => handleScrollToIndex(0)}
//           >
//             <Text
//               style={[
//                 styles.switchButtonText,
//                 {
//                   color: theme === "pink" ? COLORS.accent500 : COLORS.accent800,
//                 },
//               ]}
//             >
//               {i18n.t("connecter")}
//             </Text>
//           </TouchableOpacity>
//         </>
//       ),
//     },
//   ];

//   return (
//     <>
//       <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
//         <Text style={styles.closeButtonText}>{i18n.t("ignorer")}</Text>
//       </TouchableOpacity>
//       <FlatList
//         ref={flatListRef}
//         data={pages}
//         horizontal
//         pagingEnabled
//         showsHorizontalScrollIndicator={false}
//         keyExtractor={(item) => item.key}
//         renderItem={({ item }) => (
//           <View style={styles.pageContainer}>
//             <Text
//               style={[
//                 styles.title,
//                 {
//                   color: theme === "pink" ? COLORS.accent500 : COLORS.accent800,
//                 },
//               ]}
//             >
//               {item.title}
//             </Text>
//             <Text style={styles.infoText}>
//               Si vous voulez poser des questions, commenter ou réagir, et
//               envoyer des messages (forum, message privé), veuillez vous
//               connecter ou créer un compte. Cela synchronisera également vos
//               données.
//             </Text>
//             {item.content}
//           </View>
//         )}
//         contentContainerStyle={styles.flatListContent}
//       />
//       <Modal
//         visible={isModalVisible}
//         onRequestClose={() => setModalVisible(false)}
//         transparent
//       >
//         <View style={styles.modalBackdrop}>
//           <Animated.View entering={BounceIn} style={styles.modalContent}>
//             <Text style={styles.modalText}>Erreur lors de la connexion:</Text>
//             <Text style={styles.modalText}>{loginError}</Text>
//             <TouchableOpacity
//               onPress={() => setModalVisible(false)}
//               style={[
//                 styles.modalButton,
//                 {
//                   backgroundColor:
//                     theme === "pink" ? COLORS.accent500 : COLORS.accent800,
//                 },
//               ]}
//             >
//               <Text style={styles.modalButtonText}>Fermer</Text>
//             </TouchableOpacity>
//           </Animated.View>
//         </View>
//       </Modal>

//       <Modal
//         visible={isVerificationModalVisible}
//         animationType="fade"
//         transparent
//         onRequestClose={() => setVerificationModalVisible(false)}
//       >
//         <View style={styles.modalBackdrop}>
//           <Animated.View entering={BounceIn} style={styles.modalContent}>
//             <Text style={styles.modalText}>
//               Un email de vérification a été envoyé. Veuillez vérifier votre
//               boîte de réception.
//             </Text>
//             <TouchableOpacity
//               style={[
//                 styles.modalButton,
//                 {
//                   backgroundColor:
//                     theme === "pink" ? COLORS.accent500 : COLORS.accent800,
//                 },
//               ]}
//               onPress={() => setVerificationModalVisible(false)}
//             >
//               <Text style={styles.modalButtonText}>Fermer</Text>
//             </TouchableOpacity>
//           </Animated.View>
//         </View>
//       </Modal>

//       <Modal
//         visible={resetEmailSentModalVisible}
//         transparent={true}
//         animationType="slide"
//         onRequestClose={() => setResetEmailSentModalVisible(false)}
//       >
//         <View style={styles.modalBackdrop}>
//           <Animated.View entering={BounceIn} style={styles.modalContent}>
//             <Text style={styles.modalText}>
//               Un e-mail de réinitialisation de mot de passe a été envoyé à{" "}
//               {loginEmail}.
//             </Text>
//             <TouchableOpacity
//               style={[
//                 styles.modalButton,
//                 {
//                   backgroundColor:
//                     theme === "pink" ? COLORS.accent500 : COLORS.accent800,
//                 },
//               ]}
//               onPress={() => setResetEmailSentModalVisible(false)}
//             >
//               <Text style={styles.modalButtonText}>Fermer</Text>
//             </TouchableOpacity>
//           </Animated.View>
//         </View>
//       </Modal>
//     </>
//   );
// };

// const styles = StyleSheet.create({
//   pageContainer: {
//     width,
//     padding: 20,
//     justifyContent: "center",
//     backgroundColor: "white",
//   },
//   closeButton: {
//     position: "absolute",
//     zIndex: 50,
//     top: 0,
//     justifyContent: "flex-end",
//     padding: 15,
//     width: "100%",
//     backgroundColor: "white",
//     flexDirection: "row",
//   },
//   closeButtonText: {
//     fontSize: 16,
//     color: COLORS.primary,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     textAlign: "center",
//     marginBottom: 20,
//   },
//   infoText: {
//     fontSize: 16,
//     marginBottom: 20,
//     textAlign: "center",
//   },
//   input: {
//     padding: 10,
//     borderRadius: 15,
//     overflow: "hidden",
//   },
//   inputContainer: {
//     borderRadius: 15,
//     marginVertical: 10,
//     width: width - 40,
//     backgroundColor: COLORS.bg200,
//     borderWidth: 1,
//     borderColor: "#c0bdbd",
//   },
//   button: {
//     padding: 15,
//     borderRadius: 15,
//     marginTop: 20,
//   },
//   buttonText: {
//     color: "white",
//     textAlign: "center",
//     fontSize: 16,
//   },
//   errorText: {
//     color: "red",
//     marginBottom: 10,
//     marginLeft: 10,
//   },
//   orText: {
//     textAlign: "center",
//     paddingVertical: 10,
//     fontSize: 16, // Ajustez la taille de la police en fonction de votre thème
//   },
//   switchButton: {
//     padding: 15,
//     borderRadius: 15,
//     borderWidth: 1,
//     marginTop: 0,
//     backgroundColor: "white",
//   },
//   switchButtonText: {
//     textAlign: "center",
//     fontSize: 16, // Ajustez la taille de la police en fonction de votre thème
//   },
//   modalBackdrop: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 10,
//     backgroundColor: "rgba(0,0,0,0.4)",
//   },
//   modalContent: {
//     backgroundColor: "white",
//     padding: 20,
//     borderRadius: 15,
//     alignItems: "center",
//     zIndex: 9999,
//   },
//   modalText: {
//     fontSize: 18,
//     marginBottom: 10,
//     color: COLORS.modalTextColor,
//   },
//   modalButton: {
//     marginTop: 20,
//     padding: 10,
//     borderRadius: 5,
//   },
//   modalButtonText: {
//     color: "white",
//     textAlign: "center",
//   },
//   flatListContent: {
//     backgroundColor: "white",
//   },
// });

// export default AuthContent;

import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "@legendapp/state/react";
import { preferenceState } from "@/legendstate/AmpelaStates";
import { COLORS } from "@/constants";
import { router } from "expo-router";

const AuthContentFromSetting = ({ closeModal }) => {
  const { theme } = useSelector(() => preferenceState.get());

  return (
    <View className="min-w-[280] p-5 rounded-md bg-white min-h-[200] items-center ">
      <Ionicons
        name={"information-circle"}
        size={50}
        color={theme === "pink" ? COLORS.accent500 : COLORS.accent800}
      />
      <Text className="my-5">
        Si vous voulez participer au message privée et forum, veuillez vous
        connecter ou créer un compte.
      </Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.confirmButton,
            {
              backgroundColor:
                theme === "pink" ? COLORS.accent500 : COLORS.accent800,
            },
          ]}
          onPress={() => {
            router.navigate("settings/login");
            closeModal();
          }}
        >
          <Text style={styles.buttonText}>D'accord</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
          <Text style={[styles.buttonText, { color: "black" }]}>Annuler</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  confirmButton: {
    flex: 1,
    padding: 10,
    backgroundColor: COLORS.accent800,
    borderRadius: 5,
    marginHorizontal: 5,
    alignItems: "center",
  },
  cancelButton: {
    flex: 1,
    padding: 10,
    backgroundColor: COLORS.bg200,
    borderRadius: 5,
    marginHorizontal: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
});

export default AuthContentFromSetting;
