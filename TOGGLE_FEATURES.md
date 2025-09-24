# 2D/3D Toggle Features

## Overview

This implementation adds a toggle between 2D depth chart and 3D orderbook bars visualization with enhanced animations and continuous updates.

## Features Added

### 1. View Toggle Component (`ViewToggle.tsx`)

- **Location**: Top-right corner of the screen
- **Functionality**: Switch between 2D and 3D views
- **Visual Feedback**: Shows current mode and description

### 2. Enhanced 3D Orderbook Bars (`OrderbookBars.tsx`)

- **Smooth Animations**: Bars animate height changes over time using lerp interpolation
- **Visual Effects**:
  - Pulsing effect based on time
  - Opacity changes based on data age
  - Enhanced materials with emissive properties
- **Continuous Updates**: Real-time updates with smooth transitions
- **Performance Optimized**: Limited to 50 bars per side to maintain performance
- **Visual Enhancements**:
  - Grid helper for better depth perception
  - Price labels on significant levels
  - Central price line separator
  - Volume indicators (BIDS/ASKS labels)

### 3. Control Panel (`ControlPanel.tsx`)

- **Location**: Bottom-left corner (when enabled)
- **Features**:
  - Connection status indicator
  - Update counter
  - View mode toggle
  - Auto-rotation controls (3D only)
  - Rotation speed slider
  - Performance stats toggle

### 4. State Management Updates (`settingslice.ts`)

- Added `viewMode` to UI state ("2d" | "3d")
- Added `toggleViewMode()` action
- Added `setViewMode()` action

### 5. Enhanced OrderbookScene (`OrderbookScene.tsx`)

- **Conditional Rendering**: Shows 2D or 3D based on view mode
- **Enhanced 3D Lighting**: Multiple light sources for better visual quality
- **Improved Camera Controls**: Better positioning and constraints for 3D view

## Usage

### Toggle Between Views

- Use the toggle switch in the top-right corner
- Or use the control panel button (when control panel is enabled)

### 3D View Controls

- **Mouse**: Orbit around the scene
- **Scroll**: Zoom in/out
- **Auto-rotation**: Enable/disable in control panel
- **Rotation Speed**: Adjust in control panel

### 2D View

- Shows traditional depth chart with cumulative quantities
- Green area for bids, red area for asks
- Interactive grid and price labels

## Technical Implementation

### Animation System

```typescript
// Smooth height transitions using Three.js lerp
currentHeight: THREE.MathUtils.lerp(
  bar.currentHeight,
  bar.targetHeight,
  animationSpeed
);
```

### Visual Effects

```typescript
// Pulsing effect
const pulseIntensity = Math.sin(timeRef.current * 3 + index * 0.5) * 0.1 + 0.9;

// Age-based opacity
const ageOpacity = Math.max(0.3, 1 - bar.age * 0.1);
```

### Performance Optimizations

- Shared geometry for all bars
- Limited number of bars (50 per side)
- Efficient material management
- Proper cleanup of Three.js resources

## Configuration

### Default Settings

- View Mode: 3D
- Auto-rotation: Enabled
- Rotation Speed: 1x
- Control Panel: Visible
- Performance Stats: Hidden (except in development)

### Customization

All settings can be modified through the Redux store or control panel UI.

## Future Enhancements

- Volume-based bar thickness
- Historical data trails
- Custom color schemes
- Export functionality
- VR/AR support preparation
