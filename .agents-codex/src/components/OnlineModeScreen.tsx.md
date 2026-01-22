# OnlineModeScreen.tsx

## Purpose
Provides the online multiplayer entry menu, offering matchmaking, custom game, and LAN options alongside a chess mode toggle.

## Dependencies
### Imports
- `Button` from `src/components/ui/button`
- `Card`, `CardContent`, `CardHeader`, `CardTitle` from `src/components/ui/card`
- `Label` from `src/components/ui/label`
- `Switch` from `src/components/ui/switch`
- `ArrowLeft`, `MagnifyingGlass`, `Users`, `WifiHigh` from `@phosphor-icons/react`

### Used By
- `src/App.tsx` (renders the online mode screen in menu flow)

## Key Components

### OnlineModeScreen
- **Purpose:** Presents online play options and chess mode toggle.
- **Props:** `onBack`, `onMatchmaking`, `onCustomGame`, `onLAN`, `chessMode`, `onChessModeChange`
- **Notes:** Uses a scroll container to keep options visible on smaller devices.

## Terminology
- **Chess Mode:** Alternate ruleset with queued commands at fixed intervals.

## Implementation Notes

### Critical Details
- Buttons route to matchmaking, custom game, and LAN flows.
- Scroll container padding accounts for mobile safe areas.

### Known Issues
- None currently identified.

## Future Changes

### Planned
- None currently scheduled.

### Needed
- Consider surfacing matchmaking status indicators.

## Change History
- **2026-01-22:** Added safe-area scroll padding to keep menu content fully visible on mobile.

## Watch Out For
- Keep the chess mode copy in sync with gameplay rules.
