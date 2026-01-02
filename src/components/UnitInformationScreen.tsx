/**
 * Unit Information Screen
 * Displays comprehensive information about all units organized by faction
 * Includes stats, modifiers, attack descriptions, and ability descriptions
 */
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ArrowLeft, Info } from '@phosphor-icons/react';
import { 
  UnitType, 
  UNIT_DEFINITIONS, 
  FactionType, 
  FACTION_DEFINITIONS,
  UnitModifier 
} from '../lib/types';

interface UnitInformationScreenProps {
  onBack: () => void;
}

// Helper function to get ability description with damage stats
function getAbilityDescription(unitType: UnitType): string {
  const abilityDescriptions: Record<UnitType, string> = {
    // Radiant faction
    marine: 'Fires 10 rapid shots in a cone, each dealing 2 damage to enemies in the target direction (max range: 8m).',
    warrior: 'Dashes to the nearest enemy within 2m and deals 90 damage (5x attack damage).',
    tank: 'Creates a protective shield dome with 4m radius for 5 seconds, reducing incoming damage by 70%.',
    scout: 'Becomes invisible for 6 seconds, avoiding enemy detection and attacks.',
    artillery: 'Launches a bombardment at target location after 1.5s delay, dealing area damage.',
    medic: 'Heals all friendly units within 5m radius for 50 HP and bases for 100 HP.',
    interceptor: 'Fires up to 6 missiles at nearby enemies in target direction, each dealing 15 damage (max range: 12m).',
    guardian: 'Protects nearby allies, increasing their survivability with a defensive aura.',
    marksman: 'Fires a precise long-range shot at the furthest enemy in direction, dealing 50 damage (max range: 18m).',
    engineer: 'Deploys a stationary turret at target location that lasts 10 seconds and attacks enemies.',
    skirmisher: 'Quickly retreats 8m in opposite direction and cloaks for 2 seconds.',
    paladin: 'Delivers a holy strike in a cone, dealing 40 damage to all enemies within 6m in target direction.',
    
    // Aurum faction
    snaker: 'Jumps in a line to target position, dealing 20 damage to all enemies along the path (max range: 10m).',
    berserker: 'Enters rage mode, temporarily increasing damage output.',
    assassin: 'Performs a shadow strike, dealing high burst damage to a single target.',
    juggernaut: 'Slams the ground, dealing area damage and stunning nearby enemies.',
    striker: 'Spins in a whirlwind, damaging all surrounding enemies.',
    gladiator: 'Executes a lethal strike on nearby low-health enemy, dealing 50% of target\'s current HP (max 100 damage, range: 3m).',
    ravager: 'Life steal attack - damages all enemies within 3m for 15 damage each and heals for 50% of total damage dealt.',
    warlord: 'Battle cry buffs all allies within 6m, increasing their damage by 50% for 5 seconds.',
    duelist: 'Counter-attack stance - creates a 2m shield for 2 seconds and deals 25 damage to nearby enemies.',
    reaper: 'Soul strike that damages and drains enemy life force.',
    oracle: 'Provides divine restoration, healing friendly units in an area.',
    harbinger: 'Strikes with ethereal energy, phasing through enemy defenses.',
    
    // Solari faction
    flare: 'Fires a concentrated solar beam dealing damage in a line.',
    nova: 'Releases a stellar burst, exploding with radiant energy.',
    eclipse: 'Casts a shadow veil, obscuring vision and reducing enemy accuracy.',
    corona: 'Emits a radiation wave that damages enemies in a radius.',
    supernova: 'Triggers a cosmic explosion with massive area damage.',
    zenith: 'Channels solar blessing to heal and empower allies.',
    pulsar: 'Performs a stellar dive attack from above.',
    celestial: 'Charges forward with astral energy, damaging enemies in path.',
    voidwalker: 'Teleports to target location within 12m range, leaving void energy at both positions.',
    chronomancer: 'Slows all enemies within 7m radius, reducing their move speed to 30% for 4 seconds.',
    nebula: 'Creates a cosmic barrier shield at location with 3m radius for 6 seconds.',
    quasar: 'Delayed area ability - after 2.5s, deals 60 damage to enemies and 80 to bases within 4m radius.',
  };
  
  return abilityDescriptions[unitType] || 'Generic laser ability dealing 10 damage in target direction.';
}

