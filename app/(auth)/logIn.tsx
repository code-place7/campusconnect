import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import React from "react";

import { Ionicons } from "@expo/vector-icons";
import { COLORSS } from "@/constants/theme";
import { useAuth, useSSO } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212", // Dark background
    padding: 16,
  },
  brandSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#1E1E1E", // Dark grey background for the logo
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF", // White text for the app name
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    color: "#AAAAAA", // Light grey text for the tagline
    textAlign: "center",
    marginHorizontal: 16,
  },
  illustrationContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  illustration: {
    width: "100%",
    height: 200,
    borderRadius: 16,
  },
  loginSection: {
    alignItems: "center",
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORSS.primary, // Primary color for the button
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 16,
  },
  googleIconContainer: {
    marginRight: 8,
  },
  googleButtontext: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF", // White text for the button
  },
  termsText: {
    fontSize: 12,
    color: "#AAAAAA", // Light grey text for terms and conditions
    textAlign: "center",
    marginTop: 8,
  },
});

export default function logIn() {
  const { startSSOFlow } = useSSO();
  const router = useRouter();

  const handleGoogleSignIN = async () => {
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: "oauth_google",
      });
      if (createdSessionId && setActive) {
        setActive({ session: createdSessionId });
        router.replace("/(tabs)");
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <View style={styles.container}>
      {/* brand section */}
      <View style={styles.brandSection}>
        <View style={styles.logoContainer}>
          <Ionicons name="leaf" size={32} color={COLORSS.primary} />
        </View>
        <Text style={styles.appName}>Campus Connect</Text>
        <Text style={styles.tagline}>
          Discover Create and Enjoy Latest Joyful Events
        </Text>
      </View>
      {/* Illustration section */}
      <View style={styles.illustrationContainer}>
        <Image
          source={require("@/assets/images/auth.png")}
          style={styles.illustration}
          resizeMode="cover"
        />
      </View>
      {/* Login Section */}
      <View style={styles.loginSection}>
        <TouchableOpacity
          onPress={handleGoogleSignIN}
          style={styles.googleButton}
        >
          <View style={styles.googleIconContainer}>
            <Ionicons name="logo-google" size={24} color={"white"} />
          </View>
          <Text style={styles.googleButtontext}>Continue With Google</Text>
        </TouchableOpacity>
        <Text style={styles.termsText}>
          By continuing you agree to our terms of service and privacy policy
        </Text>
      </View>
    </View>
  );
}
