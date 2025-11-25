import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import * as MediaLibrary from "expo-media-library";
import { Skia, TileMode, FilterMode, MipmapMode } from "@shopify/react-native-skia";
import * as ExpoFileSystem from "expo-file-system";
import type { CameraSettings, Resolution } from "./settings";

export function getResolutionDimensions(resolution: Resolution): {
  width: number;
  height: number;
} {
  switch (resolution) {
    case "640x480":
      return { width: 640, height: 480 };
    case "320x240":
      return { width: 320, height: 240 };
  }
}

function createY2KShader(randomSeed: number) {
  try {
    return Skia.RuntimeEffect.Make(`
uniform shader image;
uniform vec2 resolution;
uniform float intensity;
uniform float noiseStrength;
uniform float vignetteStrength;
uniform float colorShift;
uniform float randomSeed;

float random(vec2 co) {
  return fract(sin(dot(co.xy, vec2(12.9898 + randomSeed, 78.233 + randomSeed))) * 43758.5453);
}

half4 main(vec2 fragCoord) {
  vec2 uv = fragCoord / resolution;
  half4 color = image.eval(fragCoord);
  
  if (noiseStrength > 0.0) {
    float noise = (random(fragCoord) - 0.5) * noiseStrength;
    color.r = clamp(color.r + noise, 0.0, 1.0);
    color.g = clamp(color.g + noise, 0.0, 1.0);
    color.b = clamp(color.b + noise, 0.0, 1.0);
  }
  
  if (vignetteStrength > 0.0) {
    vec2 center = uv - 0.5;
    float dist = length(center) * 2.0;
    float vignette = smoothstep(0.4 + vignetteStrength * 0.4, 1.2, dist);
    color.rgb *= (1.0 - vignette * vignetteStrength);
  }
  
  if (colorShift > 0.0) {
    color.g = clamp(color.g * (1.0 + colorShift * 0.18), 0.0, 1.0);
    color.b = clamp(color.b * (1.0 - colorShift * 0.12), 0.0, 1.0);
  }
  
  float lum = (color.r + color.g + color.b) / 3.0;
  if (lum < 0.25) {
    color.rgb *= 0.6;
  } else if (lum > 0.85) {
    color.rgb = min(color.rgb * 1.15, 1.0);
  }
  
  return half4(color.rgb, 1.0);
}
    `);
  } catch (error) {
    console.error("Failed to create Y2K shader:", error);
    return null;
  }
}

async function applySkiaEffects(
  photoUri: string,
  settings: CameraSettings,
  width: number,
  height: number
): Promise<string | null> {
  try {
    const base64 = await ExpoFileSystem.readAsStringAsync(photoUri, {
      encoding: ExpoFileSystem.EncodingType.Base64,
    });
    
    const data = Skia.Data.fromBase64(base64);
    const image = Skia.Image.MakeImageFromEncoded(data);
    
    if (!image) {
      throw new Error("Failed to decode image");
    }

    const surface = Skia.Surface.MakeOffscreen(width, height);
    if (!surface) {
      throw new Error("Failed to create surface");
    }

    const canvas = surface.getCanvas();
    const paint = Skia.Paint();

    const randomSeed = Math.random() * 1000;
    const shader = createY2KShader(randomSeed);
    if (!shader) {
      throw new Error("Failed to create shader");
    }

    const imageShader = image.makeShaderOptions(
      TileMode.Clamp,
      TileMode.Clamp,
      FilterMode.Linear,
      MipmapMode.None
    );

    const uniforms = [
      width,
      height,
      settings.effectIntensity,
      settings.noiseEnabled ? settings.effectIntensity * 0.1 : 0.0,
      settings.vignetteEnabled ? settings.effectIntensity * 0.5 : 0.0,
      settings.effectIntensity * 0.4,
      randomSeed,
    ];
    
    const runtimeShader = shader.makeShaderWithChildren(uniforms, [imageShader]);

    paint.setShader(runtimeShader);
    canvas.drawRect({ x: 0, y: 0, width, height }, paint);

    surface.flush();
    const snapshot = surface.makeImageSnapshot();
    const pngData = snapshot.encodeToBase64();
    
    const outputPath = `${ExpoFileSystem.documentDirectory}skia_${Date.now()}.png`;
    await ExpoFileSystem.writeAsStringAsync(outputPath, pngData, {
      encoding: ExpoFileSystem.EncodingType.Base64,
    });

    return outputPath;
  } catch (error) {
    console.error("Skia effects failed:", error);
    return null;
  }
}

export async function processPhoto(
  photoUri: string,
  settings: CameraSettings
): Promise<string> {
  try {
    const { width, height } = getResolutionDimensions(settings.resolution);

    let resizedUri = photoUri;
    const resizeResult = await manipulateAsync(photoUri, [{ resize: { width, height } }], {
      compress: 1.0,
      format: SaveFormat.JPEG,
    });
    resizedUri = resizeResult.uri;

    let processedUri = resizedUri;
    
    if (settings.noiseEnabled || settings.vignetteEnabled) {
      const skiaResult = await applySkiaEffects(resizedUri, settings, width, height);
      if (skiaResult) {
        processedUri = skiaResult;
      }
    }

    const compressionLevel = settings.compressionQuality * (0.4 + 0.6 * (1 - settings.effectIntensity));
    
    const finalResult = await manipulateAsync(processedUri, [], {
      compress: Math.max(0.05, Math.min(0.7, compressionLevel)),
      format: SaveFormat.JPEG,
    });

    return finalResult.uri;
  } catch (error) {
    console.error("Failed to process photo:", error);
    throw error;
  }
}

export async function savePhotoToGallery(uri: string): Promise<void> {
  try {
    await MediaLibrary.createAssetAsync(uri);
  } catch (error: any) {
    console.error("Failed to save photo to gallery:", error);
    throw new Error("Failed to save photo. Please try again.");
  }
}
