import { useState, useEffect } from "react";
import { View, StyleSheet, Text, Switch, Pressable } from "react-native";
import { Colors, Spacing } from "@/constants/theme";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import {
  loadSettings,
  saveSettings,
  type CameraSettings,
  type Resolution,
} from "@/utils/settings";

export default function SettingsScreen() {
  const [settings, setSettings] = useState<CameraSettings | null>(null);

  useEffect(() => {
    loadSettings().then(setSettings);
  }, []);

  const updateSetting = async <K extends keyof CameraSettings>(
    key: K,
    value: CameraSettings[K]
  ) => {
    if (!settings) return;
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    await saveSettings(updated);
  };

  if (!settings) {
    return <View style={styles.container} />;
  }

  return (
    <ScreenScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Image Settings</Text>

        <View style={styles.settingRow}>
          <Text style={styles.label}>Resolution</Text>
          <View style={styles.segmentedControl}>
            <Pressable
              style={({ pressed }) => [
                styles.segment,
                settings.resolution === "640x480" && styles.segmentActive,
                pressed && styles.segmentPressed,
              ]}
              onPress={() => updateSetting("resolution", "640x480")}
            >
              <Text
                style={[
                  styles.segmentText,
                  settings.resolution === "640x480" && styles.segmentTextActive,
                ]}
              >
                VGA (640x480)
              </Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.segment,
                settings.resolution === "320x240" && styles.segmentActive,
                pressed && styles.segmentPressed,
              ]}
              onPress={() => updateSetting("resolution", "320x240")}
            >
              <Text
                style={[
                  styles.segmentText,
                  settings.resolution === "320x240" && styles.segmentTextActive,
                ]}
              >
                QVGA (320x240)
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.settingRow}>
          <View style={styles.labelContainer}>
            <Text style={styles.label}>JPEG Compression</Text>
            <Text style={styles.sublabel}>
              {settings.compressionQuality === 0.1
                ? "High (Heavy artifacts)"
                : settings.compressionQuality === 0.3
                ? "Medium"
                : "Low"}
            </Text>
          </View>
          <View style={styles.compressionButtons}>
            {[
              { value: 0.5, label: "Low" },
              { value: 0.3, label: "Med" },
              { value: 0.1, label: "High" },
            ].map((option) => (
              <Pressable
                key={option.value}
                style={({ pressed }) => [
                  styles.compressionButton,
                  settings.compressionQuality === option.value &&
                    styles.compressionButtonActive,
                  pressed && styles.segmentPressed,
                ]}
                onPress={() => updateSetting("compressionQuality", option.value)}
              >
                <Text
                  style={[
                    styles.compressionButtonText,
                    settings.compressionQuality === option.value &&
                      styles.compressionButtonTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Retro Effects</Text>

        <View style={styles.settingRow}>
          <Text style={styles.label}>Vignette Effect</Text>
          <Switch
            value={settings.vignetteEnabled}
            onValueChange={(value) => updateSetting("vignetteEnabled", value)}
            trackColor={{ false: "#3A3A3C", true: "#52A57C" }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.label}>Noise and Grain</Text>
          <Switch
            value={settings.noiseEnabled}
            onValueChange={(value) => updateSetting("noiseEnabled", value)}
            trackColor={{ false: "#3A3A3C", true: "#52A57C" }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Camera</Text>

        <View style={styles.settingRow}>
          <Text style={styles.label}>Default Camera</Text>
          <View style={styles.segmentedControl}>
            <Pressable
              style={({ pressed }) => [
                styles.segment,
                settings.defaultCamera === "back" && styles.segmentActive,
                pressed && styles.segmentPressed,
              ]}
              onPress={() => updateSetting("defaultCamera", "back")}
            >
              <Text
                style={[
                  styles.segmentText,
                  settings.defaultCamera === "back" && styles.segmentTextActive,
                ]}
              >
                Back
              </Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.segment,
                settings.defaultCamera === "front" && styles.segmentActive,
                pressed && styles.segmentPressed,
              ]}
              onPress={() => updateSetting("defaultCamera", "front")}
            >
              <Text
                style={[
                  styles.segmentText,
                  settings.defaultCamera === "front" && styles.segmentTextActive,
                ]}
              >
                Front
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>03cam v1.0.0</Text>
        <Text style={styles.footerSubtext}>
          Emulating the feel of year 2000 digital cameras
        </Text>
      </View>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.backgroundRoot,
  },
  section: {
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.backgroundDefault,
  },
  sectionTitle: {
    color: Colors.dark.text,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: Spacing.md,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  labelContainer: {
    flex: 1,
  },
  label: {
    color: Colors.dark.text,
    fontSize: 16,
  },
  sublabel: {
    color: "#B0C4BC",
    fontSize: 14,
    marginTop: 4,
  },
  segmentedControl: {
    flexDirection: "row",
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: 8,
    overflow: "hidden",
  },
  segment: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  segmentActive: {
    backgroundColor: Colors.dark.backgroundSecondary,
  },
  segmentPressed: {
    opacity: 0.7,
  },
  segmentText: {
    color: "#B0C4BC",
    fontSize: 14,
  },
  segmentTextActive: {
    color: Colors.dark.text,
    fontWeight: "600",
  },
  compressionButtons: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  compressionButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    backgroundColor: Colors.dark.backgroundDefault,
  },
  compressionButtonActive: {
    backgroundColor: Colors.dark.backgroundSecondary,
  },
  compressionButtonText: {
    color: "#B0C4BC",
    fontSize: 14,
  },
  compressionButtonTextActive: {
    color: Colors.dark.text,
    fontWeight: "600",
  },
  footer: {
    padding: Spacing.xl,
    alignItems: "center",
  },
  footerText: {
    color: Colors.dark.text,
    fontSize: 14,
    fontWeight: "600",
  },
  footerSubtext: {
    color: "#6B7F77",
    fontSize: 12,
    marginTop: 4,
  },
});
