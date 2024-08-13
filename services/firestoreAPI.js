import { auth, database } from "@/services/firebaseConfig";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  query,
  onSnapshot,
  getDocs,
  getCountFromServer,
  where,
  deleteDoc,
  increment,
} from "firebase/firestore";
import { getDatabase, ref, get } from "firebase/database";
import { Alert } from "react-native";

// Add a new comment
export async function addNewComment(data) {
  try {
    if (auth.currentUser) {
      const commentsRef = collection(
        database,
        "posts",
        data.postId,
        "comments"
      );
      const docRef = await addDoc(commentsRef, {
        content: data.content,
        authorId: data.authorId,
        // authorName: data.authorName,
        // authorAvatar: data.authorAvatar,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      const postRef = doc(database, "posts", data.postId);
      await updateDoc(postRef, {
        comment: increment(1),
      });
      console.log("Comment doc written with ID: ", docRef.id);
    } else {
      return { msg: "no-auth" };
    }
  } catch (err) {
    console.log("Error adding new comment: ", err);
  }
}

// Add a new like
export async function addNewLike(data) {
  try {
    if (!auth.currentUser) {
      return { msg: "no-auth" };
    }

    const likesRef = collection(database, "posts", data.postId, "likes");
    const docRef = await addDoc(likesRef, {
      userId: data.userId,
      createdAt: serverTimestamp(),
    });

    console.log("Like added successfully. Like ID:", docRef.id);
  } catch (err) {
    console.error("Error adding like: ", err);
  }
}

// Get all posts with real-time updates
export async function getAllPosts(callback) {
  try {
    const postsRef = collection(database, "posts");
    const q = query(postsRef);

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const posts = [];
      querySnapshot.forEach((doc) => {
        posts.push({ id: doc.id, ...doc.data() });
      });
      callback(posts);
    });

    return unsubscribe;
  } catch (err) {
    console.error("Error retrieving posts: ", err);
    throw err;
  }
}

// Get all comments for a specific post with real-time updates
export async function getAllComments(postId, callback) {
  try {
    const commentsRef = collection(database, "posts", postId, "comments");
    const q = query(commentsRef);

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const comments = [];
      querySnapshot.forEach((doc) => {
        comments.push({ id: doc.id, ...doc.data() });
      });
      callback(comments);
    });

    return unsubscribe;
  } catch (err) {
    console.log("Error retrieving comments: ", err);
    throw err;
  }
}

// Get the number of likes for a specific post
// export async function getLikeNumber(postId, callback) {
//   try {
//     const likesRef = collection(database, "posts", postId, "likes");
//     const q = query(likesRef);

//     const unsubscribe = onSnapshot(q, (querySnapshot) => {
//       const likesCount = querySnapshot.size;
//       if (callback) {
//         callback(likesCount);
//       }
//     });

//     return unsubscribe;
//   } catch (err) {
//     console.error("Error retrieving likes count: ", err);
//     throw err;
//   }
// }

export async function getLikeNumber(postId, callback) {
  try {
    const postRef = doc(database, "posts", postId);

    const unsubscribe = onSnapshot(postRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const postData = docSnapshot.data();
        const likesCount = postData.like || 0;
        if (callback) {
          callback(likesCount);
        }
      } else {
        console.warn("Post does not exist!");
        if (callback) {
          callback(0);
        }
      }
    });

    return unsubscribe;
  } catch (err) {
    console.error("Error retrieving likes count: ", err);
    throw err;
  }
}

// Add a new post
export async function addNewPost(data) {
  try {
    if (auth.currentUser) {
      const docRef = await addDoc(collection(database, "posts"), {
        content: data.content,
        authorId: data.authorId,
        // authorAvatar: data.authorAvatar,
        // authorName:data.authorName,
        like: data.like,
        comment: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const postId = docRef.id;
      console.log("New post added successfully. Post ID:", postId);
    } else {
      return { msg: "no-auth" };
    }
  } catch (err) {
    console.log("Error adding new post: ", err);
  }
}

// Add a user to the collection
export async function addUserCollection(
  username,
  password,
  profession,
  lastMenstruationDate,
  durationMenstruation,
  cycleDuration
) {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      username,
      password
    );
    const user = userCredential.user;
    const { uid, email } = user;

    const db = getFirestore();
    const usersCollectionRef = doc(db, "users", uid);

    await setDoc(usersCollectionRef, {
      uid: uid,
      email: email,
      pseudo: username,
      profession: profession,
      dernierDateMenstruation: lastMenstruationDate,
      dureeMenstruation: durationMenstruation,
      dureeCycle: cycleDuration,
    });

    Alert.alert(
      "Registration Successful!",
      "Your account has been created successfully."
    );
  } catch (error) {
    console.error("Error during registration:", error.message);
    Alert.alert("Registration Error", error.message);
  }
}

