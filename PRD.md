# Planning Guide

A mobile-first real-time strategy game featuring neon aesthetics, gesture-based controls, and tactical unit commands with telegraphed movement systems.

**Experience Qualities**: 
1. **Tactical** - Every movement and ability order is telegraphed to the opponent, creating a chess-like anticipation of moves where planning routes and timing abilities becomes crucial to outmaneuvering the enemy.
2. **Kinetic** - Fast-paced swipe-based spawning and drag-based ability casting creates an immediate, physical connection to commanding units across the glowing battlefield.
3. **Elegant** - Clean neon visuals against dark geometric backgrounds with minimal UI chrome keeps focus on the tactical situation while maintaining visual clarity through glowing indicators and paths.

**Complexity Level**: Complex Application (advanced functionality, likely with multiple views)
This is a full real-time strategy game with multiple systems: menu navigation, game state management, unit AI, command queuing, gesture recognition, collision detection, render pipeline, economy system, and multiplayer input handling. The scope includes 3 unit types, base mechanics with laser abilities, and a complete match loop.

## Essential Features

### Main Menu Navigation
- **Functionality**: Central hub presenting game mode options, unit selection, and settings
- **Purpose**: Provides clear entry points to all game features
- **Trigger**: App launch
- **Progression**: Splash → Main Menu → Mode Selection → Game Start
- **Success criteria**: All buttons navigate correctly, disabled states show "Coming Soon" for unimplemented features

### Real-Time Match Gameplay
- **Functionality**: Full RTS match with bases, unit spawning, movement, combat, and abilities
- **Purpose**: Core gameplay loop where players compete to destroy enemy base
- **Trigger**: Selecting Vs. AI or Vs. Player from menu
- **Progression**: Match Start → Economy Generation → Unit Production → Tactical Movement → Combat → Base Destruction → Victory Screen → Return to Menu
- **Success criteria**: Stable 60fps on mobile, all gesture inputs recognized, units execute commands correctly, win condition triggers properly

### Gesture-Based Unit Commands
- **Functionality**: Touch gestures for selecting units, issuing movement orders, and casting abilities
- **Purpose**: Enables full tactical control without cluttering mobile screen with buttons
- **Trigger**: Touch events on canvas during gameplay
- **Progression**: Touch Down → Gesture Recognition (tap/hold/drag/swipe) → Command Creation → Visual Telegraph → Command Execution
- **Success criteria**: Gestures feel responsive (<100ms feedback), selection rectangle works smoothly, drag distances map correctly to abilities

### Base Swipe Spawning System
- **Functionality**: Directional swipes on base spawn units with rally orders
- **Purpose**: Fast unit production with immediate tactical positioning
- **Trigger**: Swipe gesture starting on unselected base
- **Progression**: Swipe Start on Base → Direction Detection (left/up/down) → Cost Check → Unit Spawn → Rally Order Created → Unit Moves to Rally Point
- **Success criteria**: Swipe directions detected accurately, cost indicators glow when affordable, units spawn at base and move to rally points

### Command Queue Visualization
- **Functionality**: Display all queued orders for both players' units as glowing paths and arrows
- **Purpose**: Creates strategic depth through telegraphed moves, allowing counterplay
- **Trigger**: Any command issued to units or bases
- **Progression**: Command Created → Queue Node Added → Visual Element Drawn (dot/line/arrow) → Unit Executes → Visual Removed
- **Success criteria**: All movement and ability orders visible to both players, lines connect smoothly, indicators update in real-time as nodes complete

### Distance-Based Promotion System
- **Functionality**: Unit damage multipliers increase based on distance traveled, accelerated by queue depth
- **Purpose**: Rewards long tactical maneuvers and planning ahead
- **Trigger**: Unit movement
- **Progression**: Unit Moves → Distance Tracked with Queue Bonus → 10m Threshold Reached → Multiplier Increases by 1.1x → Display Updates
- **Success criteria**: Multiplier displays beneath units, calculations accurate with queue bonus, applies to attacks and abilities correctly

### Base Laser Ability
- **Functionality**: High-damage directional laser requiring precise input sequence
- **Purpose**: Powerful defensive/offensive tool with skill-based execution
- **Trigger**: Base selected → movement target set → swipe from target dot
- **Progression**: Base Selected → Tap for Movement → Swipe from Dot → Cooldown Check → Laser Fires → Damage Applied in Line → 10s Cooldown
- **Success criteria**: Input sequence recognized reliably, laser visual shows clear beam, damage calculation correct (200 to units, 300 to bases), cooldown indicator visible

### Settings & Unit Selection
- **Functionality**: Configure player colors and enable/disable unit types
- **Purpose**: Personalization and strategic preparation
- **Trigger**: Button press from main menu
- **Progression**: Menu → Settings/Unit Selection Screen → Color Picker / Unit Toggle → Save → Return to Menu
- **Success criteria**: Color changes reflect in-game immediately, unit toggles prevent training disabled units

## Edge Case Handling

- **Out of Bounds Movement** - Commands beyond arena boundaries get clamped to valid positions
- **Queue Overflow** - Attempting to add 21st command node does nothing, shows brief indicator
- **Simultaneous Selection** - In 2-player mode, each side only responds to touches on their half of screen
- **Touch Ambiguity** - Minimum drag distance (10px) required to differentiate tap from drag
- **Unit Death During Order** - Command queue cleared when unit destroyed
- **Ability Cast Out of Range** - Drag gestures clamped to 10m maximum distance
- **Zero Affordable Units** - Base sides remain dark if no photons available
- **Cooldown Spam** - Multiple swipes during cooldown are ignored silently
- **Empty Selection Commands** - Movement/ability gestures with no units selected do nothing
- **Base Collision** - Bases push away from each other if paths cross

