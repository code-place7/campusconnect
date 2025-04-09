import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from "react-native";
import React, { useState } from "react";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader } from "@/components/Loader";
import { Ionicons } from "@expo/vector-icons";
import { Link, router, useRouter } from "expo-router";
import { Image } from "expo-image";
import { formatDistanceToNow } from "date-fns";
import { QueryClient, useQueryClient } from "@tanstack/react-query";

export default function Notifications() {
  const notifications = useQuery(api.notifications.getNotifications);
  const [refreshing, setRefreshing] = useState(false);

  // Access the existing QueryClient instance
  const queryClient = new QueryClient();

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      // since we are using convex we can ue this package called tanstack query
      // use convex to  refetch the data
      // api.posts.getPosts.refetch();
      // or you can use tanstack query's useQueryClient to refetch the data

      queryClient.refetchQueries({
        queryKey: [api.notifications.getNotifications],
      });
    }, 2000);
  };

  if (notifications === undefined) return <Loader />;
  if (notifications.length === 0) return <NoNotifications />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <NotificationItem notification={item} />}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#1E90FF"
          />
        }
      />
    </View>
  );
}

function NotificationItem({ notification }: any) {
  return (
    <View style={styles.notificationItem}>
      <View style={styles.notificationContent}>
        {notification.sender?._id && (
          <Link href={`/profile/${notification.sender._id}`} asChild>
            <TouchableOpacity style={styles.avatarContainer}>
              <Image
                source={notification.sender.image}
                style={styles.avatar}
                contentFit="cover"
                transition={200}
                cachePolicy="memory-disk"
              />
              <View style={styles.iconBadge}>
                {notification.type === "like" ? (
                  <Ionicons name="heart" size={15} color="pink" />
                ) : notification.type === "follow" ? (
                  <Ionicons name="person-add" size={15} color="#8B5CF6" />
                ) : (
                  <Ionicons name="chatbubble" size={15} color="#3B82F6" />
                )}
              </View>
            </TouchableOpacity>
          </Link>
        )}
        <View style={styles.notificationInfo}>
          <Link href={"/notifications"} asChild>
            <TouchableOpacity>
              <Text style={styles.username}>
                {notification.sender.fullname}
              </Text>
            </TouchableOpacity>
          </Link>

          <Text style={styles.action}>
            {notification.type === "follow"
              ? "started following you"
              : notification.type === "like"
                ? "liked your post"
                : `commented: ${notification.comment.content}`}
          </Text>

          <Text style={styles.timeAgo}>
            {formatDistanceToNow(notification._creationTime, {
              addSuffix: true,
            })}
          </Text>
        </View>
      </View>

      {notification.post && (
        <Image
          source={notification.post.Image}
          style={styles.postImage}
          contentFit="cover"
          transition={200}
        />
      )}
    </View>
  );
}

function NoNotifications() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={32} color="#1E90FF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>YOUR NOTIFICATIONS</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* EMPTY STATE */}
      <TouchableOpacity
        style={styles.emptyStateContainer}
        onPress={() => router.replace("/(tabs)")}
      >
        <Ionicons name="notifications-outline" size={50} color="#1E90FF" />
        <Text style={styles.emptyStateText}>No Notifications yet</Text>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "linear-gradient(90deg, #6A11CB, #2575FC)", // Gradient header background
    borderBottomWidth: 1,
    borderBottomColor: "#2E2E2E", // Subtle grey border
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF", // White text for contrast
    textAlign: "center",
  },
  listContainer: {
    padding: 16,
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E1E1E", // Dark grey background for notification item
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  notificationContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    marginRight: 12,
    position: "relative",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#6A11CB", // Border around the avatar
    backgroundColor: "#2E2E2E", // Placeholder background for avatar
  },
  iconBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#121212", // Dark grey background for badge
    borderRadius: 10,
    padding: 4,
  },
  notificationInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#E0E0E0", // Light grey text for username
  },
  action: {
    fontSize: 14,
    color: "#B0B0B0", // Grey text for action
    marginTop: 4,
  },
  timeAgo: {
    fontSize: 12,
    color: "#B0B0B0", // Grey text for timestamp
    marginTop: 4,
  },
  postImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginLeft: 12,
    backgroundColor: "#2E2E2E", // Placeholder background for post image
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  emptyStateText: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: "bold",
    color: "#E0E0E0", // Light grey text for empty state
    textAlign: "center",
  },
});
