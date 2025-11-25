import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Linking,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Camera } from "expo-camera";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { Colors, Spacing } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

const PERMISSIONS_CHECKED_KEY = "@03cam/permissions_checked";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Permissions">;

export default function PermissionsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const [isChecking, setIsChecking] = useState(true);
  const [cameraStatus, setCameraStatus] = useState<string>("undetermined");

  const checkPermissions = async () => {
    setIsChecking(true);
    
    try {
      const storedStatus = await AsyncStorage.getItem(PERMISSIONS_CHECKED_KEY);
      const cameraResult = await Camera.getCameraPermissionsAsync();
      setCameraStatus(cameraResult.status);

      if (cameraResult.status === "granted") {
        await AsyncStorage.setItem(PERMISSIONS_CHECKED_KEY, "granted");
        navigation.replace("Camera");
        return;
      }

      if (storedStatus === "granted" || storedStatus === "skipped") {
        navigation.replace("Camera");
        return;
      }
    } catch (error) {
      console.error("Error checking permissions:", error);
    } finally {
      setIsChecking(false);
    }
  };

  const requestPermissions = async () => {
    setIsChecking(true);
    
    try {
      if (cameraStatus !== "granted") {
        const cameraResult = await Camera.requestCameraPermissionsAsync();
        setCameraStatus(cameraResult.status);
        
        if (cameraResult.status === "granted") {
          await AsyncStorage.setItem(PERMISSIONS_CHECKED_KEY, "granted");
          navigation.replace("Camera");
        }
      } else {
        await AsyncStorage.setItem(PERMISSIONS_CHECKED_KEY, "granted");
        navigation.replace("Camera");
      }
    } catch (error) {
      console.error("Error requesting permissions:", error);
    } finally {
      setIsChecking(false);
    }
  };

  const openSettings = () => {
    Linking.openSettings();
  };

  useEffect(() => {
    checkPermissions();
  }, []);

  const cameraGranted = cameraStatus === "granted";

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + Spacing.xl,
          paddingBottom: insets.bottom + Spacing.xl,
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={styles.cameraIcon}>
            <View style={styles.cameraLens} />
          </View>
        </View>

        <Text style={styles.title}>03cam</Text>
        <Text style={styles.subtitle}>Y2K Retro Camera</Text>

        <View style={styles.permissionsCard}>
          <Text style={styles.cardTitle}>Permission Required</Text>
          
          <View style={styles.permissionRow}>
            <View style={[styles.statusDot, cameraGranted && styles.statusGranted]} />
            <Text style={styles.permissionLabel}>Camera</Text>
            <Text style={styles.permissionStatus}>
              {cameraGranted ? "Granted" : "Required"}
            </Text>
          </View>

          <Text style={styles.permissionNote}>
            Camera access is needed to capture retro photos
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        {isChecking ? (
          <ActivityIndicator size="large" color={Colors.dark.text} />
        ) : cameraGranted ? (
          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            onPress={() => navigation.replace("Camera")}
          >
            <Text style={styles.buttonText}>Open Camera</Text>
          </Pressable>
        ) : (
          <>
            <Pressable
              style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
              onPress={requestPermissions}
            >
              <Text style={styles.buttonText}>Grant Permission</Text>
            </Pressable>

            {cameraStatus === "denied" && (
              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  styles.secondaryButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={openSettings}
              >
                <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                  Open Settings
                </Text>
              </Pressable>
            )}

            <Pressable
              style={({ pressed }) => [styles.skipButton, pressed && styles.buttonPressed]}
              onPress={() => {
                AsyncStorage.setItem(PERMISSIONS_CHECKED_KEY, "skipped");
                navigation.replace("Camera");
              }}
            >
              <Text style={styles.skipButtonText}>Skip for now</Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.backgroundRoot,
    paddingHorizontal: Spacing.xl,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: Spacing.xl,
  },
  cameraIcon: {
    width: 80,
    height: 60,
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  cameraLens: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.dark.backgroundRoot,
    borderWidth: 3,
    borderColor: Colors.dark.text,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: Colors.dark.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.dark.tabIconDefault,
    marginBottom: Spacing.xl * 2,
  },
  permissionsCard: {
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: 16,
    padding: Spacing.lg,
    width: "100%",
    maxWidth: 320,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark.text,
    marginBottom: Spacing.lg,
    textAlign: "center",
  },
  permissionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FF6B6B",
    marginRight: Spacing.md,
  },
  statusGranted: {
    backgroundColor: "#4CAF50",
  },
  permissionLabel: {
    flex: 1,
    fontSize: 15,
    color: Colors.dark.text,
  },
  permissionStatus: {
    fontSize: 13,
    color: Colors.dark.tabIconDefault,
  },
  permissionNote: {
    fontSize: 12,
    color: Colors.dark.tabIconDefault,
    marginTop: Spacing.md,
    textAlign: "center",
  },
  actions: {
    gap: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  button: {
    backgroundColor: Colors.dark.backgroundSecondary,
    paddingVertical: Spacing.lg,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: Colors.dark.tabIconDefault,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonText: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButtonText: {
    color: Colors.dark.tabIconDefault,
  },
  skipButton: {
    paddingVertical: Spacing.md,
    alignItems: "center",
  },
  skipButtonText: {
    color: Colors.dark.tabIconDefault,
    fontSize: 14,
  },
});
