import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function tabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        headerShown: false,
        tabBarActiveTintColor: "#1E90FF", // Neon blue for active tab
        tabBarInactiveTintColor: "#B0B0B0", // Light grey for inactive tab
        tabBarStyle: {
          backgroundColor: "#1E1E1E", // Dark grey background for tab bar
          borderTopColor: "#2E2E2E", // Subtle grey border
          shadowColor: "#000", // Subtle shadow for depth
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={27} color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="bookmarks"
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="bookmark" size={27} color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="createPosts"
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="add-circle" size={27} color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="heart" size={27} color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="person" size={27} color={color} />
          ),
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