## Design Direction

The design should evoke the feeling of commanding a fleet in deep space through holographic tactical displays - think TRON meets Geometry Wars. Every element glows with neon energy against the void. The interface fades into the background, letting the glowing units, paths, and combat effects dominate. Movements should feel deliberate and weighty despite the fast pace, with smooth trails and pulsing indicators creating a hypnotic rhythm. The aesthetic is retro-futuristic, celebrating 80s vector graphics while maintaining modern clarity and readability on small screens.

## Color Selection

The color scheme uses vibrant neon hues on dark backgrounds with strong contrast for mobile readability.

- **Primary Color**: Electric Blue (oklch(0.65 0.25 240)) - Represents player forces, communicates clarity and tactical precision
- **Secondary Colors**: 
  - Deep Void Black (oklch(0.15 0 0)) - Main background, creates infinite space feeling
  - Charcoal Gray (oklch(0.25 0 0)) - Geometric pattern overlay
- **Accent Color**: Danger Red (oklch(0.62 0.28 25)) - Enemy forces and destructive actions, high visibility against dark BG
- **Supporting Colors**:
  - Photon Yellow (oklch(0.85 0.20 95)) - Economy/currency indicators
  - Laser Magenta (oklch(0.70 0.30 320)) - Base laser ability
  - Telegraph Cyan (oklch(0.75 0.18 200)) - Command queue paths for readability
- **Foreground/Background Pairings**: 
  - Background (Deep Black oklch(0.15 0 0)): White text (oklch(0.98 0 0)) - Ratio 13.2:1 ✓
  - Primary (Electric Blue oklch(0.65 0.25 240)): White text (oklch(0.98 0 0)) - Ratio 4.9:1 ✓
  - Accent (Danger Red oklch(0.62 0.28 25)): White text (oklch(0.98 0 0)) - Ratio 5.1:1 ✓
  - Muted UI (Charcoal oklch(0.25 0 0)): Light Gray text (oklch(0.85 0 0)) - Ratio 7.8:1 ✓

## Font Selection

Typography should feel technological and precise, with excellent readability at small mobile sizes while maintaining the retro-futuristic aesthetic.

- **Primary Typeface**: Orbitron (Bold for titles, Medium for UI, Regular for body text) - Geometric letterforms echo the game's neon vector aesthetic
- **Fallback**: Space Grotesk - Modern technical feel if Orbitron unavailable

- **Typographic Hierarchy**: 
  - H1 (Screen Titles): Orbitron Bold / 32px / 1.1 line-height / 0.05em letter-spacing / uppercase
  - H2 (Section Headers): Orbitron Medium / 24px / 1.2 line-height / 0.03em letter-spacing
  - Button Text: Orbitron Medium / 18px / 1.3 line-height / 0.02em letter-spacing / uppercase
  - Body Text (Settings): Space Grotesk Regular / 16px / 1.5 line-height / normal letter-spacing
  - Debug HUD: Space Mono / 12px / 1.4 line-height / monospace for data alignment

## Animations

Animations serve tactical clarity first, visual flair second - every motion communicates game state or provides input feedback.

- **Unit Movement**: Smooth interpolation with subtle afterglow trails (200ms fade)
- **Ability Casting**: 0.5s telegraph pulses (brightness oscillation) before execution
- **Damage Numbers**: Pop up and fade over 0.8s with slight upward drift
- **Laser Beam**: Instant appearance, 0.3s bright flash, 0.2s fade-out
- **Selection**: Immediate highlight glow, pulsing at 1.5s intervals
- **Command Queue Dots**: Gentle pulse at 2s intervals to maintain visibility
- **Base Spawn Glow**: Door lights fade in over 0.4s when affordable
- **Victory/Defeat**: 2s screen flash with expanding rings from destroyed base
- **Button Hover**: 150ms glow intensity increase on touch-down

## Component Selection

This is a Canvas-based game, so traditional shadcn components are primarily used for the menu system and UI overlays.

- **Components**: 
  - Main Menu: Custom canvas-based UI with neon button rectangles
  - Settings Screen: shadcn `Card`, `Label`, `Select` (color picker), `Switch` (unit toggles)
  - Victory Overlay: Custom canvas modal with shadcn-styled `Button` for "Return to Menu"
  - Debug HUD: Canvas text rendering, no React components
- **Customizations**: 
  - Custom canvas gesture handlers for all gameplay input
  - Neon glow effects via canvas shadowBlur and multiple stroke layers
  - Custom color picker using canvas radial gradient
- **States**: 
  - Units: default (subtle glow), selected (bright pulsing glow), executing ability (color flash)
  - Base: idle (dim), spawnable sides (bright glow), selected (border pulse), laser cooldown (progress arc)
  - Buttons: rest (medium glow), touch-down (bright), disabled (very dim + "Coming Soon" text)
- **Icon Selection**: 
  - @phosphor-icons/react for menu navigation: `GameController`, `Robot`, `ListChecks`, `GearSix`, `ArrowLeft`
  - Canvas-drawn icons for in-game elements (unit shapes, ability arrows)
- **Spacing**: 
  - Menu buttons: 16px vertical gap, 24px horizontal padding, 48px from edges
  - Debug HUD: 12px from top-left corner, 16px line height
  - Selection indicators: 4px offset from unit edges
  - Command queue dots: 8px diameter, lines 2px width, arrows 12px length
- **Mobile**: 
  - Canvas fills entire viewport (100vw/100vh minus minimal chrome)
  - Touch targets minimum 44px for menu buttons
  - Dynamic canvas scaling to match device pixel ratio for sharp rendering
  - Split-screen in 2-player mode with vertical divider at 50%
  - Settings use vertical scrolling card layout optimized for portrait orientation
