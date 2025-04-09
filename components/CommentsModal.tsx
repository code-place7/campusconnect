import {
  View,
  Text,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  FlatList,
  TextInput,
  StyleSheet,
} from "react-native";
import React, { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import { Loader } from "./Loader";
import Comments from "@/components/Comments";

type CommentModalProps = {
  postId: Id<"posts">;
  visible: boolean;
  onClose: () => void;
};

export default function CommentsModal({
  onClose,

  postId,
  visible,
}: CommentModalProps) {
  const [newComment, setnewComment] = useState(""); // use to store when someone starts typing
  const comments = useQuery(api.comments.getComments, { postId });
  const addComment = useMutation(api.comments.addComments);

  const handleSubmit = async () => {
    if (!newComment.trim()) return; // ignore

    try {
      await addComment({
        content: newComment,
        postId,
      });
      setnewComment("");
      // the function which we passed during the comment modal component
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalContainer}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        {/* COMMENT HEADER */}
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Checkout Comments</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* COMMENTS LIST */}
        {comments === undefined ? (
          <Loader />
        ) : (
          <FlatList
            data={comments}
            renderItem={({ item }) => <Comments comment={item} />}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.commentsList}
          />
        )}

        {/* ADD COMMENT INPUT */}
        <View style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              placeholder="Share your thoughts on this..."
              placeholderTextColor="#B0B0B0" // Grey placeholder text
              value={newComment}
              onChangeText={setnewComment}
              multiline
            />
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!newComment.trim()}
              style={[
                styles.postButton,
                !newComment.trim() && styles.postButtonDisabled,
              ]}
            >
              <Text style={styles.postButtonText}>Post</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#333333",
  },
  modalTitle: {
    fontSize: 18,
    color: "#FFFFFF",
  },
  commentsList: {
    padding: 16,
  },
  inputContainer: {
    padding: 16,
    backgroundColor: "#333333",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    padding: 8,
    color: "#FFFFFF",
    backgroundColor: "#444444",
    borderRadius: 18,
    marginRight: 8,
  },
  postButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: "#007BFF",
  },
  postButtonDisabled: {
    backgroundColor: "#555555",
  },
  postButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
});
