import { FieldParticle, GameState, ARENA_WIDTH_METERS, WARP_GATE_MAX_SIZE_METERS, COLORS, ENVIRONMENT_COLOR_SCHEMES, EnvironmentColorScheme } from './types';
import { generateId, getArenaHeight, distance, normalize, subtract } from './gameUtils';

// Field particle constants
const FIELD_PARTICLE_BASE_COUNT = 3000; // Base number of particles (tripled for denser space dust)
const FIELD_PARTICLE_SIZE = 0.075; // Size in meters
const FIELD_PARTICLE_MASS = 0.05; // Very low mass for easy repulsion
const FIELD_PARTICLE_OPACITY = 0.4; // Opacity for white particles

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

// RGB color structure for influence blending.
type RgbColor = { r: number; g: number; b: number };

// Regex for parsing oklch colors like "oklch(0.65 0.25 240 / 0.8)".
const OKLCH_REGEX = /oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\)/;

/**
 * Clamp a value into the 0-1 range for safe color math.
 */
function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/**
 * Convert OKLCH color components into linear sRGB.
 */
function oklchToSrgb(lightness: number, chroma: number, hueDegrees: number): RgbColor {
  // Convert OKLCH to OKLab (using polar to Cartesian conversion for chroma).
  const hueRadians = (hueDegrees * Math.PI) / 180;
  const a = chroma * Math.cos(hueRadians);
  const b = chroma * Math.sin(hueRadians);

  // Convert OKLab to linear sRGB using the official conversion matrix.
  const l_ = lightness + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = lightness - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = lightness - 0.0894841775 * a - 1.291485548 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  const r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bOut = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

  return {
    r: clamp01(r),
    g: clamp01(g),
    b: clamp01(bOut),
  };
}

/**
 * Parse a color string into RGB for blending (supports OKLCH and hex).
 */
function parseColorToRgb(color: string): RgbColor {
  // Handle OKLCH colors used throughout the game palette.
  const oklchMatch = color.match(OKLCH_REGEX);
  if (oklchMatch) {
    return oklchToSrgb(parseFloat(oklchMatch[1]), parseFloat(oklchMatch[2]), parseFloat(oklchMatch[3]));
  }

  // Handle hex colors when needed (fallback for unexpected palettes).
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    const expandedHex = hex.length === 3 ? hex.split('').map((char) => char + char).join('') : hex;
    const hexValue = parseInt(expandedHex, 16);
    return {
      r: ((hexValue >> 16) & 255) / 255,
      g: ((hexValue >> 8) & 255) / 255,
      b: (hexValue & 255) / 255,
    };
  }

  // Default to neutral white if the color format is unexpected.
  return { r: 1, g: 1, b: 1 };
}

/**
 * Blend two RGB colors using a normalized influence value.
 */
function mixRgb(base: RgbColor, target: RgbColor, influence: number): RgbColor {
  const clampedInfluence = clamp01(influence);
  return {
    r: base.r + (target.r - base.r) * clampedInfluence,
    g: base.g + (target.g - base.g) * clampedInfluence,
    b: base.b + (target.b - base.b) * clampedInfluence,
  };
}

/**
 * Convert RGB color values into a CSS-compatible rgb() string.
 */
function rgbToCss(color: RgbColor): string {
  return `rgb(${Math.round(color.r * 255)} ${Math.round(color.g * 255)} ${Math.round(color.b * 255)})`;
}

/**
 * Initialize field particles evenly distributed across the arena.
 */
