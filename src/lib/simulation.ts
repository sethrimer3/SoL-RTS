import {
  GameState,
  Unit,
  Base,
  UnitType,
  UNIT_DEFINITIONS,
  CommandNode,
  PROMOTION_DISTANCE_THRESHOLD,
  PROMOTION_MULTIPLIER,
  QUEUE_BONUS_PER_NODE,
  BASE_SIZE_METERS,
  UNIT_SIZE_METERS,
} from './types';
import { distance, normalize, scale, add, subtract, generateId } from './gameUtils';

export function updateGame(state: GameState, deltaTime: number): void {
  if (state.mode !== 'game') return;

  state.elapsedTime += deltaTime;

  updateIncome(state, deltaTime);
  updateUnits(state, deltaTime);
  updateBases(state, deltaTime);
  updateCombat(state, deltaTime);
  checkVictory(state);
}

function updateIncome(state: GameState, deltaTime: number): void {
  const elapsedSeconds = Math.floor(state.elapsedTime);
  const newIncomeRate = Math.floor(elapsedSeconds / 10) + 1;

  state.players.forEach((player) => {
    player.incomeRate = newIncomeRate;
  });

  state.lastIncomeTime += deltaTime;
  if (state.lastIncomeTime >= 1.0) {
    state.lastIncomeTime -= 1.0;
    state.players.forEach((player) => {
      player.photons += player.incomeRate;
    });
  }
}

function updateUnits(state: GameState, deltaTime: number): void {
  state.units.forEach((unit) => {
    if (unit.abilityCooldown > 0) {
      unit.abilityCooldown = Math.max(0, unit.abilityCooldown - deltaTime);
    }

    if (unit.lineJumpTelegraph) {
      const elapsed = Date.now() - unit.lineJumpTelegraph.startTime;
      if (elapsed >= 500) {
        executeLineJump(state, unit);
        unit.lineJumpTelegraph = undefined;
      }
      return;
    }

    if (unit.commandQueue.length === 0) return;

    const currentNode = unit.commandQueue[0];

    if (currentNode.type === 'move') {
      const dist = distance(unit.position, currentNode.position);
      const def = UNIT_DEFINITIONS[unit.type];

      if (dist < 0.1) {
        unit.commandQueue.shift();
        return;
      }

      const direction = normalize(subtract(currentNode.position, unit.position));
      const movement = scale(direction, def.moveSpeed * deltaTime);

      const moveDist = Math.min(distance(unit.position, add(unit.position, movement)), dist);
      unit.position = add(unit.position, scale(direction, moveDist));

      const queueMovementNodes = unit.commandQueue.filter((n) => n.type === 'move').length;
      const creditMultiplier = 1.0 + QUEUE_BONUS_PER_NODE * queueMovementNodes;
      unit.distanceCredit += moveDist * creditMultiplier;

      while (unit.distanceCredit >= PROMOTION_DISTANCE_THRESHOLD) {
        unit.distanceCredit -= PROMOTION_DISTANCE_THRESHOLD;
        unit.damageMultiplier *= PROMOTION_MULTIPLIER;
      }

      unit.distanceTraveled += moveDist;
    } else if (currentNode.type === 'ability') {
      const dist = distance(unit.position, currentNode.position);
      if (dist > 0.1) {
        const def = UNIT_DEFINITIONS[unit.type];
        const direction = normalize(subtract(currentNode.position, unit.position));
        const movement = scale(direction, def.moveSpeed * deltaTime);
        unit.position = add(unit.position, movement);

        const queueMovementNodes = unit.commandQueue.filter((n) => n.type === 'move').length;
        const creditMultiplier = 1.0 + QUEUE_BONUS_PER_NODE * queueMovementNodes;
        const moveDist = Math.min(distance({ x: 0, y: 0 }, movement), dist);
        unit.distanceCredit += moveDist * creditMultiplier;

        while (unit.distanceCredit >= PROMOTION_DISTANCE_THRESHOLD) {
          unit.distanceCredit -= PROMOTION_DISTANCE_THRESHOLD;
          unit.damageMultiplier *= PROMOTION_MULTIPLIER;
        }

        unit.distanceTraveled += moveDist;
      } else {
        executeAbility(state, unit, currentNode);
        unit.commandQueue.shift();
      }
    }
  });
}

function updateBases(state: GameState, deltaTime: number): void {
  state.bases.forEach((base) => {
    if (base.laserCooldown > 0) {
      base.laserCooldown = Math.max(0, base.laserCooldown - deltaTime);
    }

    if (!base.movementTarget) return;

    const dist = distance(base.position, base.movementTarget);
    if (dist < 0.1) {
      base.movementTarget = null;
      return;
    }

    const direction = normalize(subtract(base.movementTarget, base.position));
    const movement = scale(direction, 1.0 * deltaTime);
    base.position = add(base.position, movement);
  });
}

function executeAbility(state: GameState, unit: Unit, node: CommandNode): void {
  if (node.type !== 'ability') return;
  if (unit.abilityCooldown > 0) return;

  const def = UNIT_DEFINITIONS[unit.type];

  if (unit.type === 'marine') {
    executeBurstFire(state, unit, node.direction);
    unit.abilityCooldown = def.abilityCooldown;
  } else if (unit.type === 'warrior') {
    executeExecuteDash(state, unit, node.position);
    unit.abilityCooldown = def.abilityCooldown;
  } else if (unit.type === 'snaker') {
    unit.lineJumpTelegraph = {
      startTime: Date.now(),
      endPos: add(unit.position, scale(normalize(node.direction), Math.min(distance({ x: 0, y: 0 }, node.direction), 10))),
      direction: normalize(node.direction),
    };
    unit.abilityCooldown = def.abilityCooldown;
  }
}