// Helper function to get attack description
function getAttackDescription(unitType: UnitType): string {
  const def = UNIT_DEFINITIONS[unitType];
  
  if (def.attackType === 'none') {
    return 'This unit does not have a normal attack.';
  }
  
  const attackTypeText = def.attackType === 'melee' ? 'Melee attack' : 'Ranged attack';
  const armorText = def.attackType === 'melee' 
    ? ' (ignores armor)' 
    : ' (reduced by target armor)';
  
  return `${attackTypeText}: Deals ${def.attackDamage} damage at ${def.attackRange}m range with ${def.attackRate} attacks per second${armorText}.`;
}

// Helper function to render modifier badges
function ModifierBadge({ modifier }: { modifier: UnitModifier }) {
  const colors: Record<UnitModifier, string> = {
    melee: 'bg-red-500/20 text-red-400 border-red-500/50',
    ranged: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
    flying: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50',
    small: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    healing: 'bg-green-500/20 text-green-400 border-green-500/50',
  };
  
  const icons: Record<UnitModifier, string> = {
    melee: '⚔️',
    ranged: '🏹',
    flying: '✈️',
    small: '🐜',
    healing: '⚕️',
  };
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium border rounded ${colors[modifier]}`}>
      {icons[modifier]} {modifier.charAt(0).toUpperCase() + modifier.slice(1)}
    </span>
  );
}

// Component for displaying a single unit's information
function UnitCard({ unitType, playerColor }: { unitType: UnitType; playerColor: string }) {
  const def = UNIT_DEFINITIONS[unitType];
  
  return (
    <div className="border border-border rounded-lg p-4 hover:bg-muted/20 transition-colors">
      <div className="flex items-start gap-4">
        {/* Unit Icon */}
        <div className="flex-shrink-0 w-16 h-16 rounded bg-muted/50 flex items-center justify-center border border-border">
          <div className="text-3xl">{getUnitIcon(unitType)}</div>
        </div>
        
        {/* Unit Information */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="text-lg font-bold text-foreground">{def.name}</h4>
            <span className="text-sm font-semibold text-primary px-2 py-1 bg-primary/10 rounded">
              {def.cost} ⚡
            </span>
          </div>
          
          {/* Modifiers */}
          <div className="flex flex-wrap gap-1 mb-3">
            {def.modifiers.map((modifier) => (
              <ModifierBadge key={modifier} modifier={modifier} />
            ))}
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3 text-xs">
            <div className="bg-background/50 px-2 py-1 rounded border border-border">
              <span className="text-muted-foreground">HP:</span>
              <span className="ml-1 font-semibold text-foreground">{def.hp}</span>
            </div>
            <div className="bg-background/50 px-2 py-1 rounded border border-border">
              <span className="text-muted-foreground">Armor:</span>
              <span className="ml-1 font-semibold text-foreground">{def.armor}</span>
            </div>
            <div className="bg-background/50 px-2 py-1 rounded border border-border">
              <span className="text-muted-foreground">Speed:</span>
              <span className="ml-1 font-semibold text-foreground">{def.moveSpeed}m/s</span>
            </div>
            <div className="bg-background/50 px-2 py-1 rounded border border-border">
              <span className="text-muted-foreground">Range:</span>
              <span className="ml-1 font-semibold text-foreground">{def.attackRange}m</span>
            </div>
            <div className="bg-background/50 px-2 py-1 rounded border border-border">
              <span className="text-muted-foreground">Damage:</span>
              <span className="ml-1 font-semibold text-foreground">{def.attackDamage}</span>
            </div>
            <div className="bg-background/50 px-2 py-1 rounded border border-border">
              <span className="text-muted-foreground">Attack Rate:</span>
              <span className="ml-1 font-semibold text-foreground">{def.attackRate}/s</span>
            </div>
          </div>
          
          {/* Attack Description */}
          <div className="mb-2">
            <p className="text-xs font-semibold text-foreground mb-1">Normal Attack:</p>
            <p className="text-xs text-muted-foreground">{getAttackDescription(unitType)}</p>
          </div>
          
          {/* Ability Description */}
          <div className="bg-primary/5 border border-primary/20 rounded p-2">
            <p className="text-xs font-semibold text-primary mb-1">
              {def.abilityName} (CD: {def.abilityCooldown}s):
            </p>
            <p className="text-xs text-muted-foreground">{getAbilityDescription(unitType)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to get unit icon emoji/symbol
function getUnitIcon(unitType: UnitType): string {
  const icons: Partial<Record<UnitType, string>> = {
    marine: '🎯',
    warrior: '⚔️',
    snaker: '🐍',
    tank: '🛡️',
    scout: '👁️',
    artillery: '💥',
    medic: '⚕️',
    interceptor: '✈️',
    berserker: '😤',
    assassin: '🗡️',
    juggernaut: '🏔️',
    striker: '🌪️',
    flare: '☀️',
    nova: '💫',
    eclipse: '🌑',
    corona: '👑',
    supernova: '🌟',
    guardian: '🛡️',
    reaper: '💀',
    oracle: '🔮',
    harbinger: '👻',
    zenith: '☄️',
    pulsar: '⭐',
    celestial: '🌌',
    marksman: '🎯',
    engineer: '🔧',
    skirmisher: '🏃',
    paladin: '⚜️',
    gladiator: '🏛️',
    ravager: '🐺',
    warlord: '👑',
    duelist: '🤺',
    voidwalker: '🌀',
    chronomancer: '⏰',
    nebula: '☁️',
    quasar: '💠',
  };
  
  return icons[unitType] || '⭐';
}

export function UnitInformationScreen({ onBack }: UnitInformationScreenProps) {
  const factions: FactionType[] = ['radiant', 'aurum', 'solari'];
  const playerColor = '#6495ED'; // Default color for display
  
  return (
    <div className="absolute inset-0 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <Card className="w-full max-w-7xl max-h-[90vh] overflow-hidden">
        <CardHeader className="border-b border-border">
          <div className="flex items-center gap-3">
            <Info size={32} className="text-primary" />
            <div>
              <CardTitle className="text-2xl">Unit Information</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Complete database of all units organized by faction
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="space-y-8">
            {factions.map((faction) => {
              const factionDef = FACTION_DEFINITIONS[faction];
              const units = factionDef.availableUnits;
              
              return (
                <div key={faction}>
                  {/* Faction Header */}
                  <div className="mb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-bold text-primary uppercase tracking-wider orbitron">
                        {factionDef.name}
                      </h2>
                      <span className="text-sm text-muted-foreground">
                        ({units.length} units)
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Base Speed: {factionDef.baseMoveSpeed}m/s</span>
                      <span>•</span>
                      <span>Shape: {factionDef.baseShape}</span>
                      <span>•</span>
                      <span>
                        Ability: {
                          factionDef.ability === 'laser' ? 'Giant Laser' :
                          factionDef.ability === 'shield' ? 'Shield Defense' :
                          'Energy Pulse'
                        }
                      </span>
                    </div>
                  </div>
                  
                  {/* Units Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {units.map((unitType) => (
                      <UnitCard
                        key={unitType}
                        unitType={unitType}
                        playerColor={playerColor}
                      />
                    ))}
                  </div>
                  
                  {/* Divider between factions */}
                  {faction !== 'solari' && (
                    <div className="mt-8 border-t border-border"></div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Information Box */}
          <div className="mt-8 p-4 bg-primary/10 border border-primary/30 rounded">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Note:</strong> All damage values shown are base values. 
              Actual damage may vary based on unit promotion multipliers, armor reduction, and special ability effects. 
              Melee attacks ignore armor completely, while ranged attacks are reduced by the formula: 
              <code className="px-1 py-0.5 bg-background rounded ml-1">reduction = armor / (armor + 100)</code>
            </p>
          </div>
        </CardContent>
        
        <div className="border-t border-border p-4">
          <Button
            onClick={onBack}
            className="w-full orbitron uppercase tracking-wider"
            variant="outline"
          >
            <ArrowLeft className="mr-2" size={20} />
            Back to Menu
          </Button>
        </div>
      </Card>
    </div>
  );
}
