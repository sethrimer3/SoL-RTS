/**
 * Enhanced visual effects system for aesthetic improvements
 */

import { GameState, Vector2, Unit } from './types';
import { generateId } from './gameUtils';

// Spawn effect constants
const SPAWN_EFFECT_DURATION = 0.8; // seconds
const SPAWN_EFFECT_PARTICLE_COUNT = 20;
const SPAWN_EFFECT_RADIUS = 2; // meters

// Energy pulse constants
const ENERGY_PULSE_DURATION = 0.6; // seconds
const ENERGY_PULSE_MAX_RADIUS = 3; // meters

/**
 * Create a spawn effect when a unit is created
 */
export function createSpawnEffect(state: GameState, position: Vector2, color: string): void {
  if (!state.spawnEffects) {
    state.spawnEffects = [];
  }

  const spawnEffect = {
    id: generateId(),
    position: { ...position },
    color,
    startTime: Date.now(),
    duration: SPAWN_EFFECT_DURATION,
  };

  state.spawnEffects.push(spawnEffect);

  // Create energy pulse for spawn
  createEnergyPulse(state, position, color, ENERGY_PULSE_DURATION, ENERGY_PULSE_MAX_RADIUS);

  // Create particle burst
  createParticleBurst(state, position, color, SPAWN_EFFECT_PARTICLE_COUNT);
}

/**
 * Create an energy pulse effect
 */
export function createEnergyPulse(
  state: GameState, 
  position: Vector2, 
  color: string, 
  duration: number = ENERGY_PULSE_DURATION,
  maxRadius: number = ENERGY_PULSE_MAX_RADIUS
): void {
  if (!state.energyPulses) {
    state.energyPulses = [];
  }

  const pulse = {
    id: generateId(),
    position: { ...position },
    radius: 0,
    color,
    startTime: Date.now(),
    duration,
    maxRadius,
  };

  state.energyPulses.push(pulse);
}

/**
 * Create a burst of particles from a position
 */
export function createParticleBurst(
  state: GameState, 
  position: Vector2, 
  color: string, 
  count: number,
  speed: number = 5
): void {
  if (!state.explosionParticles) {
    state.explosionParticles = [];
  }

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const velocity = {
      x: Math.cos(angle) * speed,
      y: Math.sin(angle) * speed,
    };

    const particle = {
      id: generateId(),
      position: { ...position },
      velocity,
      color,
      size: 0.1 + Math.random() * 0.15,
      lifetime: 0.5 + Math.random() * 0.5,
      createdAt: Date.now(),
      alpha: 1.0,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 10,
    };

    state.explosionParticles.push(particle);
  }
}

/**
 * Create hit spark effects when damage is dealt
 */
export function createHitSparks(
  state: GameState, 
  position: Vector2, 
  color: string, 
  count: number = 8
): void {
  if (!state.hitSparks) {
    state.hitSparks = [];
  }

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.3;
    const speed = 3 + Math.random() * 2;
    const velocity = {
      x: Math.cos(angle) * speed,
      y: Math.sin(angle) * speed,
    };

    const spark = {
      id: generateId(),
      position: { ...position },
      velocity,
      color,
      size: 0.05 + Math.random() * 0.1,
      lifetime: 0.2 + Math.random() * 0.2,
      createdAt: Date.now(),
    };

    state.hitSparks.push(spark);
  }
}

/**
 * Update all visual effects
 */
