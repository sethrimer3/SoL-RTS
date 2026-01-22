# MapSelectionScreen.tsx

## Purpose
Displays the map selection menu where players browse available maps and choose the active battlefield.

## Dependencies
### Imports
- `getMapList` from `src/lib/maps`
- `Button` from `src/components/ui/button`
- `Card`, `CardContent`, `CardDescription`, `CardHeader`, `CardTitle` from `src/components/ui/card`
- `ScrollArea` from `src/components/ui/scroll-area`
- `ArrowLeft`, `MapPin` from `@phosphor-icons/react`

### Used By
- `src/App.tsx` (renders the map selection screen in menu flow)

## Key Components

### MapSelectionScreen
- **Purpose:** Lists maps in a scrollable grid with selection state and a back action.
- **Props:** `selectedMap`, `onMapSelect`, `onBack`
- **Notes:** Uses a scroll container to keep the full list accessible on smaller screens.

## Terminology
- **Map Card:** A clickable card representing a map definition and description.

## Implementation Notes

### Critical Details
- Selected map state is highlighted via card border styling.
- Scroll container padding accounts for mobile safe areas.

### Known Issues
- None currently identified.

## Future Changes

### Planned
- None currently scheduled.

### Needed
- Consider adding map thumbnails to accompany descriptions.

## Change History
- **2026-01-22:** Added safe-area scroll padding to keep menu content fully visible on mobile.

## Watch Out For
- Keep map descriptions aligned with `MapDefinition` data in `maps.ts`.
