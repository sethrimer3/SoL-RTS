# LANModeScreen.tsx

## Purpose
Presents LAN multiplayer flows for hosting, joining, or browsing peer-to-peer games on the local network.

## Dependencies
### Imports
- `useEffect`, `useState` from `react`
- `Button` from `src/components/ui/button`
- `Card`, `CardContent`, `CardHeader`, `CardTitle`, `CardDescription` from `src/components/ui/card`
- `Input` from `src/components/ui/input`
- `Label` from `src/components/ui/label`
- `ArrowLeft`, `Copy`, `Check`, `MagnifyingGlass`, `CircleNotch` from `@phosphor-icons/react`
- `toast` from `sonner`
- `LANKVStore`, `LANGameInfo` from `src/lib/lanStore`

### Used By
- `src/App.tsx` (renders the LAN screen when the player chooses LAN multiplayer)

## Key Components

### LANModeScreen
- **Purpose:** Drives the host, join, browse, and selection states for LAN play.
- **Props:** `onBack`, `onHost`, `onJoin`
- **Notes:** Provides scanning feedback and copy-to-clipboard utilities.

## Terminology
- **Peer ID:** The identifier shared to connect via WebRTC.

## Implementation Notes

### Critical Details
- Uses multiple UI modes to guide users through LAN setup.
- Scroll container padding accounts for mobile safe areas.

### Known Issues
- LAN discovery depends on WebRTC and may fail on restrictive networks.

## Future Changes

### Planned
- None currently scheduled.

### Needed
- Consider exposing troubleshooting tips for LAN discovery failures.

## Change History
- **2026-01-22:** Added safe-area scroll padding to keep menu content fully visible on mobile.

## Watch Out For
- Keep LAN scan state transitions in sync with UI loading indicators.
