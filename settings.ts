import AsyncStorage from "@react-native-async-storage/async-storage";

export type Resolution = "640x480" | "320x240";
export type TimestampColor = "yellow" | "red" | "white";
export type FlashMode = "auto" | "on" | "off";

export interface CameraSettings {
  resolution: Resolution;
  compressionQuality: number;
  effectIntensity: number;
  vignetteEnabled: boolean;
  noiseEnabled: boolean;
  defaultCamera: "back" | "front";
  flashMode: FlashMode;
}

const DEFAULT_SETTINGS: CameraSettings = {
  resolution: "640x480",
  compressionQuality: 0.3,
  effectIntensity: 1.0,
  vignetteEnabled: true,
  noiseEnabled: true,
  defaultCamera: "back",
  flashMode: "auto",
};

const SETTINGS_KEY = "@03cam_settings";

export async function loadSettings(): Promise<CameraSettings> {
  try {
    const stored = await AsyncStorage.getItem(SETTINGS_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error("Failed to load settings:", error);
  }
  return DEFAULT_SETTINGS;
}

export async function saveSettings(settings: CameraSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Failed to save settings:", error);
  }
}
