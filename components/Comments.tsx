import { View, Text, Image, StyleSheet } from "react-native";
import React from "react";
import { formatDistanceToNow } from "date-fns";

const styles = StyleSheet.create({
  commentContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
    padding: 8,
    backgroundColor: "#1E1E1E", // Dark background for the comment
    borderRadius: 8,
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20, // Circular avatar
    marginRight: 12,
    backgroundColor: "#2E2E2E", // Placeholder background for the avatar
  },
  commentContent: {
    flex: 1,
  },
  commentUsername: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFFFFF", // White text for the username
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    color: "#E0E0E0", // Light grey text for the comment content
    marginBottom: 4,
  },
  commentTime: {
    fontSize: 12,
    color: "#AAAAAA", // Grey text for the timestamp
  },
});

type CommentProps = {
  content: string;
  _creationTime: number;
  user: {
    fullname: string;
    Image: string;
  };
};

export default function Comments({ comment }: { comment: CommentProps }) {
  return (
    <View style={styles.commentContainer}>
      <Image
        source={{ uri: comment.user.Image }}
        style={styles.commentAvatar}
      />
      <View style={styles.commentContent}>
        <Text style={styles.commentUsername}>{comment.user.fullname}</Text>
        <Text style={styles.commentText}>{comment.content}</Text>
        <Text style={styles.commentTime}>
          {formatDistanceToNow(comment._creationTime, { addSuffix: true })}
        </Text>
      </View>
    </View>
  );
}
