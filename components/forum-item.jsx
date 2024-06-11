import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
} from "react-native";
// import { useTranslation } from 'react-i18next';
import { COLORS, SIZES, icons, images } from "@/constants";
import CommentContent from "./comment-content";
import { addNewComment } from "@/services/firestoreAPI";
import { addNewLike, removeLike } from "@/services/firestoreAPI";
import { getAuth } from "firebase/auth";
import {
  collection,
  onSnapshot,
  query,
  where,
  getDocs,
  doc,
  deleteDoc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { database } from "@/services/firebaseConfig";
import i18n from "@/constants/i18n";
import { AntDesign } from "@expo/vector-icons";

const ForumItem = ({ post, refToCommentItem, navigation }) => {
  // console.log(refToCommentItem);
  // // const { t } = useTranslation();
  // const [isLikeIconPressed, setIsLikeIconPressed] = useState(false);
  // const [isCommentIconPressed, setIsCommentIconPressed] = useState(false);
  // const [commentValue, setCommentValue] = useState("");
  // const [authorName, setAuthorName] = useState('');
  // const [likeCount, setLikeCount] = useState(post.like);
  // const [commentCount, setCommentCount] = useState(0);
  // const [isDisabled, setIsDisabled] = useState(false);

  // useEffect(() => {
  //     try {
  //         const likesRef = collection(database, 'likes');
  //         const likesQuery = query(likesRef, where('postId', '==', post.postId));

  //         const unsubscribeLikes = onSnapshot(likesQuery, (likesSnapshot) => {
  //             try {
  //                 setLikeCount(likesSnapshot.size);
  //             } catch (error) {
  //                 console.error("Erreur lors de la mise à jour du nombre de likes :", error);
  //             }
  //         });

  //         const commentsRef = collection(database, 'comments');
  //         const commentsQuery = query(commentsRef, where('postId', '==', post.postId));

  //         const unsubscribeComments = onSnapshot(commentsQuery, (commentsSnapshot) => {
  //             try {
  //                 setCommentCount(commentsSnapshot.size);
  //             } catch (error) {
  //                 console.error("Erreur lors de la mise à jour du nombre de commentaires :", error);
  //             }
  //         });

  //         return () => {
  //             unsubscribeLikes();
  //             unsubscribeComments();
  //         };
  //     } catch (error) {
  //         console.error("Erreur dans useEffect :", error);
  //     }
  // }, [post.postId]);

  // const checkUserLikedPost = async (userId, postId) => {
  //     try {
  //         const likesCollection = collection(database, 'likes');
  //         const likesQuery = query(likesCollection, where('userId', '==', userId), where('postId', '==', postId));
  //         const likesSnapshot = await getDocs(likesQuery);

  //         return likesSnapshot.size > 0;
  //     } catch (error) {
  //         console.error('Erreur lors de la vérification des likes de l\'utilisateur :', error);
  //         return false;
  //     }
  // };

  // const removeLike = async (userId, postId) => {
  //     try {
  //         const likesCollection = collection(database, 'likes');
  //         const likesQuery = query(likesCollection, where('userId', '==', userId), where('postId', '==', postId));
  //         const likesSnapshot = await getDocs(likesQuery);

  //         if (likesSnapshot.size > 0) {
  //             const likeDoc = likesSnapshot.docs[0];
  //             await deleteDoc(doc(database, 'likes', likeDoc.id));
  //         }
  //     } catch (error) {
  //         console.error('Erreur lors de la suppression du like :', error);
  //     }
  // };

  // useEffect(() => {
  //     const fetchAuthorName = async () => {
  //         try {

  //             const usersCollection = collection(database, 'users');
  //             const authorQuery = query(usersCollection, where('uid', '==', post.authorId));
  //             const authorSnapshot = await getDocs(authorQuery);

  //             if (authorSnapshot.size > 0) {
  //                 const authorData = authorSnapshot.docs[0].data();
  //                 setAuthorName(authorData.pseudo);
  //             } else {
  //                 console.error('Aucun document d\'auteur correspondant trouvé.');
  //             }
  //         } catch (error) {
  //             console.error('Erreur lors de la recherche du nom de l\'auteur :', error);
  //         }
  //     };
  //     fetchAuthorName();
  // }, [post.authorId]);

  // useEffect(() => {
  //     const checkLikedPost = async () => {
  //         try {
  //             const userId = getAuth().currentUser.uid;
  //             const postId = post.postId;
  //             const userLiked = await checkUserLikedPost(userId, postId);

  //             if (userLiked) {
  //                 setIsLikeIconPressed(true);
  //             } else {
  //                 setIsLikeIconPressed(false);
  //             }
  //         } catch (error) {
  //             console.error('Erreur lors de la vérification des likes de l\'utilisateur :', error);
  //         }
  //     };
  //     checkLikedPost();
  // }, [post.postId]);

  // const months = [
  //     'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  //     'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
  // ];

  // const days = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

  // const date = new Date(post.createdAt.toDate());
  // const day = date.getDate();
  // const month = months[date.getMonth()];
  // const year = date.getFullYear();
  // const dayOfWeek = days[date.getDay()];

  // const formattedDate = `${day} ${month} ${year} (${dayOfWeek})`;

  // const handleLikeIconPress = async () => {
  //     const userId = getAuth().currentUser.uid;
  //     const postId = post.postId;
  //     const postRef = doc(database, "posts", postId);
  //     setIsDisabled(true);
  //     try {
  //         const postDoc = await getDoc(postRef);

  //         if (!postDoc.exists()) {
  //             console.error("Le post n'existe pas.");
  //             return;
  //         }
  //         if (postDoc.data()) {
  //             const currentLikes = postDoc.data().like;
  //             if (isLikeIconPressed) {
  //                 await removeLike(userId, postId);
  //                 await updateDoc(postRef, { like: currentLikes - 1 });
  //             } else {
  //                 await addNewLike({ userId, postId, createdAt: new Date() });
  //                 await updateDoc(postRef, { like: currentLikes + 1 });
  //             }
  //         } else {
  //             console.log("error");
  //         }
  //         // setLikeCount((prevLikeCount) => isLikeIconPressed ? prevLikeCount - 1 : prevLikeCount + 1);
  //         setIsLikeIconPressed(!isLikeIconPressed);
  //         console.log(isLikeIconPressed);
  //     } catch (error) {
  //         console.error("Erreur lors de la mise à jour du nombre de likes : ", error);
  //     }
  //     setIsDisabled(false);
  // };

  // const handleCommentIconPress = () => {
  //     // setIsCommentIconPressed(v => !v);
  //     navigation.navigate("CommentScreen", {
  //         post,
  //         refToCommentItem
  //     });
  // }

  // const handleCommentSent = async () => {
  //     if (commentValue.trim() !== "") {
  //         setCommentValue("");
  //         const commentData = {
  //             content: commentValue,
  //             postId: post.postId,
  //             authorId: getAuth().currentUser.uid,
  //             createdAt: new Date(),
  //             updatedAt: new Date(),
  //         };

  //         try {
  //             const response = await addNewComment(commentData);

  //             if (response && response.msg === "no-auth") {
  //                 console.log("L'utilisateur n'est pas authentifié.");
  //             } else {
  //                 console.log("Commentaire ajouté avec succès.");
  //                 setCommentValue("");
  //             }
  //         } catch (error) {
  //             console.error("Erreur lors de l'ajout du commentaire : ", error);
  //         }
  //     } else {
  //         console.log('Commentaire vide');
  //     }
  // };

  return (
    <View
      nestedScrollEnabled
      style={styles.container}
      className=" my-5 shadow-black py-5"
    >
      <View style={styles.header}>
        <Image
          source={images.doctor03}
          style={{ width: 50, height: 50, borderRadius: 100,borderWidth:0.5,borderColor:"gray" }}
        />
        <View className="flex-row justify-between flex-grow">
          <Text
            style={{
              fontFamily: "Bold",
              fontSize: SIZES.small,
              color: "#555",
            }}
          >
            aina
          </Text>
          <Text style={styles.textSmall}>20 octobre 20024</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={{ fontFamily: "SBold", fontSize: SIZES.large }}>
          Menstruation
        </Text>
        <Text style={{ lineHeight: 22 }}>
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Tempore
          quaerat voluptatem voluptas incidunt quod veritatis vero maiores illum
          sed, veniam officia cupiditate fugiat placeat! Quae consequatur omnis
          facere minima reiciendis!
        </Text>
      </View>

      <View style={styles.reactions}>
        <View style={styles.like}>
          <TouchableOpacity disabled={true}>
            <AntDesign
              name="heart"
              color={COLORS.accent600}
             size={24}
            />
          </TouchableOpacity>
          <Text style={styles.textSmall}>20 reactions</Text>
        </View>
        <TouchableOpacity style={styles.comment}>
          <Image source={icons.message} style={{ width: 22, height: 22 }} />
          <Text style={styles.textSmall}>20 commentaires</Text>
        </TouchableOpacity>
      </View>

      {/* {isCommentIconPressed ? <CommentContent post={post} refToCommentItem={refToCommentItem} /> : null} */}

      <View  className="bg-[#f7f7f8] " style={styles.commentBox}>
        <TextInput
          placeholder={i18n.t("ecrireUnCommentaire")}
          style={{ width: "90%", height: "100%", fontFamily: "Regular" }}
          value={20}
        />

        <TouchableOpacity>
          <Image source={icons.send} style={{ width: 19, height: 18 }} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.neutral100,
    borderRadius: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 10,
    width: "98%",
    marginHorizontal: "auto",
  },
  header: {
    flexDirection: "row",
    gap: 8,
  },
  content: {
    marginVertical: 20,
  },
  reactions: {
    flexDirection: "row",
    gap: 20,
  },
  textSmall: {
    fontFamily: "Regular",
    fontSize: SIZES.small,
    color: "#888",
  },
  like: {
    flexDirection: "row",
    gap: 10,
  },
  comment: {
    flexDirection: "row",
    gap: 10,
  },
  commentBox: {
    width: "100%",
    height: 45,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 100,
    paddingHorizontal: 15,
    marginTop: 20,
  },
});

export default ForumItem;
