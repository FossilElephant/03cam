# 03cam - Y2K Retro Camera App

## Project Overview
03cam is an Android camera app that emulates the aesthetic of year 2000 digital cameras with 0.3MP sensors. The app captures photos and applies retro effects to recreate the authentic look of early digital photography.

## Architecture

### Tech Stack
- **Framework**: Expo SDK 54 / React Native
- **Navigation**: React Navigation 7
- **Storage**: AsyncStorage for settings persistence
- **Image Processing**: expo-image-manipulator
- **Camera**: expo-camera
- **Media Library**: expo-media-library

### Navigation Structure
Stack-only navigation with 4 screens:
- Permissions Screen (initial) - Requests camera and storage permissions at startup
- Camera Screen - Full-screen camera preview with capture controls
- Settings Screen (modal) - Configuration options
- Gallery Screen (modal) - View captured photos

### Design System
**Theme**: Dark green color palette inspired by LCD screens of old digital cameras
- Background: `#0D1F17`
- Surface: `#2D5A4A`
- Primary Accent: `#3D7A5F`
- Text: `#FFFFFF`

**Typography**: System fonts with monospace for timestamps
**Spacing**: 8dp base grid (4, 8, 16, 24, 32, 48dp)

## Features Implemented

### Core MVP Features
1. **Camera Functionality**
   - Full-screen camera preview
   - Front/back camera toggle
   - Flash control (auto/on/off)
   - Photo capture with haptic feedback
   - Save to device gallery

2. **Y2K Photo Effects**
   - Resolution downscaling (640×480 VGA, 320×240 QVGA)
   - Heavy JPEG compression (adjustable 10-50%)
   - Edge softness via multi-pass resize
   - Vignette and noise/grain effects

3. **Settings**
   - Resolution selector (VGA/QVGA)
   - JPEG compression level (Low/Medium/High)
   - Vignette effect toggle
   - Noise/grain toggle
   - Default camera selection

4. **Gallery**
   - Grid view of captured photos
   - Long-press to delete
   - Permission handling

### Technical Limitations

**expo-image-manipulator constraints**:
The library only supports basic operations (resize, rotate, flip, crop, compress). Advanced pixel-level effects like color grading, RGB noise, vignetting, and timestamp overlays require either:
- Native modules (not compatible with Expo Go)
- Canvas/WebGL (unreliable in React Native)
- Custom native image processing library

**Current workarounds**:
- Heavy JPEG compression creates authentic block artifacts
- Multi-pass resize operations create edge softness and blur
- Low resolution naturally creates pixelated look
- Compression + resize combo approximates the Y2K aesthetic

**Settings that are toggles only** (not fully applied to images):
- `timestampEnabled` - Preview shown but not burned into saved photo
- `vignetteEnabled` - Controls blur intensity
- `noiseEnabled` - Controls blur intensity
- Timestamp format/color - UI only, not applied to photos

### File Structure
```
/screens
  - CameraScreen.tsx       # Main camera interface
  - SettingsScreen.tsx     # Configuration UI
  - GalleryScreen.tsx      # Photo grid viewer

/utils
  - settings.ts            # AsyncStorage persistence
  - photoProcessing.ts     # Image manipulation pipeline

/navigation
  - RootStackNavigator.tsx # Stack navigation setup

/constants
  - theme.ts               # Design tokens
```

## User Preferences
- Dark mode only (matches retro camera LCD aesthetic)
- Simple, minimal UI (no unnecessary decorations)
- Maximum focus on camera preview
- Settings persist across sessions

## Recent Changes
- Removed expo-av dependency (deprecated in SDK 54)
- Implemented Y2K photo processing within expo-image-manipulator constraints
- Added haptic feedback for shutter instead of audio
- Created complete settings persistence system
- Removed unused template files

## Known Issues
1. CameraView doesn't support children (controls use absolute positioning)
2. EXIF orientation metadata may be lost during image processing (photos may appear rotated in some galleries)
3. Icons use View-based geometric shapes for consistent rendering across platforms

## Next Features (Future Development)
- Custom save folder organization
- Additional vintage camera presets
- Horizontal banding effect for low-light
- Photo sharing functionality
- Customizable timestamp fonts from different camera brands
- Consider native image processing module for true pixel-level effects
