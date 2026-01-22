# fieldParticles.ts

## Purpose
Handles initialization and simulation of ambient field particles that provide mid-field visual/physics feedback.

## Dependencies
### Imports
- `./types` (FieldParticle, GameState, ARENA_WIDTH_METERS, WARP_GATE_MAX_SIZE_METERS, COLORS)
- `./gameUtils` (generateId, getArenaHeight, distance, normalize, subtract)

### Used By
- `src/App.tsx` (initialization and update hooks)
- `src/lib/renderer.ts` (drawing field particles)

## Key Components
### initializeFieldParticles
- **Purpose:** Spawns ambient field particles with a uniform distribution across the arena bounds.
- **Parameters:**
  - `arenaWidth` - Arena width in meters.
  - `arenaHeight` - Arena height in meters.
- **Returns:** Array of initialized `FieldParticle` objects.
- **Notes:** Uses the boundary margin to avoid immediate edge collisions.

### updateFieldParticles
- **Purpose:** Updates particle physics and colors based on repulsion forces and influence zones.
- **Parameters:**
  - `state` - Current `GameState`.
  - `deltaTime` - Time step in seconds.
- **Returns:** None (mutates particle state).
- **Notes:** Applies repulsion from units, structures, bases, mining depots, projectiles, shells, and warp gates.

## Terminology
- **Field Particle:** Lightweight ambient particle used for visual/physics feedback in the playfield.
- **Influence Zone:** Circular area that tints particles based on player ownership.

## Implementation Notes
### Critical Details
- Particles are clamped to arena boundaries with a soft bounce to keep them in-bounds.
- Particle colors fade from neutral grey into blended player colors based on influence strength and overlap.
- Influence tinting converts OKLCH team colors into sRGB for mixing.

### Known Issues
- None noted.

## Future Changes
### Planned
- None noted.

### Needed
- Evaluate performance if particle counts rise further on low-end devices.

## Change History
- **2026-01-22:** Increased particle count, removed density bias, and expanded repulsion sources (structures, mining depots, shells, warp gates).
- **2025-03-26:** Reduced particle size/opacity and blended influence colors with distance-based fades.

## Watch Out For
- Ensure any new repulsion sources maintain stable forces to avoid extreme particle velocities.
