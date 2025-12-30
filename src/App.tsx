import { useEffect, useRef, useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { GameState, COLORS, UnitType, BASE_SIZE_METERS } from './lib/types';
import { generateId } from './lib/gameUtils';
import { updateGame } from './lib/simulation';
import { updateAI } from './lib/ai';
import { renderGame } from './lib/renderer';
import { handleTouchStart, handleTouchMove, handleTouchEnd } from './lib/input';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Label } from './components/ui/label';
import { Switch } from './components/ui/switch';
import { GameController, Robot, ListChecks, GearSix, ArrowLeft } from '@phosphor-icons/react';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef<GameState>(createInitialState());
  const [renderTrigger, setRenderTrigger] = useState(0);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number>(Date.now());

  const [playerColor, setPlayerColor] = useKV('player-color', COLORS.playerDefault);
  const [enemyColor, setEnemyColor] = useKV('enemy-color', COLORS.enemyDefault);
  const [enabledUnits, setEnabledUnits] = useKV<string[]>('enabled-units', ['marine', 'warrior', 'snaker']);

  const gameState = gameStateRef.current;

  useEffect(() => {
    gameStateRef.current.settings = {
      playerColor: playerColor || COLORS.playerDefault,
      enemyColor: enemyColor || COLORS.enemyDefault,
      enabledUnits: new Set((enabledUnits || ['marine', 'warrior', 'snaker']) as UnitType[]),
    };
    gameStateRef.current.players = gameStateRef.current.players.map((p, i) => ({
      ...p,
      color: i === 0 ? (playerColor || COLORS.playerDefault) : (enemyColor || COLORS.enemyDefault),
    }));
  }, [playerColor, enemyColor, enabledUnits]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const gameLoop = () => {
      const now = Date.now();
      const deltaTime = Math.min((now - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = now;

      if (gameStateRef.current.mode === 'game') {
        updateGame(gameStateRef.current, deltaTime);
        updateAI(gameStateRef.current, deltaTime);
      }

      renderGame(ctx, gameStateRef.current, canvas);

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleStart = (e: TouchEvent) => handleTouchStart(e, gameStateRef.current, canvas);
    const handleMove = (e: TouchEvent) => handleTouchMove(e, gameStateRef.current, canvas);
    const handleEnd = (e: TouchEvent) => handleTouchEnd(e, gameStateRef.current, canvas);

    canvas.addEventListener('touchstart', handleStart, { passive: false });
    canvas.addEventListener('touchmove', handleMove, { passive: false });
    canvas.addEventListener('touchend', handleEnd, { passive: false });

    return () => {
      canvas.removeEventListener('touchstart', handleStart);
      canvas.removeEventListener('touchmove', handleMove);
      canvas.removeEventListener('touchend', handleEnd);
    };
  }, []);

  const startGame = (mode: 'ai' | 'player') => {
    gameStateRef.current = createGameState(mode, gameStateRef.current.settings);
    setRenderTrigger(prev => prev + 1);
  };

  const returnToMenu = () => {
    gameStateRef.current = createInitialState();
    setRenderTrigger(prev => prev + 1);
  };

  const toggleUnit = (unitType: UnitType) => {
    setEnabledUnits((current) => {
      const currentArray = current || ['marine', 'warrior', 'snaker'];
      return currentArray.includes(unitType) 
        ? currentArray.filter(u => u !== unitType)
        : [...currentArray, unitType];
    });
  };

  const goToSettings = () => {
    gameStateRef.current.mode = 'settings';
    setRenderTrigger(prev => prev + 1);
  };

  const goToUnitSelection = () => {
    gameStateRef.current.mode = 'unitSelection';
    setRenderTrigger(prev => prev + 1);
  };

  const backToMenu = () => {
    gameStateRef.current.mode = 'menu';
    setRenderTrigger(prev => prev + 1);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-background">
      <canvas ref={canvasRef} className="absolute inset-0" />

      {gameState.mode === 'menu' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col gap-4 w-80 max-w-[90vw]">
            <h1 className="orbitron text-4xl font-bold text-center text-primary mb-4 tracking-wider uppercase">
              Neon Command
            </h1>
            
            <Button
              onClick={() => startGame('player')}
              disabled
              className="h-14 text-lg orbitron uppercase tracking-wider"
              variant="outline"
            >
              <GameController className="mr-2" size={24} />
              Vs. Player
              <span className="ml-2 text-xs">(Coming Soon)</span>
            </Button>

            <Button
              onClick={() => startGame('ai')}
              className="h-14 text-lg orbitron uppercase tracking-wider"
              variant="default"
            >
              <Robot className="mr-2" size={24} />
              Vs. AI
            </Button>

            <Button
              onClick={goToUnitSelection}
              className="h-14 text-lg orbitron uppercase tracking-wider"
              variant="outline"
            >
              <ListChecks className="mr-2" size={24} />
              Unit Selection
            </Button>

            <Button
              onClick={goToSettings}
              className="h-14 text-lg orbitron uppercase tracking-wider"
              variant="outline"
            >
              <GearSix className="mr-2" size={24} />
              Settings
            </Button>
          </div>
        </div>
      )}

      {gameState.mode === 'settings' && (
        <div className="absolute inset-0 flex items-center justify-center p-4 overflow-auto">
          <Card className="w-96 max-w-full">
            <CardHeader>
              <CardTitle className="orbitron text-2xl">Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Player Color</Label>
                <div className="flex gap-2">
                  {[
                    { name: 'Blue', value: 'oklch(0.65 0.25 240)' },
                    { name: 'Cyan', value: 'oklch(0.75 0.18 200)' },
                    { name: 'Green', value: 'oklch(0.70 0.20 140)' },
                    { name: 'Purple', value: 'oklch(0.65 0.25 280)' },
                  ].map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setPlayerColor(color.value)}
                      className="w-12 h-12 rounded border-2 transition-all"
                      style={{
                        backgroundColor: color.value,
                        borderColor: playerColor === color.value ? 'white' : 'transparent',
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Enemy Color</Label>
                <div className="flex gap-2">
                  {[
                    { name: 'Red', value: 'oklch(0.62 0.28 25)' },
                    { name: 'Orange', value: 'oklch(0.68 0.22 50)' },
                    { name: 'Pink', value: 'oklch(0.70 0.25 340)' },
                    { name: 'Yellow', value: 'oklch(0.85 0.20 95)' },
                  ].map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setEnemyColor(color.value)}
                      className="w-12 h-12 rounded border-2 transition-all"
                      style={{
                        backgroundColor: color.value,
                        borderColor: enemyColor === color.value ? 'white' : 'transparent',
                      }}
                    />
                  ))}
                </div>
              </div>

              <Button
                onClick={backToMenu}
                className="w-full orbitron"
                variant="outline"
              >
                <ArrowLeft className="mr-2" size={20} />
                Back to Menu
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {gameState.mode === 'unitSelection' && (
        <div className="absolute inset-0 flex items-center justify-center p-4 overflow-auto">
          <Card className="w-96 max-w-full">
            <CardHeader>
              <CardTitle className="orbitron text-2xl">Unit Selection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(['marine', 'warrior', 'snaker'] as UnitType[]).map((unitType) => (
                <div key={unitType} className="flex items-center justify-between">
                  <Label className="capitalize">{unitType}</Label>
                  <Switch
                    checked={(enabledUnits || ['marine', 'warrior', 'snaker']).includes(unitType)}
                    onCheckedChange={() => toggleUnit(unitType)}
                  />
                </div>
              ))}

              <Button
                onClick={backToMenu}
                className="w-full orbitron mt-6"
                variant="outline"
              >
                <ArrowLeft className="mr-2" size={20} />
                Back to Menu
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {gameState.mode === 'victory' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <Card className="w-96 max-w-full">
            <CardHeader>
              <CardTitle className="orbitron text-3xl text-center">
                {gameState.winner === 0 ? 'Victory!' : 'Defeat'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center mb-6">
                {gameState.winner === 0 ? 'You destroyed the enemy base!' : 'Your base was destroyed.'}
              </p>
              <Button onClick={returnToMenu} className="w-full orbitron" variant="default">
                Return to Menu
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function createInitialState(): GameState {
  return {
    mode: 'menu',
    vsMode: null,
    units: [],
    bases: [],
    players: [
      { photons: 0, incomeRate: 1, color: COLORS.playerDefault },
      { photons: 0, incomeRate: 1, color: COLORS.enemyDefault },
    ],
    selectedUnits: new Set(),
    elapsedTime: 0,
    lastIncomeTime: 0,
    winner: null,
    settings: {
      playerColor: COLORS.playerDefault,
      enemyColor: COLORS.enemyDefault,
      enabledUnits: new Set(['marine', 'warrior', 'snaker']),
    },
  };
}

function createGameState(mode: 'ai' | 'player', settings: GameState['settings']): GameState {
  const arenaWidth = window.innerWidth / 20;
  const arenaHeight = window.innerHeight / 20;

  return {
    mode: 'game',
    vsMode: mode,
    units: [],
    bases: [
      {
        id: generateId(),
        owner: 0,
        position: { x: BASE_SIZE_METERS * 2, y: arenaHeight / 2 },
        hp: 1000,
        maxHp: 1000,
        movementTarget: null,
        isSelected: false,
        laserCooldown: 0,
      },
      {
        id: generateId(),
        owner: 1,
        position: { x: arenaWidth - BASE_SIZE_METERS * 2, y: arenaHeight / 2 },
        hp: 1000,
        maxHp: 1000,
        movementTarget: null,
        isSelected: false,
        laserCooldown: 0,
      },
    ],
    players: [
      { photons: 0, incomeRate: 1, color: settings.playerColor },
      { photons: 0, incomeRate: 1, color: settings.enemyColor },
    ],
    selectedUnits: new Set(),
    elapsedTime: 0,
    lastIncomeTime: 0,
    winner: null,
    settings,
  };
}

export default App;