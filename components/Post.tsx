import { View, Text, TouchableOpacity } from "react-native";
import React, { useState } from "react";

import { Link, router } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { COLORSS } from "@/constants/theme";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import CommentsModal from "@/components/CommentsModal";
import { formatDistanceToNow } from "date-fns";
import { LinearGradient } from "expo-linear-gradient";
import { useUser } from "@clerk/clerk-expo";

type Postprops = {
  post: {
    _id: Id<"posts">;
    imageUrl: string;
    caption?: string;
    likes: number;
    comments: number;
    _creationTime: number;
    isLiked: boolean;
    isBookmarked: boolean;
    author: {
      _id: Id<"users">;
      username: string;
      Image: string;
      fullname: string;
    };
  };
};

export default function Post({ post }: Postprops) {
  const [isLiked, setIsLiked] = useState(post.isLiked);

  const [isBookmarked, setisBookmarked] = useState(post.isBookmarked);

  const [showComments, setshowComments] = useState(false);

  const toggleLike = useMutation(api.posts.toggleLke);
  const handleLIke = async () => {
    try {
      const newIsLiked = await toggleLike({ postId: post._id });
      setIsLiked(newIsLiked);
    } catch (error) {
      console.error(error);
    }
  };

  const toggleBookmark = useMutation(api.bookmarks.toggleBookmark);
  const handleBookmark = async () => {
    const newIsBookmarked = await toggleBookmark({ postId: post._id });
    setisBookmarked(newIsBookmarked);
  };

  const { user } = useUser();
  const currentUser = useQuery(
    api.users.getUserByClerkId,
    user ? { clerkId: user?.id } : "skip"
  );

  const deletePost = useMutation(api.posts.deletePost);
  const handleDeletePost = async () => {
    try {
      await deletePost({ postId: post._id });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View
      style={{
        backgroundColor: "#121212", // Dark grey background for modern dark theme
        borderRadius: 16,
        overflow: "hidden",
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 4,
      }}
    >
      {/* POST HEADER */}
      <LinearGradient
        colors={["#1E1E1E", "#000000"]} // Dark grey to black gradient
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 10,
          paddingHorizontal: 14,
          borderBottomWidth: 1,
          borderBottomColor: "#2E2E2E", // Subtle grey border
        }}
      >
        <Link
          href={
            currentUser?._id === post.author._id
              ? "/(tabs)/profile"
              : `/profile/${post.author._id}`
          }
          asChild
        >
          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center" }}
          >
            <Image
              source={post.author.Image}
              style={{
                width: 42,
                height: 42,
                borderRadius: 21,
                marginRight: 10,
                borderWidth: 2,
                borderColor: "#1E90FF", // Neon blue border
              }}
              contentFit="cover"
              transition={200}
              cachePolicy="memory-disk"
            />
            <Text
              style={{
                fontSize: 16,
                fontWeight: "500",
                color: "#FFFFFF", // White text for contrast
              }}
            >
              {post.author.fullname.toLowerCase()}
            </Text>
          </TouchableOpacity>
        </Link>
        {post.author._id === currentUser?._id ? (
          <TouchableOpacity
            onPress={handleDeletePost}
            style={{
              marginLeft: "auto",
              backgroundColor: "#FF4C4C", // Red for delete button
              padding: 8,
              borderRadius: 16,
              shadowColor: "#FF4C4C",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.8,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={{
              marginLeft: "auto",
              backgroundColor: "#1E90FF", // Neon blue for ellipsis button
              padding: 8,
              borderRadius: 16,
              shadowColor: "#1E90FF",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.8,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Ionicons
              name="ellipsis-horizontal"
              size={18}
              color="#FFFFFF" // White icon for contrast
            />
          </TouchableOpacity>
        )}
      </LinearGradient>

      {/* POST IMAGE */}
      <Image
        source={post.imageUrl}
        style={{
          width: "100%",
          height: 300,
        }}
        contentFit="cover"
        transition={200}
        cachePolicy="memory-disk"
      />

      {/* POST ACTIONS */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          padding: 16,
          backgroundColor: "#121212",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity
            onPress={handleLIke}
            style={{
              marginRight: 12,
              backgroundColor: "#1E90FF", // Neon blue background
              padding: 10,
              borderRadius: 30,
              shadowColor: "#1E90FF",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.8,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={20}
              color="#FFFFFF" // White heart icon
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setshowComments(true)}
            style={{
              backgroundColor: "#1ABC9C", // Teal background
              padding: 10,
              borderRadius: 30,
              shadowColor: "#1ABC9C",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.8,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Ionicons name="chatbubble-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={handleBookmark}
          style={{
            backgroundColor: isBookmarked ? "#1E90FF" : "#1ABC9C", // Neon blue for bookmarked, teal otherwise
            padding: 10,
            borderRadius: 30,
            shadowColor: isBookmarked ? "#1E90FF" : "#1ABC9C",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.8,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <Ionicons
            name={isBookmarked ? "bookmark" : "bookmark-outline"}
            size={20}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>

      {/* POST INFO */}
      <View style={{ padding: 16 }}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: "500",
            color: "#E0E0E0", // Light grey text
          }}
        >
          {post.likes > 0
            ? `${post.likes.toLocaleString()} likes`
            : "Be the first to like this!"}
        </Text>
        {post.caption && (
          <View style={{ marginTop: 8 }}>
            <Text
              style={{
                fontSize: 14,
                color: "#FFFFFF", // White text for the name and caption
                lineHeight: 20, // Better readability for multiline captions
              }}
            >
              <Text
                style={{
                  fontWeight: "bold", // Bold for the author's name
                }}
              >
                {post.author.fullname}{" "}
              </Text>
              <Text
                style={{
                  fontWeight: "normal", // Normal weight for the caption
                  color: "#B0B0B0", // Grey text for captions
                }}
              >
                {post.caption}
              </Text>
            </Text>
          </View>
        )}
        {post.comments > 0 && (
          <TouchableOpacity
            onPress={() => setshowComments(true)}
            style={{ marginTop: 8 }}
          >
            <Text style={{ fontSize: 14, color: "#1ABC9C" }}>
              View {post.comments} Comments
            </Text>
          </TouchableOpacity>
        )}
        <Text
          style={{
            fontSize: 12,
            color: "#B0B0B0", // Grey text for timestamp
            marginTop: 8,
          }}
        >
          Posted {formatDistanceToNow(post._creationTime, { addSuffix: true })}
        </Text>
      </View>

      <CommentsModal
        postId={post._id}
        visible={showComments}
        onClose={() => setshowComments(false)}
      />
    </View>
  );
}
