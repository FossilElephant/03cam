import { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  Image,
  Pressable,
  Alert,
  Dimensions,
  Platform,
} from "react-native";
import * as MediaLibrary from "expo-media-library";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Colors, Spacing } from "@/constants/theme";

const { width } = Dimensions.get("window");
const COLUMN_COUNT = 3;
const SPACING = 2;
const ITEM_SIZE = (width - SPACING * (COLUMN_COUNT + 1)) / COLUMN_COUNT;

export default function GalleryScreen() {
  const [permission, requestPermission] = Platform.OS !== 'android' 
    ? MediaLibrary.usePermissions() 
    : [null, () => Promise.resolve({ granted: false })];
  const [photos, setPhotos] = useState<MediaLibrary.Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAndroidPermissionInfo, setShowAndroidPermissionInfo] = useState(false);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    try {
      if (Platform.OS === 'android') {
        try {
          const album = await MediaLibrary.getAlbumAsync("Camera");
          if (album) {
            const { assets } = await MediaLibrary.getAssetsAsync({
              album: album,
              mediaType: "photo",
              sortBy: MediaLibrary.SortBy.creationTime,
              first: 100,
            });
            setPhotos(assets);
          }
        } catch (androidError: any) {
          console.error("Gallery access error on Android:", androidError);
          setShowAndroidPermissionInfo(true);
        }
      } else {
        const { status: existingStatus } = await MediaLibrary.getPermissionsAsync();
        
        if (existingStatus !== "granted") {
          const result = await requestPermission();
          if (!result.granted) {
            setLoading(false);
            return;
          }
        }

        const album = await MediaLibrary.getAlbumAsync("Camera");
        if (album) {
          const { assets } = await MediaLibrary.getAssetsAsync({
            album: album,
            mediaType: "photo",
            sortBy: MediaLibrary.SortBy.creationTime,
            first: 100,
          });
          setPhotos(assets);
        }
      }
    } catch (error) {
      console.error("Failed to load photos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePhoto = async (asset: MediaLibrary.Asset) => {
    Alert.alert("Delete Photo", "Are you sure you want to delete this photo?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await MediaLibrary.deleteAssetsAsync([asset]);
            setPhotos((prev) => prev.filter((p) => p.id !== asset.id));
          } catch (error) {
            console.error("Failed to delete photo:", error);
            Alert.alert("Error", "Failed to delete photo");
          }
        },
      },
    ]);
  };

  if (Platform.OS === 'android' && showAndroidPermissionInfo) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <View
          style={{
            paddingTop: insets.top + Spacing.lg,
            paddingBottom: insets.bottom + Spacing.xl,
            paddingHorizontal: Spacing.xl,
            alignItems: "center",
            gap: Spacing.lg,
          }}
        >
          <View style={styles.imageIcon}>
            <View style={styles.imageMountain} />
            <View style={styles.imageSun} />
          </View>
          <Text style={styles.emptyText}>Storage Permission Required</Text>
          <Text style={[styles.emptySubtext, { textAlign: 'center' }]}>
            To view and save photos, grant storage permissions:
          </Text>
          <View style={{ gap: Spacing.sm, width: '100%' }}>
            <Text style={styles.emptySubtext}>1. Exit this app</Text>
            <Text style={styles.emptySubtext}>2. Go to Settings then Apps then 03cam</Text>
            <Text style={styles.emptySubtext}>3. Tap Permissions</Text>
            <Text style={styles.emptySubtext}>4. Enable Storage/Media access</Text>
            <Text style={styles.emptySubtext}>5. Return to this app</Text>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.permissionButton,
              pressed && styles.permissionButtonPressed,
            ]}
            onPress={() => {
              setShowAndroidPermissionInfo(false);
              loadPhotos();
            }}
          >
            <Text style={styles.permissionButtonText}>Retry</Text>
          </Pressable>
        </View>
        <Pressable
          style={[styles.closeButton, { top: insets.top + Spacing.sm }]}
          onPress={() => navigation.goBack()}
        >
          <View style={styles.closeIcon}>
            <View style={styles.closeLine1} />
            <View style={styles.closeLine2} />
          </View>
        </Pressable>
      </View>
    );
  }

  if (Platform.OS !== 'android' && !permission?.granted) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <View
          style={{
            paddingTop: insets.top + Spacing.lg,
            paddingBottom: insets.bottom + Spacing.xl,
            alignItems: "center",
            gap: Spacing.lg,
          }}
        >
          <View style={styles.imageIcon}>
            <View style={styles.imageMountain} />
            <View style={styles.imageSun} />
          </View>
          <Text style={styles.emptyText}>
            Gallery access required to view photos
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
        <Pressable
          style={[styles.closeButton, { top: insets.top + Spacing.sm }]}
          onPress={() => navigation.goBack()}
        >
          <View style={styles.closeIcon}>
            <View style={styles.closeLine1} />
            <View style={styles.closeLine2} />
          </View>
        </Pressable>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.emptyText}>Loading photos...</Text>
      </View>
    );
  }

  if (photos.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <View
          style={{
            paddingTop: insets.top + Spacing.lg,
            paddingBottom: insets.bottom + Spacing.xl,
            alignItems: "center",
            gap: Spacing.lg,
          }}
        >
          <View style={styles.cameraIcon}>
            <View style={styles.cameraLens} />
          </View>
          <Text style={styles.emptyText}>No photos yet</Text>
          <Text style={styles.emptySubtext}>
            Capture your first retro photo!
          </Text>
        </View>
        <Pressable
          style={[styles.closeButton, { top: insets.top + Spacing.sm }]}
          onPress={() => navigation.goBack()}
        >
          <View style={styles.closeIcon}>
            <View style={styles.closeLine1} />
            <View style={styles.closeLine2} />
          </View>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + Spacing.sm },
        ]}
      >
        <Pressable
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <View style={styles.closeIcon}>
            <View style={styles.closeLine1} />
            <View style={styles.closeLine2} />
          </View>
        </Pressable>
        <Text style={styles.headerTitle}>Gallery</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={photos}
        numColumns={COLUMN_COUNT}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.xl }}
        renderItem={({ item }) => (
          <Pressable
            style={styles.photoItem}
            onLongPress={() => handleDeletePhoto(item)}
          >
            <Image source={{ uri: item.uri }} style={styles.photo} />
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.backgroundRoot,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.backgroundDefault,
  },
  headerTitle: {
    color: Colors.dark.text,
    fontSize: 18,
    fontWeight: "600",
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    left: Spacing.md,
    zIndex: 10,
  },
  closeIcon: {
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  closeLine1: {
    position: "absolute",
    width: 18,
    height: 2,
    backgroundColor: "#FFFFFF",
    borderRadius: 1,
    transform: [{ rotate: "45deg" }],
  },
  closeLine2: {
    position: "absolute",
    width: 18,
    height: 2,
    backgroundColor: "#FFFFFF",
    borderRadius: 1,
    transform: [{ rotate: "-45deg" }],
  },
  imageIcon: {
    width: 64,
    height: 48,
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: 8,
    justifyContent: "flex-end",
    alignItems: "center",
    overflow: "hidden",
  },
  imageMountain: {
    width: 0,
    height: 0,
    borderLeftWidth: 20,
    borderRightWidth: 20,
    borderBottomWidth: 24,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: Colors.dark.text,
    position: "absolute",
    bottom: 0,
  },
  imageSun: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.dark.text,
    position: "absolute",
    top: 8,
    right: 12,
  },
  cameraIcon: {
    width: 64,
    height: 48,
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  cameraLens: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: Colors.dark.text,
  },
  emptyText: {
    color: Colors.dark.text,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  emptySubtext: {
    color: "#6B7F77",
    fontSize: 14,
    textAlign: "center",
  },
  permissionButton: {
    backgroundColor: Colors.dark.backgroundSecondary,
    paddingHorizontal: Spacing.xl,
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
  photoItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    margin: SPACING / 2,
  },
  photo: {
    width: "100%",
    height: "100%",
  },
});
