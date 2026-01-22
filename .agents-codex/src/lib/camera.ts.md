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

### clampCameraOffset(state: GameState, offset: Vector2, zoom: number)
- **Purpose:** Restricts camera offsets so the visible viewport stays within the arena bounds, with a small wall peek.
- **Returns:** Clamped offset values in world-space meters.
- **Notes:** Computes view extents from zoom and viewport size, then converts pixel bounds back to meters.

### getMobileButtonBarHeight(state: GameState)
- **Purpose:** Reserves pixel space for the mobile button action bar when in button mode.
- **Returns:** Number of pixels to exclude from the visible playfield height.
- **Notes:** Keeps the minimum zoom aligned with the area above the mobile controls.

### calculateMinZoom(state: GameState)
- **Purpose:** Computes the smallest allowed zoom that keeps the full arena visible.
- **Returns:** Minimum zoom factor based on viewport and arena dimensions.
- **Notes:** Accounts for mobile UI chrome by shrinking the usable height.

### initializeCamera(state: GameState, options?: CameraInitializationOptions)
- **Purpose:** Creates the camera state with initial offsets and zoom.
- **Notes:** On mobile, starts at the minimum zoom so the arena clears the bottom controls, unless an explicit initial zoom/focus override is provided.

### updateCamera(state: GameState, deltaTime: number)
- **Purpose:** Smoothly interpolates zoom and offset toward targets.
- **Notes:** Clamps zoom based on dynamic min zoom bounds each frame and constrains offsets to keep the arena within view.

### zoomCamera / zoomCameraAtPoint
- **Purpose:** Adjusts target zoom with scroll or pinch gestures.
- **Notes:** Pinch zoom keeps the pinch center stable in screen space and re-clamps offsets after zooming.

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
- The minimum zoom now matches the full-field fit exactly so players cannot zoom out past the full arena.
- Pinch zoom alignment uses target offsets to keep the pinch center anchored during smoothing.
- Offset clamping prevents panning outside the arena while still allowing a small wall peek at the edges.

### Known Issues
- None documented.

## Future Changes
### Planned
- None documented.

### Needed
- Consider deriving UI reservation height from actual DOM measurements if layouts change.

## Change History
- **2025-03-24:** Added mobile button bar reservation to the minimum zoom calculation.
- **2025-03-24:** Aligned pinch zoom world-point calculations with target offsets to reduce center drift.
- **2025-03-24:** Added initialization options for focus/zoom and removed the fixed zoom-out floor so the max zoom-out matches the full-field fit.
- **2025-03-25:** Added camera offset clamping to keep the zoomed-in view within arena bounds while leaving a slight wall peek.

## Watch Out For
- Keep zoom bounds in sync with any UI layout changes that affect the playfield size.
