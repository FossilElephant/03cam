import { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Text,
  Alert,
  Platform,
  Modal,
  Image,
  ActivityIndicator,
} from "react-native";
import { CameraView, useCameraPermissions, FlashMode } from "expo-camera";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";
import { Spacing, Colors } from "@/constants/theme";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";
import {
  loadSettings,
  type CameraSettings,
  type FlashMode as FlashModeSetting,
} from "@/utils/settings";
import { processPhoto, savePhotoToGallery } from "@/utils/photoProcessing";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Camera">;

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<"back" | "front">("back");
  const [settings, setSettings] = useState<CameraSettings | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    loadSettings().then((loaded) => {
      setSettings(loaded);
      setFacing(loaded.defaultCamera);
    });
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadSettings().then((loaded) => {
        setSettings(loaded);
      });
    });
    return unsubscribe;
  }, [navigation]);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.permissionContainer]}>
        <View style={styles.cameraOffIcon}>
          <View style={styles.cameraOffLens} />
          <View style={styles.cameraOffLine} />
        </View>
        <Text style={styles.permissionText}>
          03cam needs camera access to capture retro photos
        </Text>
        <Pressable
          style={({ pressed }) => [
            styles.permissionButton,
            pressed && styles.permissionButtonPressed,
          ]}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </Pressable>
      </View>
    );
  }

  if (!settings) {
    return <View style={styles.container} />;
  }

  const handleCapture = async () => {
    if (!cameraRef.current || isCapturing) return;

    try {
      setIsCapturing(true);

      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }

      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        skipProcessing: true,
        shutterSound: false,
      });

      if (!photo) return;

      const processedUri = await processPhoto(photo.uri, settings);
      setPreviewPhoto(processedUri);
      setShowPreview(true);
    } catch (error: any) {
      console.error("Failed to capture photo:", error);
      Alert.alert("Error", "Failed to capture photo. Please try again.");
    } finally {
      setIsCapturing(false);
    }
  };

  const handleSavePhoto = async () => {
    if (!previewPhoto) return;

    try {
      setIsSaving(true);
      await savePhotoToGallery(previewPhoto);
      Alert.alert("Photo saved", "Your retro photo has been saved to gallery");
      setShowPreview(false);
      setPreviewPhoto(null);
    } catch (error: any) {
      console.error("Failed to save photo:", error);
      
      Alert.alert("Error", error.message || "Failed to save photo. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRetake = () => {
    setShowPreview(false);
    setPreviewPhoto(null);
  };

  const toggleCamera = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const cycleFlash = () => {
    setSettings((prev) => {
      if (!prev) return prev;
      const modes: FlashModeSetting[] = ["auto", "on", "off"];
      const currentIndex = modes.indexOf(prev.flashMode);
      const nextIndex = (currentIndex + 1) % modes.length;
      return { ...prev, flashMode: modes[nextIndex] };
    });
  };

  const getFlashColor = (): string => {
    switch (settings.flashMode) {
      case "on":
        return "#FFFFFF";
      case "off":
        return "#6B7F77";
      case "auto":
        return "#FFD700";
    }
  };

  const mapFlashMode = (mode: FlashModeSetting): FlashMode => {
    switch (mode) {
      case "on":
        return "on";
      case "off":
        return "off";
      case "auto":
        return "auto";
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        flash={mapFlashMode(settings.flashMode)}
      >
        <View
          style={[
            styles.overlay,
            { paddingTop: insets.top + Spacing.lg, paddingBottom: insets.bottom + Spacing.xl },
          ]}
        >
          <View style={styles.topControls}>
            <Pressable
              style={({ pressed }) => [
                styles.iconButton,
                pressed && styles.iconButtonPressed,
              ]}
              onPress={toggleCamera}
            >
              <View style={styles.flipIcon}>
                <View style={styles.flipArrow} />
                <View style={[styles.flipArrow, styles.flipArrowBottom]} />
              </View>
            </Pressable>

            <Text style={styles.resolutionIndicator}>
              {settings.resolution === "640x480" ? "VGA" : "QVGA"}
            </Text>

            <View style={styles.topRightControls}>
              <Pressable
                style={({ pressed }) => [
                  styles.iconButton,
                  pressed && styles.iconButtonPressed,
                ]}
                onPress={cycleFlash}
              >
                <View style={[styles.flashIcon, { opacity: settings.flashMode === "off" ? 0.4 : 1 }]}>
                  <View style={[styles.flashBolt, { backgroundColor: getFlashColor() }]} />
                </View>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.iconButton,
                  pressed && styles.iconButtonPressed,
                ]}
                onPress={() => navigation.navigate("Settings")}
              >
                <View style={styles.settingsIcon}>
                  <View style={styles.settingsDot} />
                  <View style={styles.settingsDot} />
                  <View style={styles.settingsDot} />
                </View>
              </Pressable>
            </View>
          </View>

          <View style={styles.bottomControls}>
            <Pressable
              style={({ pressed }) => [
                styles.iconButton,
                pressed && styles.iconButtonPressed,
              ]}
              onPress={() => navigation.navigate("Gallery", { photos: [] })}
            >
              <View style={styles.galleryIcon}>
                <View style={styles.gallerySquare} />
                <View style={styles.gallerySquare} />
                <View style={styles.gallerySquare} />
                <View style={styles.gallerySquare} />
              </View>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.shutterButton,
                pressed && styles.shutterButtonPressed,
                isCapturing && styles.shutterButtonDisabled,
              ]}
              onPress={handleCapture}
              disabled={isCapturing}
            >
              <View style={styles.shutterInner} />
            </Pressable>

            <View style={{ width: 48 }} />
          </View>
        </View>
      </CameraView>
      
      {/* Photo Preview Modal */}
      <Modal
        animationType="fade"
        transparent={false}
        visible={showPreview}
        onRequestClose={handleRetake}
      >
        <View style={styles.previewContainer}>
          {previewPhoto && (
            <>
              <Image source={{ uri: previewPhoto }} style={styles.previewImage} />
              <View style={[styles.previewControls, { paddingBottom: insets.bottom + Spacing.xl }]}>
                <Pressable
                  style={({ pressed }) => [
                    styles.previewButton,
                    styles.retakeButton,
                    pressed && styles.previewButtonPressed,
                  ]}
                  onPress={handleRetake}
                  disabled={isSaving}
                >
                  <Text style={styles.previewButtonText}>Retake</Text>
                </Pressable>
                
                <Pressable
                  style={({ pressed }) => [
                    styles.previewButton,
                    styles.saveButton,
                    pressed && styles.previewButtonPressed,
                    isSaving && styles.previewButtonDisabled,
                  ]}
                  onPress={handleSavePhoto}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.previewButtonText}>Save</Text>
                  )}
                </Pressable>
              </View>
            </>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.backgroundRoot,
  },
  permissionContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  cameraOffIcon: {
    width: 64,
    height: 48,
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  cameraOffLens: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: Colors.dark.text,
  },
  cameraOffLine: {
    position: "absolute",
    width: 56,
    height: 3,
    backgroundColor: Colors.dark.text,
    transform: [{ rotate: "45deg" }],
  },
  permissionText: {
    color: Colors.dark.text,
    fontSize: 16,
    textAlign: "center",
    maxWidth: 300,
  },
  permissionButton: {
    backgroundColor: Colors.dark.backgroundSecondary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    marginTop: Spacing.md,
  },
  permissionButtonPressed: {
    opacity: 0.7,
  },
  permissionButtonText: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: "600",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: "space-between",
  },
  topControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
  },
  topRightControls: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  iconButtonPressed: {
    opacity: 0.7,
  },
  iconButtonText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
  },
  flipIcon: {
    width: 20,
    height: 16,
    justifyContent: "space-between",
  },
  flipArrow: {
    width: 16,
    height: 2,
    backgroundColor: "#FFFFFF",
    borderRadius: 1,
    alignSelf: "flex-end",
  },
  flipArrowBottom: {
    alignSelf: "flex-start",
  },
  flashIcon: {
    width: 12,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  flashBolt: {
    width: 3,
    height: 16,
    borderRadius: 1.5,
    transform: [{ rotate: "-15deg" }],
  },
  settingsIcon: {
    height: 16,
    justifyContent: "space-between",
    alignItems: "center",
  },
  settingsDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#FFFFFF",
  },
  galleryIcon: {
    width: 18,
    height: 18,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 2,
  },
  gallerySquare: {
    width: 8,
    height: 8,
    borderRadius: 1,
    backgroundColor: "#FFFFFF",
  },
  resolutionIndicator: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 12,
  },
  timestampPreview: {
    position: "absolute",
    bottom: 120,
    left: Spacing.md,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 4,
  },
  timestampText: {
    fontFamily: Platform.select({ ios: "Courier", android: "monospace", default: "monospace" }),
    fontSize: 12,
    fontWeight: "bold",
  },
  bottomControls: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  shutterButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.dark.backgroundSecondary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  shutterButtonPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.8,
  },
  shutterButtonDisabled: {
    opacity: 0.5,
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
    borderWidth: 3,
    borderColor: Colors.dark.backgroundRoot,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: Colors.dark.backgroundRoot,
    justifyContent: "center",
    alignItems: "center",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    flex: 1,
    resizeMode: "contain",
  },
  previewControls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  previewButton: {
    paddingHorizontal: Spacing.xl * 2,
    paddingVertical: Spacing.lg,
    borderRadius: 25,
    minWidth: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  retakeButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
  saveButton: {
    backgroundColor: Colors.dark.backgroundSecondary,
  },
  previewButtonPressed: {
    opacity: 0.7,
  },
  previewButtonDisabled: {
    opacity: 0.5,
  },
  previewButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
});
