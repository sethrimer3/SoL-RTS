# StatisticsScreen.tsx

## Purpose
Shows player performance statistics, including wins, losses, MMR, and match history.

## Dependencies
### Imports
- `Button` from `src/components/ui/button`
- `Card`, `CardContent`, `CardHeader`, `CardTitle` from `src/components/ui/card`
- `Badge` from `src/components/ui/badge`
- `ScrollArea` from `src/components/ui/scroll-area`
- `Separator` from `src/components/ui/separator`
- `ArrowLeft`, `Trophy`, `Sword`, `Target`, `Lightning`, `Clock`, `TrendUp`, `Equals` from `@phosphor-icons/react`
- `PlayerStatistics`, `formatDuration`, `formatDate`, `getWinRate`, `getAverageMatchDuration` from `src/lib/statistics`
- `getMapById` from `src/lib/maps`

### Used By
- `src/App.tsx` (renders the statistics screen in menu flow)

## Key Components

### StatisticsScreen
- **Purpose:** Renders overview cards, MMR panel, and match history list.
- **Props:** `statistics`, `onBack`
- **Notes:** Uses a scrollable history list to avoid tall layouts.

## Terminology
- **MMR:** Matchmaking rating representing player skill.

## Implementation Notes

### Critical Details
- Win rate and average duration are derived from the stored statistics object.
- Scroll container padding accounts for mobile safe areas.

### Known Issues
- None currently identified.

## Future Changes

### Planned
- None currently scheduled.

### Needed
- Consider adding filters for match history.

## Change History
- **2026-01-22:** Added safe-area scroll padding to keep menu content fully visible on mobile.

## Watch Out For
- Keep stat formatting helpers consistent with storage values.