export function updateVisualEffects(state: GameState, deltaTime: number): void {
  const now = Date.now();

  // Update energy pulses
  if (state.energyPulses) {
    state.energyPulses = state.energyPulses.filter((pulse) => {
      const elapsed = (now - pulse.startTime) / 1000;
      if (elapsed >= pulse.duration) {
        return false;
      }
      
      // Update pulse radius
      const progress = elapsed / pulse.duration;
      pulse.radius = pulse.maxRadius * progress;
      
      return true;
    });
  }

  // Update spawn effects
  if (state.spawnEffects) {
    state.spawnEffects = state.spawnEffects.filter((effect) => {
      const elapsed = (now - effect.startTime) / 1000;
      return elapsed < effect.duration;
    });
  }

  // Update explosion particles
  if (state.explosionParticles) {
    state.explosionParticles = state.explosionParticles.filter((particle) => {
      const elapsed = (now - particle.createdAt) / 1000;
      if (elapsed >= particle.lifetime) {
        return false;
      }

      // Update position
      particle.position.x += particle.velocity.x * deltaTime;
      particle.position.y += particle.velocity.y * deltaTime;

      // Apply gravity
      particle.velocity.y += 2 * deltaTime;

      // Apply damping
      particle.velocity.x *= 0.98;
      particle.velocity.y *= 0.98;

      // Update rotation
      if (particle.rotation !== undefined && particle.rotationSpeed !== undefined) {
        particle.rotation += particle.rotationSpeed * deltaTime;
      }

      // Fade out
      particle.alpha = 1.0 - (elapsed / particle.lifetime);

      return true;
    });
  }

  // Update hit sparks
  if (state.hitSparks) {
    state.hitSparks = state.hitSparks.filter((spark) => {
      const elapsed = (now - spark.createdAt) / 1000;
      if (elapsed >= spark.lifetime) {
        return false;
      }

      // Update position
      spark.position.x += spark.velocity.x * deltaTime;
      spark.position.y += spark.velocity.y * deltaTime;

      // Apply damping
      spark.velocity.x *= 0.95;
      spark.velocity.y *= 0.95;

      return true;
    });
  }

  // Update impact effects
  if (state.impactEffects) {
    state.impactEffects = state.impactEffects.filter((effect) => {
      const elapsed = (now - effect.startTime) / 1000;
      return elapsed < effect.duration;
    });
  }

  // Update damage numbers
  if (state.damageNumbers) {
    state.damageNumbers = state.damageNumbers.filter((dmg) => {
      const elapsed = (now - dmg.startTime) / 1000;
      if (elapsed >= dmg.duration) {
        return false;
      }

      // Float upward
      dmg.position.y -= 1 * deltaTime;

      return true;
    });
  }
}

/**
 * Create enhanced ability effect based on unit type
 */
export function createAbilityEffect(
  state: GameState,
  unit: Unit,
  position: Vector2,
  abilityType: string
): void {
  const color = unit.owner === 0 
    ? 'oklch(0.65 0.25 240)' 
    : 'oklch(0.62 0.28 25)';

  switch (abilityType) {
    case 'burst-fire':
      // Create rapid fire effect
      createEnergyPulse(state, unit.position, color, 0.3, 1.5);
      break;
    
    case 'execute-dash':
      // Create dash trail
      createEnergyPulse(state, unit.position, color, 0.4, 2);
      createParticleBurst(state, unit.position, color, 15, 7);
      break;
    
    case 'line-jump':
      // Create jump telegraph
      createEnergyPulse(state, unit.position, 'oklch(0.75 0.18 200)', 0.5, 1);
      break;
    
    case 'shield-dome':
      // Create shield activation pulse
      createEnergyPulse(state, unit.position, color, 0.5, 4);
      break;
    
    case 'cloak':
      // Create cloaking shimmer
      createParticleBurst(state, unit.position, color, 20, 3);
      break;
    
    case 'bombardment':
      // Create targeting reticle effect
      createEnergyPulse(state, position, 'oklch(0.70 0.30 25)', 0.8, 3);
      break;
    
    case 'heal-pulse':
      // Create healing wave
      createEnergyPulse(state, unit.position, 'oklch(0.70 0.20 140)', 0.6, 5);
      break;
    
    case 'missile-barrage':
      // Create launch effect
      createEnergyPulse(state, unit.position, color, 0.4, 2);
      createParticleBurst(state, unit.position, color, 12, 6);
      break;
  }
}
