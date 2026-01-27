# AnimatedBackground.tsx

## Purpose
Renders the animated canvas backdrop used on menu screens, including galaxy particles, drifting asteroids, and the warm sun vignette.

## Dependencies
### Imports
- `react` for `useEffect` and `useRef`.

### Used By
- `src/App.tsx` uses the animated background behind menu screens.

## Key Components
### `AnimatedBackground`
- **Purpose:** Draws the menu background animation on a canvas element.
- **Parameters:** `particleCount`, `color`, and `galaxyCount` control particle density, palette, and galaxy clusters.
- **Returns:** A full-screen canvas element positioned behind menu UI.
- **Notes:** Handles resize events, animation loops, and optional background push effects.

### Sun Vignette Layer
- **Purpose:** Adds a warm sun glow in the top-left corner for the main menu mood.
- **Notes:** Rendered at 20% opacity with a radial gradient for soft lighting.

### Asteroid Drift Layer
- **Purpose:** Adds small spinning asteroids that drift on and off screen, casting soft shadows away from the sun.
- **Notes:** Asteroids respawn after leaving the viewport to maintain motion.

## Terminology
- **Galaxy Particle:** A particle that orbits a galaxy center rather than drifting freely.
- **Sun Vignette:** The warm gradient glow drawn in the top-left corner.

## Implementation Notes
### Critical Details
- Canvas size is bound to the viewport and reinitializes particles on resize.
- Asteroid shadows are offset using the sun-to-asteroid vector to fake directional lighting.
- The sun/asteroid layer uses a fixed global alpha to meet the 20% opacity requirement.

### Known Issues
- None documented.

## Future Changes
### Planned
- None documented.

### Needed
- Consider exposing asteroid count and sun intensity as props if more customization is needed.

## Change History
- **2025-03-26:** Added the sun vignette and drifting asteroid layer to the menu background.

## Watch Out For
- Keep animation work lightweight to avoid impacting menu performance.
- Ensure any new layers reset on resize to prevent stale canvas state.
