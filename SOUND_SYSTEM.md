# Neon Command - Sound System

## Overview

The game includes a comprehensive sound system with placeholder sounds generated using the Web Audio API. These placeholder sounds can be easily replaced with .mp3 files.

## Current Sound Effects

The following sound effects are currently implemented as synthesized placeholders:

- **Unit Selection** - Played when units are selected
- **Unit Deselection** - Played when units are deselected
- **Unit Movement** - Played when movement commands are issued
- **Unit Training** - Played when a new unit is spawned
- **Unit Death** - Played when a unit is destroyed
- **Base Damage** - Played when a base takes damage
- **Base Destroyed** - Played when a base is destroyed
- **Laser Fire** - Played when the base laser is fired
- **Ability Use** - Played when a unit uses an ability
- **Attack** - Played during combat
- **Victory** - Played when the player wins
- **Defeat** - Played when the player loses
- **Button Click** - Played for UI interactions
- **Countdown** - Played during the pre-match countdown
- **Match Start** - Played when the match begins
- **Income Tick** - Played subtly when photons are gained

## Replacing Placeholder Sounds with MP3 Files

To replace any placeholder sound with an actual .mp3 file:

### 1. Add Your Audio Files

Place your .mp3 files in the `src/assets/audio/` directory. For example:
```
src/assets/audio/
  ├── unit-select.mp3
  ├── unit-train.mp3
  ├── laser-fire.mp3
  └── ...
```

### 2. Load the Audio Files

In your `App.tsx` or in the sound manager initialization, load the audio files:

```typescript
import { soundManager } from './lib/sound';
import unitSelectSound from '@/assets/audio/unit-select.mp3';
import unitTrainSound from '@/assets/audio/unit-train.mp3';
import laserFireSound from '@/assets/audio/laser-fire.mp3';

// In a useEffect or initialization function:
useEffect(() => {
  soundManager.loadAudioFile('unit-select', unitSelectSound);
  soundManager.loadAudioFile('unit-train', unitTrainSound);
  soundManager.loadAudioFile('laser-fire', laserFireSound);
  // ... load other sounds
}, []);
```

### 3. Update Sound Manager Calls

Replace the synthesized sound calls with audio file playback. In `src/lib/sound.ts`, update the methods:

```typescript
// Before (synthesized):
playUnitSelect() {
  this.playTone(800, 0.05, 'sine', 0.15);
}

// After (audio file):
playUnitSelect() {
  this.playAudioFile('unit-select');
}
```

Or, to keep both options, you can add a flag:

```typescript
playUnitSelect() {
  if (this.audioFiles.has('unit-select')) {
    this.playAudioFile('unit-select');
  } else {
    this.playTone(800, 0.05, 'sine', 0.15);
  }
}
```

## Sound Settings

Players can toggle sound effects on/off from the Settings screen. The setting is persisted between sessions using the `useKV` hook.

## Volume Control

To adjust the master volume programmatically:

```typescript
soundManager.setVolume(0.5); // 50% volume (range: 0.0 to 1.0)
```

## Adding New Sound Effects

To add a new sound effect:

1. Add a new method to `SoundManager` class in `src/lib/sound.ts`:

```typescript
playNewSound() {
  this.playTone(frequency, duration, type, volume);
  // or
  this.playAudioFile('new-sound');
}
```

2. Call it from the appropriate location in your game code:

```typescript
import { soundManager } from './lib/sound';

soundManager.playNewSound();
```

## Performance Notes

- Synthesized sounds are lightweight and generate no HTTP requests
- Audio files provide better quality but add to the initial load size
- The sound manager handles audio context initialization automatically
- Sounds are only played when the sound system is enabled
