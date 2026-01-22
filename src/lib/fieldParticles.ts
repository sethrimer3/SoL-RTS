import { FieldParticle, GameState, ARENA_WIDTH_METERS, WARP_GATE_MAX_SIZE_METERS, COLORS } from './types';
import { generateId, getArenaHeight, distance, normalize, subtract } from './gameUtils';

// Field particle constants
const FIELD_PARTICLE_BASE_COUNT = 1000; // Base number of particles
const FIELD_PARTICLE_SIZE = 0.15; // Size in meters
const FIELD_PARTICLE_MASS = 0.05; // Very low mass for easy repulsion
const FIELD_PARTICLE_OPACITY = 0.6; // Opacity for white particles

// Repulsion constants
const UNIT_REPULSION_RADIUS = 3.0; // Distance at which units repel particles (meters)
const UNIT_REPULSION_FORCE = 8.0; // Force strength for unit repulsion
const STRUCTURE_REPULSION_RADIUS = 4.0; // Distance at which structures repel particles (meters)
const STRUCTURE_REPULSION_FORCE = 7.0; // Force strength for structure repulsion
const MINING_DEPOT_REPULSION_RADIUS = 4.5; // Distance at which mining depots repel particles (meters)
const MINING_DEPOT_REPULSION_FORCE = 7.5; // Force strength for mining depot repulsion
const PROJECTILE_REPULSION_RADIUS = 2.0; // Distance for projectile repulsion
const PROJECTILE_REPULSION_FORCE = 5.0; // Force for projectile repulsion
const SHELL_REPULSION_RADIUS = 1.6; // Distance for shell casing repulsion
const SHELL_REPULSION_FORCE = 4.0; // Force for shell casing repulsion
const BASE_REPULSION_RADIUS = 4.0; // Distance for base repulsion
const BASE_REPULSION_FORCE = 6.0; // Force for base repulsion
const WARP_GATE_REPULSION_RADIUS = WARP_GATE_MAX_SIZE_METERS * 0.75; // Distance for warp gate repulsion
const WARP_GATE_REPULSION_FORCE = 9.0; // Force for warp gate repulsion

// Physics constants
const PARTICLE_DAMPING = 0.95; // Velocity damping to slow particles over time
const PARTICLE_MAX_SPEED = 8.0; // Maximum particle speed
const PARTICLE_MAX_SPEED_SQUARED = PARTICLE_MAX_SPEED * PARTICLE_MAX_SPEED; // Squared for optimization
const BOUNDARY_MARGIN = 2.0; // Margin from arena edges
const BOUNCE_DAMPING_FACTOR = 0.5; // Velocity reduction factor on boundary bounce
const MIN_REPULSION_DISTANCE = 0.01; // Minimum distance to avoid division by zero

/**
 * Initialize field particles evenly distributed across the arena.
 */
export function initializeFieldParticles(arenaWidth: number, arenaHeight: number): FieldParticle[] {
  const particles: FieldParticle[] = [];
  
  // Calculate boundaries that keep particles inside the playable area.
  const minX = BOUNDARY_MARGIN;
  const maxX = arenaWidth - BOUNDARY_MARGIN;
  const minY = BOUNDARY_MARGIN;
  const maxY = arenaHeight - BOUNDARY_MARGIN;
  
  // Generate particles with a uniform distribution across the arena.
  for (let i = 0; i < FIELD_PARTICLE_BASE_COUNT; i++) {
    // Pick a random position inside the bounds to avoid density bias.
    const x = minX + Math.random() * (maxX - minX);
    const y = minY + Math.random() * (maxY - minY);
    
    particles.push({
      id: generateId(),
      position: { x, y },
      velocity: { x: 0, y: 0 },
      mass: FIELD_PARTICLE_MASS,
      size: FIELD_PARTICLE_SIZE,
      opacity: FIELD_PARTICLE_OPACITY,
    });
  }
  
  return particles;
}

/**
 * Update field particle physics, applying repulsion forces from units, bases, and projectiles
 */
