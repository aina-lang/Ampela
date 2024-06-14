import React, { useContext, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "expo-router";

import { collection, addDoc, updateDoc } from "firebase/firestore";
import { auth, database } from "@/services/firebaseConfig";
import { AuthContext } from "@/hooks/AuthContext";

const AddPost = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const { userProfile } = useContext(AuthContext);

  console.log(userProfile);
  const selectPhotos = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setPhotos(result.assets[0].uri);
    }
  };

  const submitPost = async () => {
    setLoading(true);
    try {
      const data = {
        title,
        description,
        photos,
        authorId: auth.currentUser.uid,
        authorName: userProfile.username,
        like: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = await addDoc(collection(database, "posts"), data);

      const postId = docRef.id;

      console.log(postId);

      await updateDoc(docRef, { postId });

      setTitle("");
      setDescription("");
      setPhotos(null);

      navigation.goBack();
    } catch (error) {
      console.error("Error adding document: ", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Enter title"
        editable={!loading}
      />
      <Text style={styles.label}>Description</Text>
      <TextInput
        style={styles.input}
        value={description}
        onChangeText={setDescription}
        placeholder="Enter description"
        multiline
        editable={!loading}
      />
      <Button title="Add Photos" onPress={selectPhotos} disabled={loading} />
      {photos && <Image source={{ uri: photos }} style={styles.photo} />}
      <TouchableOpacity
        style={styles.submitButton}
        onPress={submitPost}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Submit Post</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  label: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 8,
    marginBottom: 16,
  },
  photo: {
    width: 100,
    height: 100,
    marginRight: 8,
    marginTop: 16,
  },
  submitButton: {
    backgroundColor: "#007bff",
    padding: 16,
    borderRadius: 4,
    alignItems: "center",
    marginTop: 16,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
  },
});

export default AddPost;
