import React, { useState } from "react";
import { Loader } from "@/components/Loader";
import Post from "@/components/Post";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { QueryClient } from "@tanstack/react-query";
import {
  FlatList,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  ScrollView,
  Image,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function Index() {
  const posts = useQuery(api.posts.getPosts);
  const featuredPosts = useQuery(api.posts.getFeaturedPosts);
  const [refreshing, setRefreshing] = useState(false);

  if (posts === undefined || featuredPosts === undefined) return <Loader />;

  const queryClient = new QueryClient();

  // this does nothing
  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      // since we are using convex we can ue this package called tanstack query
      // use convex to  refetch the data
      // api.posts.getPosts.refetch();
      // or you can use tanstack query's useQueryClient to refetch the data

      queryClient.refetchQueries({ queryKey: [api.posts.getPosts] });
    }, 2000);
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerText}>CampusConnect</Text>
      </View>

      {/* CONTENT */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <Post post={item} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.postsContent}
        ListHeaderComponent={
          <View style={styles.featuredSection}>
            <Text style={styles.featuredSectionTitle}>Featured Posts</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredPostsContainer}
            >
              {featuredPosts.map((post) => (
                <TouchableOpacity key={post._id} style={styles.featuredPost}>
                  <Image
                    source={{ uri: post.imageUrl }}
                    style={styles.featuredPostImage}
                  />
                  <Text style={styles.featuredPostTitle}>{post.caption}</Text>
                  <View style={styles.likesContainer}>
                    <Ionicons name="heart" size={16} color="red" />
                    <Text style={styles.likesText}>{post.likes} Likes</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        }
        ListEmptyComponent={<NoPostsFounded />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#FF512F", "#DD2476"]} // Vibrant gradient colors for refresh control
          />
        }
      />
    </View>
  );
}

const NoPostsFounded = () => {
  return (
    <View style={styles.noPostsContainer}>
      <Text style={styles.noPostsText}>No Posts Yet</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212", // Dark grey background
  },
  header: {
    backgroundColor: "linear-gradient(90deg, #FF512F, #DD2476)", // Vibrant gradient background
    paddingVertical: 30,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    elevation: 10, // Shadow for Android
    shadowColor: "#000", // Shadow for iOS
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    alignItems: "center", // Center-align the text
    justifyContent: "center",
  },
  headerText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#FFFFFF", // White text for the header
    textAlign: "center",
    fontFamily: "Roboto", // Use a premium font if available
    textShadowColor: "rgba(255, 255, 255, 0.5)", // Glow effect
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },

  featuredSection: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  featuredSectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  featuredPostsContainer: {
    flexDirection: "row",
    paddingVertical: 8,
  },
  featuredPost: {
    marginRight: 12,
    alignItems: "center",
    backgroundColor: "#1E1E1E",
    borderRadius: 8,
    padding: 8,
    width: 140,
  },
  featuredPostImage: {
    width: "100%",
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
  featuredPostTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 4,
  },
  likesContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  likesText: {
    fontSize: 12,
    color: "#FFFFFF",
    marginLeft: 4,
  },
  postsContent: {
    paddingBottom: 80,
  },
  noPostsContainer: {
    flex: 1,
    backgroundColor: "#121212", // Dark grey background for empty state
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  noPostsText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#E0E0E0", // Light grey text for empty state
    textAlign: "center",
  },
});