export function updateFieldParticles(state: GameState, deltaTime: number): void {
  if (!state.fieldParticles) return;
  
  const arenaWidth = ARENA_WIDTH_METERS;
  const arenaHeight = getArenaHeight();
  
  // Calculate boundaries that keep particles inside the playable area.
  const minX = BOUNDARY_MARGIN;
  const maxX = arenaWidth - BOUNDARY_MARGIN;
  const minY = BOUNDARY_MARGIN;
  const maxY = arenaHeight - BOUNDARY_MARGIN;
  
  for (const particle of state.fieldParticles) {
    // Reset force accumulator
    let forceX = 0;
    let forceY = 0;
    
    // Apply repulsion from units
    for (const unit of state.units) {
      const dist = distance(particle.position, unit.position);
      
      if (dist < UNIT_REPULSION_RADIUS && dist > MIN_REPULSION_DISTANCE) {
        const repulsionDir = normalize(subtract(particle.position, unit.position));
        const forceMagnitude = UNIT_REPULSION_FORCE * (1.0 - dist / UNIT_REPULSION_RADIUS);
        forceX += repulsionDir.x * forceMagnitude;
        forceY += repulsionDir.y * forceMagnitude;
      }
    }
    
    // Apply repulsion from structures (buildings).
    for (const structure of state.structures) {
      const dist = distance(particle.position, structure.position);
      
      if (dist < STRUCTURE_REPULSION_RADIUS && dist > MIN_REPULSION_DISTANCE) {
        const repulsionDir = normalize(subtract(particle.position, structure.position));
        const forceMagnitude = STRUCTURE_REPULSION_FORCE * (1.0 - dist / STRUCTURE_REPULSION_RADIUS);
        forceX += repulsionDir.x * forceMagnitude;
        forceY += repulsionDir.y * forceMagnitude;
      }
    }
    
    // Apply repulsion from mining depots (buildings).
    for (const miningDepot of state.miningDepots) {
      const dist = distance(particle.position, miningDepot.position);
      
      if (dist < MINING_DEPOT_REPULSION_RADIUS && dist > MIN_REPULSION_DISTANCE) {
        const repulsionDir = normalize(subtract(particle.position, miningDepot.position));
        const forceMagnitude = MINING_DEPOT_REPULSION_FORCE * (1.0 - dist / MINING_DEPOT_REPULSION_RADIUS);
        forceX += repulsionDir.x * forceMagnitude;
        forceY += repulsionDir.y * forceMagnitude;
      }
    }
    
    // Apply repulsion from bases
    for (const base of state.bases) {
      const dist = distance(particle.position, base.position);
      
      if (dist < BASE_REPULSION_RADIUS && dist > MIN_REPULSION_DISTANCE) {
        const repulsionDir = normalize(subtract(particle.position, base.position));
        const forceMagnitude = BASE_REPULSION_FORCE * (1.0 - dist / BASE_REPULSION_RADIUS);
        forceX += repulsionDir.x * forceMagnitude;
        forceY += repulsionDir.y * forceMagnitude;
      }
    }
    
    // Apply repulsion from attack projectiles.
    if (state.projectiles) {
      for (const projectile of state.projectiles) {
        const dist = distance(particle.position, projectile.position);
        
        if (dist < PROJECTILE_REPULSION_RADIUS && dist > MIN_REPULSION_DISTANCE) {
          const repulsionDir = normalize(subtract(particle.position, projectile.position));
          const forceMagnitude = PROJECTILE_REPULSION_FORCE * (1.0 - dist / PROJECTILE_REPULSION_RADIUS);
          forceX += repulsionDir.x * forceMagnitude;
          forceY += repulsionDir.y * forceMagnitude;
        }
      }
    }
    
    // Apply repulsion from shell casings left by attacks.
    if (state.shells) {
      for (const shell of state.shells) {
        const dist = distance(particle.position, shell.position);
        
        if (dist < SHELL_REPULSION_RADIUS && dist > MIN_REPULSION_DISTANCE) {
          const repulsionDir = normalize(subtract(particle.position, shell.position));
          const forceMagnitude = SHELL_REPULSION_FORCE * (1.0 - dist / SHELL_REPULSION_RADIUS);
          forceX += repulsionDir.x * forceMagnitude;
          forceY += repulsionDir.y * forceMagnitude;
        }
      }
    }
    
    // Apply repulsion from warp gates being summoned.
    if (state.warpGate) {
      const dist = distance(particle.position, state.warpGate.position);
      
      if (dist < WARP_GATE_REPULSION_RADIUS && dist > MIN_REPULSION_DISTANCE) {
        const repulsionDir = normalize(subtract(particle.position, state.warpGate.position));
        const forceMagnitude = WARP_GATE_REPULSION_FORCE * (1.0 - dist / WARP_GATE_REPULSION_RADIUS);
        forceX += repulsionDir.x * forceMagnitude;
        forceY += repulsionDir.y * forceMagnitude;
      }
    }
    
    // Apply force to velocity (F = ma, so a = F/m)
    particle.velocity.x += (forceX / particle.mass) * deltaTime;
    particle.velocity.y += (forceY / particle.mass) * deltaTime;
    
    // Apply damping
    particle.velocity.x *= PARTICLE_DAMPING;
    particle.velocity.y *= PARTICLE_DAMPING;
    
    // Clamp speed to maximum (use squared comparison to avoid sqrt when not needed)
    const speedSquared = particle.velocity.x * particle.velocity.x + particle.velocity.y * particle.velocity.y;
    if (speedSquared > PARTICLE_MAX_SPEED_SQUARED) {
      const speed = Math.sqrt(speedSquared);
      const scale = PARTICLE_MAX_SPEED / speed;
      particle.velocity.x *= scale;
      particle.velocity.y *= scale;
    }
    
    // Update position
    particle.position.x += particle.velocity.x * deltaTime;
    particle.position.y += particle.velocity.y * deltaTime;
    
    // Constrain to arena boundaries with soft bounce.
    if (particle.position.y < minY) {
      particle.position.y = minY;
      particle.velocity.y = Math.abs(particle.velocity.y) * BOUNCE_DAMPING_FACTOR;
    } else if (particle.position.y > maxY) {
      particle.position.y = maxY;
      particle.velocity.y = -Math.abs(particle.velocity.y) * BOUNCE_DAMPING_FACTOR;
    }
    
    // Constrain to arena width with soft bounce.
    if (particle.position.x < minX) {
      particle.position.x = minX;
      particle.velocity.x = Math.abs(particle.velocity.x) * BOUNCE_DAMPING_FACTOR;
    } else if (particle.position.x > maxX) {
      particle.position.x = maxX;
      particle.velocity.x = -Math.abs(particle.velocity.x) * BOUNCE_DAMPING_FACTOR;
    }
    
    // Update particle color based on influence zones
    particle.color = COLORS.grey; // Default to grey (neutral/no influence)
    
    // Check if particle is in any player's influence zone
    if (state.influenceZones) {
      for (const zone of state.influenceZones) {
        const dist = distance(particle.position, zone.position);
        if (dist <= zone.radius) {
          // Particle is in this influence zone - use player color
          particle.color = state.players[zone.owner].color;
          break; // Use first matching zone (player zones should take priority)
        }
      }
    }
  }
}
