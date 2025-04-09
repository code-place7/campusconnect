import { ClerkLoaded, ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";

const InitialLayout = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    const inAuthScreen = segments[0] === "(auth)";
    if (isSignedIn && inAuthScreen) {
      router.replace("/(tabs)");
    } else if (!isSignedIn && !inAuthScreen) {
      router.replace("/(auth)/logIn");
    }
  }, [isSignedIn, isLoaded, segments]);

  if (!isLoaded) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
};

export default function RootLayout() {
  const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
    unsavedChangesWarning: false,
  });
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

  if (!publishableKey) {
    throw new Error("Add EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env");
  }

  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <ConvexProviderWithClerk useAuth={useAuth} client={convex}>
        <ClerkLoaded>
          <SafeAreaProvider>
            <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
              <InitialLayout />
            </SafeAreaView>
          </SafeAreaProvider>
        </ClerkLoaded>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
