# MultiplayerLobbyScreen.tsx

## Purpose
Handles the online multiplayer lobby flow, including creating or joining games and managing the in-lobby player list.

## Dependencies
### Imports
- `useEffect`, `useState` from `react`
- `Button` from `src/components/ui/button`
- `Card`, `CardContent`, `CardHeader`, `CardTitle` from `src/components/ui/card`
- `Input` from `src/components/ui/input`
- `Label` from `src/components/ui/label`
- `ScrollArea` from `src/components/ui/scroll-area`
- `ArrowLeft`, `Users`, `Plus`, `SignIn`, `Copy`, `Check` from `@phosphor-icons/react`
- `LobbyData` from `src/lib/multiplayer`
- `toast` from `sonner`

### Used By
- `src/App.tsx` (renders the online lobby screen during multiplayer setup)

## Key Components

### MultiplayerLobbyScreen
- **Purpose:** Manages lobby creation, joining, and in-lobby status display.
- **Props:** `onBack`, `onCreateGame`, `onJoinGame`, `lobbies`, `currentLobby`, `isHost`, `onStartGame`, `onLeaveGame`, `onRefreshLobbies`
- **Notes:** Refreshes available lobbies on a timer when not in a lobby.

## Terminology
- **Lobby:** A matchmaking room identified by a game ID.

## Implementation Notes

### Critical Details
- Uses a refresh interval to poll available lobbies when not joined.
- Scroll container padding accounts for mobile safe areas.

### Known Issues
- None currently identified.

## Future Changes

### Planned
- None currently scheduled.

### Needed
- Consider adding lobby filters or search.

## Change History
- **2026-01-22:** Added safe-area scroll padding to keep menu content fully visible on mobile.

## Watch Out For
- Ensure lobby refresh intervals are cleared on unmount.
