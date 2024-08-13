import React from "react";
import { View, Text, Button, StyleSheet, Modal, TouchableOpacity } from "react-native";

const PostOptionModal = ({ post, onModify, onDelete, closeModal }) => {
  return (
    <Modal transparent={true} visible={true} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Options pour le post</Text>
          <TouchableOpacity onPress={onModify} style={styles.button}>
            <Text style={styles.buttonText}>Modifier</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} style={styles.button}>
            <Text style={styles.buttonText}>Supprimer</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={closeModal} style={styles.button}>
            <Text style={styles.buttonText}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: 300,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
  },
  button: {
    width: "100%",
    padding: 10,
    marginVertical: 5,
    backgroundColor: "#ddd",
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
  },
});

export default PostOptionModal;
