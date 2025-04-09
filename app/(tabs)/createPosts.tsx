import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  TextInput,
  StyleSheet,
} from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { useUser } from "@clerk/clerk-expo";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function createPosts() {
  const router = useRouter();
  const { user } = useUser();
  const [caption, setCaption] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const generateUploadurl = useMutation(api.posts.generateUploadurl);
  const createPost = useMutation(api.posts.createPost);

  const handleShare = async () => {
    if (!selectedImage) return;

    try {
      setIsSharing(true);
      const uploadUrl = await generateUploadurl();
      const uploadResult = await FileSystem.uploadAsync(
        uploadUrl,
        selectedImage,
        {
          httpMethod: "POST",
          uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
          mimeType: "image/jpeg",
        }
      );

      if (uploadResult.status !== 200) {
        throw new Error("Upload failed");
      }

      const { storageId } = JSON.parse(uploadResult.body);
      await createPost({ storageId, caption });

      setSelectedImage(null);
      setCaption("");

      alert("✅ Post created successfully!");
      router.push("/(tabs)");
    } catch (error) {
      console.error(error);
    } finally {
      setIsSharing(false);
    }
  };

  if (!selectedImage) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={32} color="#1E90FF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>CREATE YOUR EVENT</Text>
          <View style={{ width: 28 }} />
        </View>

        <TouchableOpacity
          style={styles.emptyImageContainer}
          onPress={pickImage}
        >
          <Ionicons name="camera" size={50} color="#1E90FF" />
          <Text style={styles.emptyImageText}>Tap to add an image</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <View style={styles.contentContainer}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              setSelectedImage(null);
              setCaption("");
            }}
            disabled={isSharing}
          >
            <Ionicons
              name="close-circle"
              size={28}
              color={isSharing ? "#B0B0B0" : "#FFFFFF"}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>CREATE EVENT</Text>
          <TouchableOpacity
            style={[
              styles.shareButton,
              isSharing && styles.shareButtonDisabled,
            ]}
            disabled={isSharing || !selectedImage}
            onPress={handleShare}
          >
            {isSharing ? (
              <ActivityIndicator size="small" color="#1E90FF" />
            ) : (
              <Text style={styles.shareText}>Share</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* SCROLLVIEW */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          bounces={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* IMAGE */}
          <View style={[styles.content, isSharing && styles.contentDisabled]}>
            <View style={styles.imageSelection}>
              <Image
                source={selectedImage}
                style={styles.previewImage}
                contentFit="cover"
                transition={200}
              />
              <TouchableOpacity
                style={styles.changeImageButton}
                onPress={pickImage}
                disabled={isSharing}
              >
                <Ionicons name="image-outline" size={28} color="#1E90FF" />
                <Text style={{ color: "#FFFFFF" }}>Change</Text>
              </TouchableOpacity>
            </View>

            {/* INPUT SECTION */}
            <View style={styles.inputSection}>
              <View style={styles.captionContainer}>
                <Image
                  source={user?.imageUrl}
                  style={styles.userAvatar}
                  contentFit="cover"
                  transition={200}
                />
                <TextInput
                  style={styles.captionInput}
                  placeholder="Describe your event..."
                  placeholderTextColor="#B0B0B0"
                  multiline
                  value={caption}
                  onChangeText={setCaption}
                  editable={!isSharing}
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
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
    textAlign: "center", // White text for contrast
  },
  content: {
    flex: 1,
    padding: 16,
    backgroundColor: "#1E1E1E", // Dark grey background for content
  },
  contentDisabled: {
    opacity: 0.5, // Reduced opacity for disabled state
  },
  emptyImageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1E1E1E", // Dark grey background for empty state
    borderRadius: 16,
    margin: 16,
    padding: 16,
  },
  emptyImageText: {
    marginTop: 8,
    fontSize: 16,
    color: "#E0E0E0", // Light grey text
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  scrollContent: {
    paddingBottom: 16, // Add padding to the bottom of the scroll content
  },
  imageSelection: {
    alignItems: "center",
    marginBottom: 16,
  },
  previewImage: {
    width: "100%",

    height: 200,
    borderRadius: 16,
    backgroundColor: "#1E1E1E", // Dark grey background for image preview
  },
  changeImageButton: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  inputSection: {
    marginTop: 16,
  },
  captionContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E1E1E", // Dark grey background for input
    borderRadius: 16,
    padding: 8,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  captionInput: {
    flex: 1,
    color: "#FFFFFF", // White text for input
  },
  shareButton: {
    backgroundColor: "#1E90FF", // Neon blue button
    padding: 8,
    borderRadius: 16,
  },
  shareButtonDisabled: {
    backgroundColor: "#B0B0B0", // Grey for disabled button
  },
  shareText: {
    color: "#FFFFFF", // White text for share button
    fontWeight: "bold",
  },
});
