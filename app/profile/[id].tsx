import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Pressable,
  FlatList,
} from "react-native";
import React from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Id } from "@/convex/_generated/dataModel";
import { Loader } from "@/components/Loader";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet } from "react-native";
import { Image } from "expo-image";
export default function usersProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const profiles = useQuery(api.users.getUserProfile, {
    id: id as Id<"users">,
  });

  const posts = useQuery(api.posts.getPostsByUser, {
    userId: id as Id<"users">,
  });

  const isFollowing = useQuery(api.users.isFollowing, {
    followingId: id as Id<"users">,
  });

  const toggleFollow = useMutation(api.users.toggleFollow);

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)");
  };

  if (
    isFollowing === undefined ||
    posts === undefined ||
    profiles === undefined
  )
    return (
      <View style={styles.loader}>
        <Loader />
      </View>
    );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{profiles.username}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileContainer}>
          <Image
            source={profiles.Image}
            style={styles.profileImage}
            contentFit="cover"
            transition={200}
            cachePolicy="memory-disk"
          />

          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Text style={styles.statCount}>{profiles.posts}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statCount}>{profiles.followers}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statCount}>{profiles.following}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
          </View>
        </View>

        <View style={styles.bioContainer}>
          <Text style={styles.fullName}>{profiles.fullname}</Text>
          {profiles.bio && <Text style={styles.bioText}>{profiles.bio}</Text>}
        </View>

        <Pressable
          onPress={() => toggleFollow({ followingId: id as Id<"users"> })}
          style={[
            styles.followButton,
            isFollowing ? styles.unfollowButton : styles.followButton,
          ]}
        >
          <Text style={styles.followButtonText}>
            {isFollowing ? "Following" : "Follow"}
          </Text>
        </Pressable>

        <View>
          {posts.length === 0 ? (
            <View style={styles.noPostsContainer}>
              <Ionicons
                name="images-outline"
                size={40}
                style={styles.noPostsIcon}
              />
              <Text style={styles.noPostsText}>No Posts Yet</Text>
            </View>
          ) : (
            <FlatList
              data={posts}
              numColumns={3}
              scrollEnabled={false}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.postTouchable}>
                  <Image
                    source={item.imageUrl}
                    style={styles.postImage}
                    contentFit="cover"
                    transition={200}
                    cachePolicy="memory-disk"
                  />
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212", // Dark background
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#2E2E2E", // Subtle border for separation
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF", // White text for contrast
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  profileContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
    width: "100%",
  },
  stat: {
    alignItems: "center",
  },
  statCount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  statLabel: {
    fontSize: 14,
    color: "#AAAAAA",
  },
  bioContainer: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  fullName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
  },
  bioText: {
    fontSize: 14,
    color: "#AAAAAA",
    textAlign: "center",
    marginTop: 8,
  },
  followButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignSelf: "center",
    backgroundColor: "#1E90FF",
  },
  unfollowButton: {
    backgroundColor: "#FF4500",
  },
  followButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  noPostsContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  noPostsIcon: {
    color: "#AAAAAA",
    marginBottom: 8,
  },
  noPostsText: {
    fontSize: 16,
    color: "#AAAAAA",
  },
  postImage: {
    width: "100%",
    height: 120,
  },
  postTouchable: {
    margin: 2,
  },
});
