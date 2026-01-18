/**
 * Enhanced in-game HUD component showing key game information
 */
import { GameState } from '@/lib/types';
import { useEffect, useRef, useState } from 'react';

interface EnhancedHUDProps {
  gameState: GameState;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export function EnhancedHUD({ gameState, position = 'top-left' }: EnhancedHUDProps) {
  const playerBase = gameState.bases.find(b => b.owner === 0);
  const enemyBase = gameState.bases.find(b => b.owner === 1);
  const playerPhotons = gameState.players[0]?.photons || 0;
  const playerAntimatter = gameState.players[0]?.secondaryResource || 0;
  const selectedCount = gameState.selectedUnits.size;
  
  const [photonsPulse, setPhotonsPulse] = useState(false);
  const [antimatterPulse, setAntimatterPulse] = useState(false);
  const prevPhotonsRef = useRef(playerPhotons);
  const prevAntimatterRef = useRef(playerAntimatter);
  
  // Trigger pulse animation when resources increase
  useEffect(() => {
    if (playerPhotons > prevPhotonsRef.current) {
      setPhotonsPulse(true);
      setTimeout(() => setPhotonsPulse(false), 300);
    }
    prevPhotonsRef.current = playerPhotons;
  }, [playerPhotons]);
  
  useEffect(() => {
    if (playerAntimatter > prevAntimatterRef.current) {
      setAntimatterPulse(true);
      setTimeout(() => setAntimatterPulse(false), 300);
    }
    prevAntimatterRef.current = playerAntimatter;
  }, [playerAntimatter]);
  
  const matchDuration = Math.floor(gameState.elapsedTime);
  const minutes = Math.floor(matchDuration / 60);
  const seconds = matchDuration % 60;
  
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  return (
    <div className={`absolute ${positionClasses[position]} pointer-events-none`}>
      <div className="bg-background/80 backdrop-blur-sm border border-primary/30 rounded p-3 space-y-2 font-mono text-sm shadow-lg">
        {/* Time */}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Time:</span>
          <span className="text-primary font-bold">
            {minutes}:{seconds.toString().padStart(2, '0')}
          </span>
        </div>
        
        {/* Photons */}
        <div className="flex items-center gap-2">
          <img 
            src={`${import.meta.env.BASE_URL}ASSETS/icons/photon-icon.svg`} 
            alt="Photons" 
            className="w-4 h-4"
          />
          <span className={`text-yellow-400 font-bold transition-all duration-300 ${
            photonsPulse ? 'scale-125 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]' : 'scale-100'
          }`}>
            {Math.round(playerPhotons)}
          </span>
          <span className="text-muted-foreground text-xs">
            +{gameState.players[0]?.incomeRate || 1}/s
          </span>
        </div>
        
        {/* Latticite */}
        <div className="flex items-center gap-2">
          <img 
            src={`${import.meta.env.BASE_URL}ASSETS/icons/latticite-icon.svg`} 
            alt="Latticite" 
            className="w-4 h-4"
          />
          <span className={`text-purple-400 font-bold transition-all duration-300 ${
            antimatterPulse ? 'scale-125 drop-shadow-[0_0_8px_rgba(192,132,252,0.8)]' : 'scale-100'
          }`}>
            {Math.round(playerAntimatter)}
          </span>
        </div>
        
        {/* Selected Units */}
        {selectedCount > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Selected:</span>
            <span className="text-foreground font-bold">
              {selectedCount}
            </span>
          </div>
        )}
        
        {/* Base HP */}
        {playerBase && (
          <div className="pt-2 border-t border-border/50">
            <div className="flex items-center justify-between gap-2 text-xs mb-1">
              <span className="text-primary">Your Base</span>
              <span className={
                playerBase.hp / playerBase.maxHp > 0.6 ? 'text-green-400 drop-shadow-[0_0_4px_rgba(74,222,128,0.5)]' : 
                playerBase.hp / playerBase.maxHp > 0.3 ? 'text-yellow-400 drop-shadow-[0_0_4px_rgba(250,204,21,0.5)]' : 
                'text-red-400 drop-shadow-[0_0_4px_rgba(248,113,113,0.5)]'
              }>
                {Math.ceil(playerBase.hp)}/{playerBase.maxHp}
              </span>
            </div>
            <div className="h-1.5 bg-background/50 rounded overflow-hidden border border-primary/20">
              <div 
                className={`h-full transition-all duration-300 shadow-[0_0_8px_currentColor] ${
                  playerBase.hp / playerBase.maxHp > 0.6 ? 'bg-gradient-to-r from-green-500 to-green-400' : 
                  playerBase.hp / playerBase.maxHp > 0.3 ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' : 
                  'bg-gradient-to-r from-red-500 to-red-400'
                }`}
                style={{ width: `${(playerBase.hp / playerBase.maxHp) * 100}%` }}
              />
            </div>
          </div>
        )}
        
        {/* Enemy Base HP */}
        {enemyBase && (
          <div>
            <div className="flex items-center justify-between gap-2 text-xs mb-1">
              <span className="text-destructive">Enemy Base</span>
              <span className={
                enemyBase.hp / enemyBase.maxHp > 0.6 ? 'text-green-400 drop-shadow-[0_0_4px_rgba(74,222,128,0.5)]' : 
                enemyBase.hp / enemyBase.maxHp > 0.3 ? 'text-yellow-400 drop-shadow-[0_0_4px_rgba(250,204,21,0.5)]' : 
                'text-red-400 drop-shadow-[0_0_4px_rgba(248,113,113,0.5)]'
              }>
                {Math.ceil(enemyBase.hp)}/{enemyBase.maxHp}
              </span>
            </div>
            <div className="h-1.5 bg-background/50 rounded overflow-hidden border border-destructive/20">
              <div 
                className={`h-full transition-all duration-300 shadow-[0_0_8px_currentColor] ${
                  enemyBase.hp / enemyBase.maxHp > 0.6 ? 'bg-gradient-to-r from-green-500 to-green-400' : 
                  enemyBase.hp / enemyBase.maxHp > 0.3 ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' : 
                  'bg-gradient-to-r from-red-500 to-red-400'
                }`}
                style={{ width: `${(enemyBase.hp / enemyBase.maxHp) * 100}%` }}
              />
            </div>
          </div>
        )}
        
        {/* Unit Count */}
        <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Units:</span>
          <div className="flex gap-3">
            <span className="text-primary">
              {gameState.units.filter(u => u.owner === 0 && u.hp > 0).length}
            </span>
            <span className="text-muted-foreground">vs</span>
            <span className="text-destructive">
              {gameState.units.filter(u => u.owner === 1 && u.hp > 0).length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
