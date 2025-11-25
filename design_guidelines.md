# 03cam Design Guidelines

## Architecture Decisions

### Authentication
**No authentication required.** This is a single-user utility camera app with local storage only. All photos save directly to the device gallery.

### Navigation
**Stack-Only Navigation** - The app uses a simple linear navigation structure:
- Camera screen (home/root)
- Settings screen (modal overlay)
- Gallery preview screen (full-screen modal)

No tab bar or drawer needed - keep it minimal like Y2K digital cameras.

## Screen Specifications

### 1. Camera Screen (Root)
**Purpose:** Capture photos with Y2K retro effects

**Layout:**
- **Header:** None - full-screen camera preview for maximum immersion
- **Main Content:** 
  - Full-screen camera preview (not scrollable)
  - Floating shutter button centered at bottom
  - Floating controls overlaid on preview
- **Safe Area Insets:**
  - Top: `insets.top + Spacing.lg`
  - Bottom: `insets.bottom + Spacing.xl`

**Components:**
- Camera preview (full screen)
- Large circular shutter button (70dp diameter) - center bottom with dark green fill and white camera icon
- Settings icon button (top-right) - opens Settings screen
- Camera flip icon button (top-left) - toggles front/back camera
- Flash toggle button (top-right, next to settings) - cycles through auto/on/off states
- Current resolution indicator (subtle text overlay, top-center) - shows "VGA" or "QVGA"
- Timestamp preview (bottom-left corner) - shows how timestamp will appear if enabled

**Visual Feedback:**
- Shutter button: subtle scale animation (0.95x) on press + opacity 0.8
- Camera flip: rotate animation when switching
- Flash icon changes color: yellow (auto), white (on), gray (off)

### 2. Settings Screen (Modal)
**Purpose:** Configure camera resolution, effects, and timestamp options

**Layout:**
- **Header:** Material Design top app bar with "Settings" title, close button (left)
- **Main Content:** Scrollable form/list
- **Safe Area Insets:**
  - Top: `Spacing.xl` (header handles safe area)
  - Bottom: `insets.bottom + Spacing.xl`

**Components (organized in sections):**

**Image Settings:**
- Resolution selector (segmented control or radio buttons):
  - 640×480 (VGA) [default]
  - 320×240 (QVGA)
- JPEG compression slider (Low/Medium/High) - controls artifact intensity
- Effect intensity slider (0-100%) - global effect strength multiplier

**Retro Effects:**
- Timestamp toggle switch with preview
- Timestamp format selector (when enabled):
  - YYYY.MM.DD HH:MM [default]
  - DD/MM/YYYY HH:MM
- Timestamp color picker: Yellow/Red/White
- Vignette toggle switch
- Noise/grain toggle switch

**Camera:**
- Shutter sound toggle switch
- Default camera (front/back) selector

**Visual Design:**
- Dark green background (#0D1F17)
- White text labels
- Green accent switches (#2D5A4A)
- Card-style sections with subtle dividers

### 3. Gallery Preview Screen (Full-Screen Modal)
**Purpose:** View recently captured retro photos within the app

**Layout:**
- **Header:** Minimal translucent header with back button (left), share button (right)
- **Main Content:** 
  - Horizontal paginated image gallery (swipeable)
  - Photo counter indicator (e.g., "3/12")
- **Safe Area Insets:**
  - Top: `headerHeight + Spacing.lg`
  - Bottom: `insets.bottom + Spacing.lg`

**Components:**
- Full-screen image viewer with pinch-to-zoom
- Delete button (bottom-right floating action button)
- Image metadata display (bottom overlay, toggleable) - shows resolution, timestamp, file size
- Previous/next navigation (swipe gestures)

## Design System

### Color Palette (Dark Green Theme)
**Primary Colors:**
- Background Dark: `#0D1F17`
- Background Medium: `#1A2E26`
- Surface: `#2D5A4A`
- Primary Accent: `#3D7A5F`
- Secondary Accent: `#52A57C`

**Functional Colors:**
- Text Primary: `#FFFFFF`
- Text Secondary: `#B0C4BC`
- Text Disabled: `#6B7F77`
- Error: `#FF6B6B`
- Success: `#4CAF50`

**Retro Effect Colors:**
- Timestamp Yellow: `#FFD700`
- Timestamp Red: `#FF4444`
- Timestamp White: `#FFFFFF`
- Vignette Overlay: `#000000` at 40% opacity

### Typography (Material Design 3)
- **Headline:** Roboto Bold, 24sp
- **Title:** Roboto Medium, 20sp
- **Body:** Roboto Regular, 16sp
- **Caption:** Roboto Regular, 12sp
- **Button:** Roboto Medium, 14sp uppercase

### Spacing Scale
- xs: 4dp
- sm: 8dp
- md: 16dp
- lg: 24dp
- xl: 32dp
- xxl: 48dp

### Visual Design Principles

**Camera Interface:**
- Keep UI minimal - camera preview is the hero
- Use semi-transparent overlays (black 30% opacity) behind floating buttons for legibility
- Shutter button should be the most prominent element
- All buttons use Feather icons from `@expo/vector-icons`

**Material Design 3:**
- Use elevated cards for settings sections
- Apply subtle elevation (2dp) to floating action buttons only:
  - shadowOffset: {width: 0, height: 2}
  - shadowOpacity: 0.10
  - shadowRadius: 2
- Corner radius: 12dp for cards, 36dp for shutter button
- Ripple effect on all touchable elements (native Android feedback)

**Y2K Aesthetic Integration:**
- Don't make the UI itself look retro - keep it modern and clean
- The retro aesthetic applies ONLY to captured photos
- Dark green theme evokes the LCD screens of old digital cameras
- Timestamp overlay in photos should use pixelated monospace font (Courier or similar)

### Assets Required

**Icons (use Feather from @expo/vector-icons):**
- camera (shutter button)
- settings (settings access)
- rotate-cw (flip camera)
- zap / zap-off (flash toggle)
- x (close modals)
- share-2 (share photo)
- trash-2 (delete photo)
- image (gallery)

**Custom Assets:**
- App icon: Stylized "03" text in green with camera lens motif (512×512px)
- Splash screen: Same "03" icon on dark green background

**No other custom images needed** - the app's content is user-generated photos with retro processing applied.

### Accessibility Requirements

- All interactive elements minimum 48dp touch target
- Contrast ratio 4.5:1 minimum for text on backgrounds
- Screen reader labels for all icon buttons
- Flash toggle states clearly distinguishable for colorblind users (use icons + text)
- Camera permission request with clear explanation: "03cam needs camera access to capture retro photos"
- Storage permission request: "03cam needs storage access to save your photos"