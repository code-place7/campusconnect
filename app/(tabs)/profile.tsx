import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  Modal,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { Loader } from "@/components/Loader";
import { Image } from "expo-image";

export default function Profile() {
  const router = useRouter();
  const { signOut, userId } = useAuth();

  const [isEditModalVisible, setisEditModalVisible] = useState(false);
  const currentUser = useQuery(
    api.users.getUserByClerkId,
    userId ? { clerkId: userId } : "skip"
  );

  const [editProfile, setEditProfile] = useState({
    fullname: currentUser?.fullname || "",
    bio: currentUser?.bio || "",
  });

  const [selectedPost, setSelectedPost] = useState<Doc<"posts"> | null>(null);
  const posts = useQuery(api.posts.getPostsByUser, {});
  const updateProfile = useMutation(api.users.updateProfile);

  const handleSaveProfile = async () => {
    await updateProfile(editProfile);
    setisEditModalVisible(false);
  };

  if (!currentUser || posts === undefined) return <Loader />;

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{currentUser.username}</Text>
        <TouchableOpacity onPress={() => signOut()}>
          <Ionicons name="log-out-outline" size={24} color="#1E90FF" />
        </TouchableOpacity>
      </View>

      {/* PROFILE CONTENT */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* PROFILE INFO */}
          <View style={styles.profileInfo}>
            <Image
              source={currentUser.Image}
              style={styles.avatar}
              contentFit="cover"
              transition={200}
            />
            <View style={styles.statsContainer}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{currentUser.posts}</Text>
                <Text style={styles.statLabel}>Posts</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{currentUser.followers}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{currentUser.following}</Text>
                <Text style={styles.statLabel}>Following</Text>
              </View>
            </View>
          </View>

          <Text style={styles.fullname}>{currentUser.fullname}</Text>
          {currentUser.bio && <Text style={styles.bio}>{currentUser.bio}</Text>}

          {/* ACTION BUTTON */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setisEditModalVisible(true)}
            >
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Ionicons name="share-outline" size={20} color="#1E90FF" />
            </TouchableOpacity>
          </View>
        </View>

        {posts.length === 0 && <NoPostsFound />}
        <FlatList
          data={posts}
          numColumns={3}
          scrollEnabled={false}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => setSelectedPost(item)}>
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.postImage}
                contentFit="cover"
                transition={200}
              />
            </TouchableOpacity>
          )}
        />
      </ScrollView>

      {/* EDIT PROFILE MODAL */}
      <Modal
        visible={isEditModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setisEditModalVisible(false)}
      >
        <TouchableOpacity
          onPress={Keyboard.dismiss}
          style={styles.modalOverlay}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalContainer}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Profile</Text>
                <TouchableOpacity onPress={() => setisEditModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#1E90FF" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={editProfile.fullname}
                  onChangeText={(text) =>
                    setEditProfile((prev) => ({ ...prev, fullname: text }))
                  }
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Bio</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={editProfile.bio}
                  onChangeText={(text) =>
                    setEditProfile((prev) => ({ ...prev, bio: text }))
                  }
                  multiline
                  numberOfLines={4}
                />
              </View>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveProfile}
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </Modal>

      {/* SELECTED POST MODAL */}
      <Modal
        visible={selectedPost !== null}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setSelectedPost(null)}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212", // Dark grey background
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#1E1E1E", // Dark grey header background
    borderBottomWidth: 1,
    borderBottomColor: "#2E2E2E", // Subtle grey border
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF", // White text for contrast
  },
  content: {
    padding: 16,
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#2E2E2E", // Placeholder background
    marginRight: 16,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    flex: 1,
  },
  stat: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF", // White text
  },
  statLabel: {
    fontSize: 14,
    color: "#B0B0B0", // Grey text
  },
  fullname: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF", // White text
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    color: "#E0E0E0", // Light grey text
    marginBottom: 16,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  editButton: {
    backgroundColor: "#1E90FF", // Neon blue button
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  editButtonText: {
    color: "#FFFFFF", // White text
    fontWeight: "bold",
  },
  postImage: {
    width: 100,
    height: 100,
    margin: 4,
    borderRadius: 8,
    backgroundColor: "#2E2E2E", // Placeholder background
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)", // Semi-transparent dark background
  },
  modalContainer: {
    width: "90%",
    backgroundColor: "#1E1E1E", // Dark grey modal background
    borderRadius: 16,
    padding: 16,
  },
  modalContent: {
    alignItems: "center",
  },
  modalHeader: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF", // White text
  },
  inputGroup: {
    width: "100%",
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: "#B0B0B0", // Grey text
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: "#2E2E2E", // Dark grey input background
    color: "#FFFFFF", // White text
    borderRadius: 8,
    padding: 8,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  saveButton: {
    backgroundColor: "#1E90FF", // Neon blue button
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 16,
  },
  saveButtonText: {
    color: "#FFFFFF", // White text
    fontWeight: "bold",
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
});

function NoPostsFound() {
  return (
    <View style={{ alignItems: "center", marginTop: 16 }}>
      <Ionicons name="image-outline" size={48} color="#B0B0B0" />
      <Text style={{ color: "#B0B0B0", marginTop: 8 }}>No posts found</Text>
    </View>
  );
}
