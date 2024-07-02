import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Button } from "react-native";

const getPostDetails = async (postId) => {
  return {
    title: "Titre du post",
    author: "Auteur du post",
    content: "Contenu du post",
  };
};

const getCommentsForPost = async (postId) => {
  return [
    { id: 1, author: "Auteur 1", content: "Commentaire 1" },
    { id: 2, author: "Auteur 2", content: "Commentaire 2" },
  ];
};

const OneForum = () => {
  const route = useRouter();
  const { post } = route.params;

  const [comments, setComments] = useState([]);

  useEffect(() => {
    const loadPostDetails = async () => {
      const postData = await getPostDetails(postId);
      setPost(postData);

      const postComments = await getCommentsForPost(postId);
      setComments(postComments);
    };

    loadPostDetails();
  }, [postId]);

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      {post && (
        <>
          <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 10 }}>
            {post.title}
          </Text>
          <Text style={{ marginBottom: 10 }}>Auteur: {post.author}</Text>
          <Text style={{ marginBottom: 20 }}>{post.content}</Text>
          <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>
            Commentaires
          </Text>
        </>
      )}

      {comments.map((comment) => (
        <View key={comment.id} style={{ marginBottom: 20 }}>
          <Text style={{ fontWeight: "bold" }}>{comment.author}</Text>
          <Text>{comment.content}</Text>
        </View>
      ))}
      <Button
        title="Ajouter un commentaire"
        onPress={() => navigation.navigate("AddComment", { postId })}
      />
    </ScrollView>
  );
};

export default OneForum;
