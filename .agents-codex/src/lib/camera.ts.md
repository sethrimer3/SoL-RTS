# camera.ts

## Purpose
Defines the camera system for the game, including initialization, smooth zooming/panning, and coordinate transforms between world and screen space.

## Dependencies
### Imports
- `./types` - GameState and world constants for camera calculations.
- `./gameUtils` - Viewport scale, offsets, and arena sizing helpers.

### Used By
- `src/App.tsx` - Initializes and updates the camera during the game loop.
- `src/lib/renderer.ts` - Applies camera transforms during rendering.

## Key Components

### getMobileButtonBarHeight(state: GameState)
- **Purpose:** Reserves pixel space for the mobile button action bar when in button mode.
- **Returns:** Number of pixels to exclude from the visible playfield height.
- **Notes:** Keeps the minimum zoom aligned with the area above the mobile controls.

### calculateMinZoom(state: GameState)
- **Purpose:** Computes the smallest allowed zoom that keeps the full arena visible.
- **Returns:** Minimum zoom factor based on viewport and arena dimensions.
- **Notes:** Accounts for mobile UI chrome by shrinking the usable height.

### initializeCamera(state: GameState)
- **Purpose:** Creates the camera state with initial offsets and zoom.
- **Notes:** On mobile, starts at the minimum zoom so the arena clears the bottom controls.

### updateCamera(state: GameState, deltaTime: number)
- **Purpose:** Smoothly interpolates zoom and offset toward targets.
- **Notes:** Clamps zoom based on dynamic min zoom bounds each frame.

### zoomCamera / zoomCameraAtPoint
- **Purpose:** Adjusts target zoom with scroll or pinch gestures.
- **Notes:** Pinch zoom keeps the pinch center stable in screen space.

### panCamera(state: GameState, direction: Vector2, deltaTime: number)
- **Purpose:** Shifts camera target offset based on movement input.

### resetCamera(state: GameState)
- **Purpose:** Returns camera to default offset and zoom.

### focusCamera(state: GameState, position: Vector2)
- **Purpose:** Centers the camera on a given world position.

### applyCameraTransform / removeCameraTransform
- **Purpose:** Applies and restores canvas transforms for camera-aware rendering.

### screenToWorld / worldToScreen
- **Purpose:** Converts between screen and world coordinates respecting camera state.

## Terminology
- **Viewport Scale:** Scaling factor that fits the arena within the current window size.
- **Zoom:** Camera scale multiplier applied on top of the viewport scale.
- **Offset:** Camera translation in world-space meters.

## Implementation Notes
### Critical Details
- Minimum zoom is recalculated every frame to stay aligned with viewport changes.
- Mobile button mode reserves UI height to keep the arena fully visible.

### Known Issues
- None documented.

## Future Changes
### Planned
- None documented.

### Needed
- Consider deriving UI reservation height from actual DOM measurements if layouts change.

## Change History
- **2025-03-24:** Added mobile button bar reservation to the minimum zoom calculation.

## Watch Out For
- Keep zoom bounds in sync with any UI layout changes that affect the playfield size.
