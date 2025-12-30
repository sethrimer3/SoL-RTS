import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ArrowLeft } from '@phosphor-icons/react';
import { UnitType, UNIT_DEFINITIONS, COLORS } from '../lib/types';

interface UnitSelectionScreenProps {
  unitSlots: Record<'left' | 'up' | 'down', UnitType>;
  onSlotChange: (slot: 'left' | 'up' | 'down', unitType: UnitType) => void;
  onBack: () => void;
  playerColor: string;
}

export function UnitSelectionScreen({ unitSlots, onSlotChange, onBack, playerColor }: UnitSelectionScreenProps) {
  const [selectedSlot, setSelectedSlot] = useState<'left' | 'up' | 'down' | null>(null);

  const handleSlotClick = (slot: 'left' | 'up' | 'down') => {
    setSelectedSlot(slot);
  };

  const handleUnitSelect = (unitType: UnitType) => {
    if (selectedSlot) {
      onSlotChange(selectedSlot, unitType);
      setSelectedSlot(null);
    }
  };

  const renderUnitIcon = (unitType: UnitType, size: number = 20) => {
    const color = playerColor || COLORS.playerDefault;
    
    if (unitType === 'marine') {
      return (
        <svg width={size} height={size} viewBox="0 0 20 20">
          <circle cx="10" cy="10" r="8" fill={color} opacity="0.8" />
        </svg>
      );
    } else if (unitType === 'warrior') {
      return (
        <svg width={size} height={size} viewBox="0 0 20 20">
          <circle cx="10" cy="10" r="8" fill={color} opacity="0.8" />
          <line x1="4" y1="4" x2="16" y2="16" stroke={color} strokeWidth="2" />
          <line x1="16" y1="4" x2="4" y2="16" stroke={color} strokeWidth="2" />
        </svg>
      );
    } else {
      return (
        <svg width={size} height={size} viewBox="0 0 40 20">
          {[0, 1, 2, 3, 4].map((i) => (
            <polygon
              key={i}
              points={`${i * 8},10 ${i * 8 + 4},5 ${i * 8 + 4},15`}
              fill={color}
              opacity="0.8"
            />
          ))}
        </svg>
      );
    }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center p-4 overflow-auto">
      <Card className="w-[500px] max-w-full">
        <CardHeader>
          <CardTitle className="orbitron text-2xl">Unit Selection</CardTitle>
          <p className="text-sm text-muted-foreground">Click a slot, then choose a unit</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="relative w-full aspect-square max-w-[300px] mx-auto">
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="w-24 h-24 border-4 relative transition-all"
                style={{
                  borderColor: playerColor || COLORS.playerDefault,
                  backgroundColor: `${playerColor || COLORS.playerDefault}20`,
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs orbitron opacity-50">BASE</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleSlotClick('up')}
              className={`absolute left-1/2 top-8 -translate-x-1/2 w-20 h-20 border-2 rounded-lg flex flex-col items-center justify-center gap-1 transition-all ${
                selectedSlot === 'up' ? 'ring-4 ring-primary scale-105' : 'hover:scale-105'
              }`}
              style={{
                borderColor: playerColor || COLORS.playerDefault,
                backgroundColor: selectedSlot === 'up' ? `${playerColor || COLORS.playerDefault}40` : `${playerColor || COLORS.playerDefault}20`,
              }}
            >
              {renderUnitIcon(unitSlots.up, 32)}
              <span className="text-xs capitalize">{unitSlots.up}</span>
              <span className="text-xs text-muted-foreground">{UNIT_DEFINITIONS[unitSlots.up].cost}◈</span>
            </button>

            <button
              onClick={() => handleSlotClick('left')}
              className={`absolute left-8 top-1/2 -translate-y-1/2 w-20 h-20 border-2 rounded-lg flex flex-col items-center justify-center gap-1 transition-all ${
                selectedSlot === 'left' ? 'ring-4 ring-primary scale-105' : 'hover:scale-105'
              }`}
              style={{
                borderColor: playerColor || COLORS.playerDefault,
                backgroundColor: selectedSlot === 'left' ? `${playerColor || COLORS.playerDefault}40` : `${playerColor || COLORS.playerDefault}20`,
              }}
            >
              {renderUnitIcon(unitSlots.left, 32)}
              <span className="text-xs capitalize">{unitSlots.left}</span>
              <span className="text-xs text-muted-foreground">{UNIT_DEFINITIONS[unitSlots.left].cost}◈</span>
            </button>

            <button
              onClick={() => handleSlotClick('down')}
              className={`absolute left-1/2 bottom-8 -translate-x-1/2 w-20 h-20 border-2 rounded-lg flex flex-col items-center justify-center gap-1 transition-all ${
                selectedSlot === 'down' ? 'ring-4 ring-primary scale-105' : 'hover:scale-105'
              }`}
              style={{
                borderColor: playerColor || COLORS.playerDefault,
                backgroundColor: selectedSlot === 'down' ? `${playerColor || COLORS.playerDefault}40` : `${playerColor || COLORS.playerDefault}20`,
              }}
            >
              {renderUnitIcon(unitSlots.down, 32)}
              <span className="text-xs capitalize">{unitSlots.down}</span>
              <span className="text-xs text-muted-foreground">{UNIT_DEFINITIONS[unitSlots.down].cost}◈</span>
            </button>
          </div>

          {selectedSlot && (
            <div className="space-y-2">
              <p className="text-sm text-center orbitron">Select unit for {selectedSlot} slot:</p>
              <div className="flex gap-2 justify-center">
                {(['marine', 'warrior', 'snaker'] as UnitType[]).map((unitType) => (
                  <button
                    key={unitType}
                    onClick={() => handleUnitSelect(unitType)}
                    className="w-24 h-24 border-2 rounded-lg flex flex-col items-center justify-center gap-1 hover:scale-105 transition-all"
                    style={{
                      borderColor: playerColor || COLORS.playerDefault,
                      backgroundColor: `${playerColor || COLORS.playerDefault}20`,
                    }}
                  >
                    {renderUnitIcon(unitType, 32)}
                    <span className="text-xs capitalize">{unitType}</span>
                    <span className="text-xs text-muted-foreground">{UNIT_DEFINITIONS[unitType].cost}◈</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <Button
            onClick={onBack}
            className="w-full orbitron"
            variant="outline"
          >
            <ArrowLeft className="mr-2" size={20} />
            Back to Menu
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