// Remove a like
export async function removeLike(userId, postId) {
  try {
    const likesCollection = collection(database, "posts", postId, "likes");
    const likesQuery = query(likesCollection, where("userId", "==", userId));
    const likesSnapshot = await getDocs(likesQuery);

    if (likesSnapshot.empty) {
      console.log("No like found for this user on this post.");
      return;
    }

    const likeDoc = likesSnapshot.docs[0];
    await deleteDoc(doc(database, "posts", postId, "likes", likeDoc.id));

    console.log("Like removed successfully.");
  } catch (err) {
    console.error("Error removing like: ", err);
  }
}

export const checkUserLikedPost = (userId, postId, callback) => {
  // Reference to the "likes" subcollection of a specific post
  const likesRef = collection(database, "posts", postId, "likes");

  // Create a query to find documents where userId matches
  const likesQuery = query(likesRef, where("userId", "==", userId));

  // Use onSnapshot for real-time updates
  const unsubscribe = onSnapshot(
    likesQuery,
    (querySnapshot) => {
      const isLiked = !querySnapshot.empty; // Check if there are any documents in the query snapshot
      callback(isLiked); // Invoke the callback with the isLiked value
    },
    (error) => {
      console.error("Error fetching likes:", error); // Handle potential errors
    }
  );

  return unsubscribe; // Return the unsubscribe function to allow unsubscription
};
// export async function getCommentNumber(postId, callback) {
//   try {
//     const commentsRef = collection(database, "posts", postId, "comments");
//     const q = query(commentsRef);

//     // Set up real-time listener
//     const unsubscribe = onSnapshot(q, (querySnapshot) => {
//       const count = querySnapshot.size;
//       callback(count); // Pass the count to the callback
//     });

//     return unsubscribe; // Return the unsubscribe function to allow stopping the listener
//   } catch (err) {
//     console.error("Error retrieving number of comments: ", err);
//     throw err; // Ensure error is thrown to be handled by the caller
//   }
// }

export async function getCommentNumber(postId, callback) {
  try {
    const postRef = doc(database, "posts", postId);

    const unsubscribe = onSnapshot(postRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const postData = docSnapshot.data();
        const commentsCount = postData.comment || 0;
        if (callback) {
          callback(commentsCount);
        }
      } else {
        console.warn("Post does not exist!");
        if (callback) {
          callback(0);
        }
      }
    });

    return unsubscribe;
  } catch (err) {
    console.error("Error retrieving comments count: ", err);
    throw err;
  }
}

// Fetch user data from Realtime Database
export const fetchUserDataFromRealtimeDB = async (userId) => {
  const db = getDatabase();
  const userRef = ref(db, `users/${userId}`);

  try {
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      const userData = snapshot.val();
      // console.log("User data from Realtime Database:", userData);
      return userData;
    } else {
      console.log("No user data available");
      return null;
    }
  } catch (error) {
    console.error("Error fetching user data from Realtime Database:", error);
    return null;
  }
};



// Fetch cycles data from Realtime Database
export const fetchCyclesFromFirebase = async (userId) => {
  const db = getDatabase();
  const cyclesRef = ref(db, `users/${userId}/cycleMenstruel`);

  try {
    const snapshot = await get(cyclesRef);
    if (snapshot.exists()) {
      const cycles = snapshot.val();
      console.log("Cycles data:", cycles);
      return cycles;
    } else {
      console.log("No data available");
      return [];
    }
  } catch (error) {
    console.error("Error fetching cycles:", error);
    return [];
  }
};

export const handleDeletePost = async (postId) => {
  console.log(postId);
  try {
    await deleteDoc(doc(database, "posts", postId));
  } catch (error) {
    console.error("Error deleting post:", error);
  }
};