export function initializeFieldParticles(
  arenaWidth: number,
  arenaHeight: number,
  colorScheme: EnvironmentColorScheme = 'default'
): FieldParticle[] {
  const particles: FieldParticle[] = [];
  const dustPalette = ENVIRONMENT_COLOR_SCHEMES[colorScheme].dust.baseColors;
  
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
    const baseColor = dustPalette[Math.floor(Math.random() * dustPalette.length)] || COLORS.grey;
    
    particles.push({
      id: generateId(),
      position: { x, y },
      velocity: { x: 0, y: 0 },
      mass: FIELD_PARTICLE_MASS,
      size: FIELD_PARTICLE_SIZE,
      opacity: FIELD_PARTICLE_OPACITY,
      baseColor,
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
  const dustPalette = ENVIRONMENT_COLOR_SCHEMES[state.settings.colorScheme]?.dust ?? ENVIRONMENT_COLOR_SCHEMES.default.dust;
  const neutralDustColor = parseColorToRgb(dustPalette.neutralColor);
  const playerColorCache = new Map<number, RgbColor>();
  const baseDustColorCache = new Map<string, RgbColor>();
  
  // Calculate boundaries that keep particles inside the playable area.
  const minX = BOUNDARY_MARGIN;
  const maxX = arenaWidth - BOUNDARY_MARGIN;
  const minY = BOUNDARY_MARGIN;
  const maxY = arenaHeight - BOUNDARY_MARGIN;
  
  for (const particle of state.fieldParticles) {
    // Reset force accumulator
    let forceX = 0;
    let forceY = 0;
    const paletteOptions = dustPalette.baseColors;
    const hasValidBaseColor = particle.baseColor && paletteOptions.includes(particle.baseColor);

    // Ensure each particle has a base color that matches the current palette.
    if (!hasValidBaseColor) {
      particle.baseColor = paletteOptions[Math.floor(Math.random() * paletteOptions.length)] || COLORS.grey;
    }
    const particleBaseColor = particle.baseColor || COLORS.grey;
    
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
    
    // Update particle color based on influence zones.
    particle.color = particleBaseColor; // Default to its palette-matched dust color.
    
    // Check if particle is in any player's influence zone
    if (state.influenceZones) {
      let combinedWeight = 0;
      let blendedInfluenceColor: RgbColor = { r: 0, g: 0, b: 0 };
      const baseDustColor = baseDustColorCache.get(particleBaseColor) ?? parseColorToRgb(particleBaseColor);

      // Cache the parsed dust color to avoid repeated conversions.
      if (!baseDustColorCache.has(particleBaseColor)) {
        baseDustColorCache.set(particleBaseColor, baseDustColor);
      }

      for (const zone of state.influenceZones) {
        const dist = distance(particle.position, zone.position);
        if (dist <= zone.radius) {
          // Measure influence strength so color fades from grey at the edge to full color at the center.
          const influenceStrength = 1 - dist / zone.radius;
          const ownerIndex = zone.owner;
          const ownerColor = playerColorCache.get(ownerIndex) ?? parseColorToRgb(state.players[ownerIndex].color);

          // Cache the parsed player color to avoid repeated conversions.
          if (!playerColorCache.has(ownerIndex)) {
            playerColorCache.set(ownerIndex, ownerColor);
          }

          // Accumulate weighted color contributions for overlapping influence zones.
          blendedInfluenceColor = {
            r: blendedInfluenceColor.r + ownerColor.r * influenceStrength,
            g: blendedInfluenceColor.g + ownerColor.g * influenceStrength,
            b: blendedInfluenceColor.b + ownerColor.b * influenceStrength,
          };
          combinedWeight += influenceStrength;
        }
      }

      // Blend between neutral grey and the combined influence color, clamping overlap to full intensity.
      if (combinedWeight > 0) {
        const normalizedInfluenceColor: RgbColor = {
          r: blendedInfluenceColor.r / combinedWeight,
          g: blendedInfluenceColor.g / combinedWeight,
          b: blendedInfluenceColor.b / combinedWeight,
        };
        const influenceOpacity = clamp01(combinedWeight);
        const baseColorForBlend = mixRgb(baseDustColor, neutralDustColor, 0.35);
        const finalColor = mixRgb(baseColorForBlend, normalizedInfluenceColor, influenceOpacity);
        particle.color = rgbToCss(finalColor);
      }
    }
  }
}