function executeBurstFire(state: GameState, unit: Unit, direction: { x: number; y: number }): void {
  const def = UNIT_DEFINITIONS.marine;
  const shotDamage = 2 * unit.damageMultiplier;
  const maxRange = def.attackRange;

  const enemies = state.units.filter((u) => u.owner !== unit.owner);
  const enemyBases = state.bases.filter((b) => b.owner !== unit.owner);

  const dir = normalize(direction);

  for (let i = 0; i < 10; i++) {
    let hitTarget: Unit | Base | null = null;
    let minDist = Infinity;

    enemies.forEach((enemy) => {
      const toEnemy = subtract(enemy.position, unit.position);
      const dist = distance(unit.position, enemy.position);
      if (dist > maxRange) return;

      const projectedDist = toEnemy.x * dir.x + toEnemy.y * dir.y;
      const perpDist = Math.abs(toEnemy.x * dir.y - toEnemy.y * dir.x);

      if (projectedDist > 0 && perpDist < UNIT_SIZE_METERS / 2 && dist < minDist) {
        minDist = dist;
        hitTarget = enemy;
      }
    });

    if (hitTarget) {
      (hitTarget as Unit).hp -= shotDamage;
    }
  }
}

function executeExecuteDash(state: GameState, unit: Unit, targetPos: { x: number; y: number }): void {
  const enemies = state.units.filter((u) => u.owner !== unit.owner);
  const nearbyEnemies = enemies.filter((e) => distance(e.position, targetPos) <= 2);

  if (nearbyEnemies.length === 0) return;

  let nearest = nearbyEnemies[0];
  let minDist = distance(unit.position, nearest.position);

  nearbyEnemies.forEach((enemy) => {
    const dist = distance(unit.position, enemy.position);
    if (dist < minDist) {
      minDist = dist;
      nearest = enemy;
    }
  });

  unit.position = { ...nearest.position };
  const def = UNIT_DEFINITIONS.warrior;
  nearest.hp -= def.attackDamage * 5 * unit.damageMultiplier;
  unit.dashExecuting = true;
  setTimeout(() => {
    unit.dashExecuting = false;
  }, 200);
}

function executeLineJump(state: GameState, unit: Unit): void {
  if (!unit.lineJumpTelegraph) return;

  const { endPos, direction } = unit.lineJumpTelegraph;
  const startPos = { ...unit.position };

  const enemies = state.units.filter((u) => u.owner !== unit.owner);
  const hitEnemies = new Set<string>();

  const jumpDist = distance(startPos, endPos);
  const steps = Math.ceil(jumpDist * 10);

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const checkPos = {
      x: startPos.x + (endPos.x - startPos.x) * t,
      y: startPos.y + (endPos.y - startPos.y) * t,
    };

    enemies.forEach((enemy) => {
      if (hitEnemies.has(enemy.id)) return;
      if (distance(enemy.position, checkPos) < UNIT_SIZE_METERS) {
        enemy.hp -= 20 * unit.damageMultiplier;
        hitEnemies.add(enemy.id);
      }
    });
  }

  unit.position = endPos;
}

function updateCombat(state: GameState, deltaTime: number): void {
  state.units.forEach((unit) => {
    const def = UNIT_DEFINITIONS[unit.type];
    if (def.attackType === 'none') return;

    const enemies = state.units.filter((u) => u.owner !== unit.owner);
    const enemyBases = state.bases.filter((b) => b.owner !== unit.owner);

    let target: Unit | Base | null = null;
    let minDist = Infinity;

    enemies.forEach((enemy) => {
      const dist = distance(unit.position, enemy.position);
      if (dist <= def.attackRange && dist < minDist) {
        minDist = dist;
        target = enemy;
      }
    });

    if (!target && def.canDamageStructures) {
      enemyBases.forEach((base) => {
        const dist = distance(unit.position, base.position);
        const baseRadius = BASE_SIZE_METERS / 2;
        if (dist <= def.attackRange + baseRadius && dist < minDist) {
          minDist = dist;
          target = base;
        }
      });
    }

    if (target) {
      if ('type' in target) {
        (target as Unit).hp -= def.attackDamage * def.attackRate * deltaTime * unit.damageMultiplier;
      } else {
        (target as Base).hp -= def.attackDamage * def.attackRate * deltaTime * unit.damageMultiplier;
      }
    }
  });

  state.units = state.units.filter((u) => u.hp > 0);
}

function checkVictory(state: GameState): void {
  state.bases.forEach((base) => {
    if (base.hp <= 0) {
      state.winner = base.owner === 0 ? 1 : 0;
      state.mode = 'victory';
    }
  });
}

export function spawnUnit(state: GameState, owner: number, type: UnitType, spawnPos: { x: number; y: number }, rallyPos: { x: number; y: number }): void {
  const def = UNIT_DEFINITIONS[type];

  if (state.players[owner].photons < def.cost) return;
  if (!state.settings.enabledUnits.has(type)) return;

  state.players[owner].photons -= def.cost;

  const unit: Unit = {
    id: generateId(),
    type,
    owner,
    position: spawnPos,
    hp: def.hp,
    maxHp: def.hp,
    commandQueue: [{ type: 'move', position: rallyPos }],
    damageMultiplier: 1.0,
    distanceTraveled: 0,
    distanceCredit: 0,
    abilityCooldown: 0,
  };

  state.units.push(unit);
}
