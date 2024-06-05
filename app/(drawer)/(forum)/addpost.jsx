import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "expo-router";
import { SIZES } from "@/constants";
import { Ionicons } from "@expo/vector-icons";

const AddPost = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState();
  const navigation = useNavigation();
  const [showTabBar, setShowTabBar] = useState(true);

  const selectPhotos = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      setPhotos(result.assets[0].uri);
    }
  };

  const submitPost = () => {
    console.log({ title, description, photos });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Enter title"
      />
      <Text style={styles.label}>Description</Text>
      <TextInput
        style={styles.input}
        value={description}
        onChangeText={setDescription}
        placeholder="Enter description"
        multiline
      />
      <Button title="Add Photos" onPress={selectPhotos} />
      {photos && <Image source={{ uri: photos }} style={styles.photo} />}
      <TouchableOpacity style={styles.submitButton} onPress={submitPost}>
        <Text style={styles.submitButtonText}>Submit Post</Text>
      </TouchableOpacity>
    </View>
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
