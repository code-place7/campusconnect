import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

type StoryProps = {
  story: {
    id: string;
    username: string;
    avatar: string;
    hasStory: boolean;
  };
  style?: object; // Add the `style` prop
};

export default function Story({ story, style }: StoryProps) {
  return (
    <View style={[styles.container, style]}>
      {/* Apply the `style` prop */}
      <Image source={{ uri: story.avatar }} style={styles.avatar} />
      <Text style={styles.username}>{story.username}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 8,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#87CEEB", // Sky blue border
  },
  username: {
    marginTop: 4,
    fontSize: 12,
    color: "#7f8c8d", // Light grey text
  },
});
