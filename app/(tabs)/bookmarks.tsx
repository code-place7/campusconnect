import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
  StyleSheet,
  Modal,
} from "react-native";
import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader } from "@/components/Loader";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { Doc } from "@/convex/_generated/dataModel";

export default function Bookmarks() {
  const bookmarkedPosts = useQuery(api.bookmarks.getBookmarkedPosts);
  const [selectedPost, setSelectedPost] = useState<Doc<"posts"> | null>(null);

  // Filter valid bookmarked posts
  const validBookmarkedPosts = (bookmarkedPosts ?? []).filter(
    (post) => post !== null && post !== undefined
  );

  // Determine what to render
  const isLoading = bookmarkedPosts === undefined;
  const isEmpty = validBookmarkedPosts.length === 0;

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bookmarks</Text>
      </View>

      {/* CONDITIONAL RENDERING */}
      {isLoading ? (
        <Loader />
      ) : isEmpty ? (
        <NoBookmarkFound />
      ) : (
        <>
          {/* RENDER BOOKMARKED POSTS */}
          <FlatList
            data={validBookmarkedPosts}
            keyExtractor={(item) => item._id}
            numColumns={3}
            renderItem={({ item }) => (
              <View style={{ width: "33.33%", padding: 5 }}>
                <TouchableOpacity onPress={() => setSelectedPost(item)}>
                  <Image
                    source={
                      item.imageUrl
                        ? { uri: item.imageUrl }
                        : require("@/assets/images/auth.png")
                    }
                    style={{
                      width: "100%",
                      aspectRatio: 1,
                      borderRadius: 8,
                      backgroundColor: "#1E1E1E",
                    }}
                    transition={200}
                    cachePolicy="memory-disk"
                  />
                </TouchableOpacity>
                <Text style={styles.captionText}>Title: {item.caption}</Text>
              </View>
            )}
            contentContainerStyle={{
              padding: 8,
            }}
          />

          {/* SELECTED POST MODAL */}
          <Modal
            visible={selectedPost !== null}
            animationType="fade"
            transparent={true}
            onRequestClose={() => setSelectedPost(null)} // Close modal on back button press
          >
            <View style={styles.modalOverlay}>
              {selectedPost && (
                <View style={styles.selectedPostContainer}>
                  {/* CLOSE BUTTON */}
                  <View style={styles.modalHeader}>
                    <TouchableOpacity onPress={() => setSelectedPost(null)}>
                      <Ionicons name="close" size={24} color="#1E90FF" />
                    </TouchableOpacity>
                  </View>

                  {/* POST IMAGE */}
                  <Image
                    source={{ uri: selectedPost.imageUrl }}
                    style={styles.selectedPostImage}
                    contentFit="cover"
                    transition={200}
                  />

                  {/* POST CAPTION */}
                  {selectedPost.caption && (
                    <Text style={styles.selectedPostCaption}>
                      {selectedPost.caption}
                    </Text>
                  )}
                </View>
              )}
            </View>
          </Modal>
        </>
      )}
    </View>
  );
}

function NoBookmarkFound() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 0.5,
          borderBottomColor: "#2E2E2E", // Subtle grey border
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={32} color="#1E90FF" />{" "}
          {/* Neon blue */}
        </TouchableOpacity>
        <Text style={styles.headerTitle}>No Bookmarks Found</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* EMPTY STATE */}
      <TouchableOpacity
        style={styles.emptyStateContainer}
        onPress={() => router.replace("/(tabs)")}
      >
        <Ionicons name="bookmark-outline" size={50} color="#1E90FF" />
        <Text style={styles.emptyStateText}>
          You have not saved any events yet
        </Text>
        <Ionicons name="camera-outline" size={50} color="#1E90FF" />
        <Text style={styles.emptyStateText}>Explore Events</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212", // Dark grey background
  },
  header: {
    padding: 16,
    backgroundColor: "#1E1E1E", // Dark grey header background
    borderBottomWidth: 1,
    borderBottomColor: "#2E2E2E", // Subtle grey border
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF", // White text for contrast
    textAlign: "center",
  },
  captionText: {
    marginTop: 4,
    fontSize: 12,
    color: "#B0B0B0", // Grey text for captions
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)", // Semi-transparent dark background
  },
  selectedPostContainer: {
    width: "90%",
    backgroundColor: "#1E1E1E", // Dark grey background for modal
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  modalHeader: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 16,
  },
  selectedPostImage: {
    width: "100%",
    height: 300,
    borderRadius: 16,
    backgroundColor: "#2E2E2E", // Placeholder background
    marginBottom: 16,
  },
  selectedPostCaption: {
    fontSize: 16,
    color: "#E0E0E0", // Light grey text
    textAlign: "center",
    marginTop: 8,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  emptyStateText: {
    color: "#E0E0E0",
    marginTop: 8,
    textAlign: "center",
  },
});
