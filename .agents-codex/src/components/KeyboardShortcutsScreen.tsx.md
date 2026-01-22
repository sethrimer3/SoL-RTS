# KeyboardShortcutsScreen.tsx

## Purpose
Displays a reference list of keyboard shortcuts grouped by category for desktop players.

## Dependencies
### Imports
- `Button` from `src/components/ui/button`
- `Card`, `CardContent`, `CardHeader`, `CardTitle` from `src/components/ui/card`
- `ArrowLeft`, `Keyboard` from `@phosphor-icons/react`

### Used By
- `src/App.tsx` (renders the keyboard shortcuts screen when invoked)

## Key Components

### KeyboardShortcutsScreen
- **Purpose:** Renders grouped shortcut lists and navigation back to the menu.
- **Props:** `onBack`
- **Notes:** Organizes shortcut entries by category for readability.

## Terminology
- **Shortcut:** A key combination that triggers an in-game action.

## Implementation Notes

### Critical Details
- Shortcut list is static and must be updated manually when bindings change.
- Scroll container padding accounts for mobile safe areas.

### Known Issues
- None currently identified.

## Future Changes

### Planned
- None currently scheduled.

### Needed
- Consider sourcing shortcuts from a centralized configuration.

## Change History
- **2026-01-22:** Added safe-area scroll padding to keep menu content fully visible on mobile.

## Watch Out For
- Keep shortcut descriptions aligned with `useKeyboardControls` bindings.
