# Online Multiplayer System

## Overview

The Speed of Light RTS game features a real-time online multiplayer system that allows players to compete against each other remotely. The system is built with a flexible backend abstraction that supports both Spark KV and Supabase.

## Features

### Lobby System
- **Create Game**: Host creates a lobby with custom settings (map, units, colors)
- **Join Game**: Guest joins using a Game ID
- **Matchmaking**: Automatic opponent finding and game creation
- **Lobby Display**: Shows host and guest information with colors

### Real-time Synchronization
- **Command Synchronization**: All player actions (unit spawning, movement, abilities, base commands) are synchronized
- **Network Status**: Live connection status and latency display
- **100ms Polling**: Commands are fetched and applied every 100ms for responsive gameplay
- **Local Prediction**: Player's own commands apply immediately for smooth feedback

### Supported Commands
1. **Spawn**: Unit spawning with rally points
2. **Move**: Unit movement and patrol commands
3. **Ability**: Unit abilities (directional drag input)
4. **Base Move**: Base repositioning
5. **Base Laser**: Base laser ability

## Backend Support

### Spark KV (Default - Local Development)
- Automatically used when running in Spark environment
- No configuration needed
- Best for local testing and development

### Supabase (Production)
To use Supabase backend, set environment variables:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_KV_TABLE=multiplayer_kv  # optional, defaults to 'multiplayer_kv'
```

#### Supabase Table Schema
Create a table named `multiplayer_kv` with the following structure:

```sql
CREATE TABLE multiplayer_kv (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for prefix searches
CREATE INDEX idx_multiplayer_kv_key_prefix ON multiplayer_kv (key text_pattern_ops);
```

## How It Works

### Game Flow
1. **Lobby Creation**
   - Host creates a game with settings
   - Lobby added to multiplayer:lobbies list
   - Host receives unique Game ID

2. **Opponent Joining**
   - Guest uses Game ID to join or matchmaking finds a lobby
   - Lobby status updates to 'ready'
   - Both players see opponent information

3. **Game Start**
   - Host clicks "Start Game" (or auto-starts in matchmaking)
   - Lobby status changes to 'playing'
   - Both players transition to countdown screen
   - Game begins after 3-second countdown

4. **Gameplay**
   - All player inputs send commands to backend
   - Game loop fetches opponent commands every 100ms
   - Commands applied to game state for opponent units
   - Network status displays connection and latency

5. **Game End**
   - Victory/defeat/surrender triggers endGame()
   - Lobby status set to 'finished'
   - Opponent notified of game end
   - Statistics saved (MMR tracked for online games)

### Command Synchronization

#### Sending Commands
Input handlers in `input.ts` send commands via the multiplayer manager:
- Unit spawning → `sendSpawnCommand()`
- Unit movement → `sendMoveCommand()`
- Unit abilities → `sendAbilityCommand()`
- Base movement → `sendBaseMoveCommand()`
- Base laser → `sendBaseLaserCommand()`

#### Receiving Commands
Game loop in `App.tsx` calls `updateMultiplayerSync()` which:
1. Fetches new commands since last check
2. Filters out own commands (already applied locally)
3. Applies opponent commands to game state
4. Updates network status with latency

#### Command Application
`applyOpponentCommands()` in `multiplayerGame.ts`:
- Validates commands before applying
- Applies effects to opponent's units/bases
- Handles all command types with proper game logic
- Uses same constants as local execution for consistency

## Technical Details

### Files
- `src/lib/multiplayer.ts` - Core multiplayer manager and lobby system
- `src/lib/realtimeStore.ts` - Backend abstraction (Spark/Supabase)
- `src/lib/multiplayerGame.ts` - Command sync and game integration
- `src/components/MultiplayerLobbyScreen.tsx` - Lobby UI
- `src/components/OnlineModeScreen.tsx` - Online mode selection

### Key Data Structures

#### LobbyData
```typescript
{
  gameId: string;
  hostId: string;
  hostName: string;
  hostColor: string;
  guestId: string | null;
  guestName: string | null;
  guestColor: string | null;
  status: 'waiting' | 'ready' | 'playing' | 'finished';
  created: number;
  mapId: string;
  enabledUnits: string[];
}
```

#### GameCommand
```typescript
{
  playerId: string;
  timestamp: number;
  commands: Array<{
    type: 'spawn' | 'move' | 'ability' | 'baseMove' | 'baseLaser';
    // ... command-specific fields
  }>;
}
```

### Performance Considerations
- Commands stored with timestamp keys for efficient querying
- Lobby list pruned of expired entries (5-minute timeout)
- 100ms polling balances responsiveness and backend load
- Local prediction eliminates input lag for own commands

## Troubleshooting

### "Multiplayer requires Spark runtime or Supabase credentials"
- Ensure you're either running in Spark or have set Supabase environment variables
- Check that `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set correctly

### "Failed to join game"
- Game may already be full (has both host and guest)
- Game may have already started or finished
- Check network connection

### "Disconnected" shown during game
- Backend may be unreachable
- Check network connection
- Verify Supabase credentials if using Supabase

### Commands not syncing
- Check browser console for errors
- Verify backend is reachable
- Ensure both players are in the same game ID

## Future Enhancements
- [ ] Reconnection handling for dropped connections
- [ ] Game state snapshots for late-joiners
- [ ] Spectator mode
- [ ] Replay system using command history
- [ ] MMR-based matchmaking
- [ ] Chat system
- [ ] Tournament brackets
- [ ] Custom game rules/modifiers
