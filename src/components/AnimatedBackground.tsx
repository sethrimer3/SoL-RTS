/**
 * Animated background component for menu screens
 */
import { useEffect, useRef } from 'react';

interface AnimatedBackgroundProps {
  particleCount?: number;
  color?: string;
  galaxyCount?: number;
}

export function AnimatedBackground({ 
  particleCount = 50, 
  color = 'oklch(0.65 0.25 240)',
  galaxyCount = 3
}: AnimatedBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Galaxy formation structure
    interface Galaxy {
      x: number;
      y: number;
      vx: number;
      vy: number;
      mass: number;
      radius: number;
      rotationSpeed: number;
    }

    // Decorative asteroid drift data for the menu sun vignette.
    interface Asteroid {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      rotation: number;
      rotationSpeed: number;
      craterOffsets: Array<{ x: number; y: number; size: number }>;
    }

    // Particle system - enhanced with galaxy membership
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      pulseSpeed: number;
      pulseOffset: number;
      galaxyId: number | null; // null for free particles, index for galaxy particles
      orbitAngle?: number; // angle around galaxy center
      orbitDistance?: number; // distance from galaxy center
    }

    const MIN_VELOCITY = 0.08; // Minimum velocity to prevent jittering
    const SUN_LAYER_OPACITY = 0.2; // Render the sun vignette at 20% opacity.
    const ASTEROID_COUNT = 12; // Small group of asteroids for subtle motion.
    const galaxies: Galaxy[] = [];
    const particles: Particle[] = [];
    const asteroids: Asteroid[] = [];

    // Create a single asteroid with randomized spin, drift, and crater detail.
    const createAsteroid = (): Asteroid => {
      const baseX = Math.random() * canvas.width * 0.35;
      const baseY = Math.random() * canvas.height * 0.35;
      const driftAngle = Math.random() * Math.PI * 2;
      const driftSpeed = 0.05 + Math.random() * 0.12;
      const craterCount = 2 + Math.floor(Math.random() * 3);

      return {
        x: baseX,
        y: baseY,
        vx: Math.cos(driftAngle) * driftSpeed,
        vy: Math.sin(driftAngle) * driftSpeed,
        size: 3 + Math.random() * 4,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.9,
        craterOffsets: Array.from({ length: craterCount }, () => ({
          x: (Math.random() - 0.5) * 0.8,
          y: (Math.random() - 0.5) * 0.8,
          size: 0.15 + Math.random() * 0.25,
        })),
      };
    };

    // Initialize galaxies
    const initGalaxies = () => {
      galaxies.length = 0;
      // Also clear particles when reinitializing
      particles.length = 0;
      // Reset the asteroid layer whenever the canvas size changes.
      asteroids.length = 0;
      
      for (let i = 0; i < galaxyCount; i++) {
        // Position galaxies away from edges
        const margin = 100;
        galaxies.push({
          x: margin + Math.random() * (canvas.width - margin * 2),
          y: margin + Math.random() * (canvas.height - margin * 2),
          vx: (Math.random() - 0.5) * 0.05, // Very slow drift
          vy: (Math.random() - 0.5) * 0.05,
          mass: 1.0,
          radius: 80 + Math.random() * 60, // Galaxy size
          rotationSpeed: (Math.random() > 0.5 ? 1 : -1) * (0.15 + Math.random() * 0.15), // Rotation direction and speed
        });
      }
      
      // Create galaxy particles
      const particlesPerGalaxy = Math.floor(particleCount * 0.7 / galaxyCount); // 70% in galaxies
      const freeParticles = particleCount - (particlesPerGalaxy * galaxyCount); // 30% free

      for (let g = 0; g < galaxyCount; g++) {
        const galaxy = galaxies[g];
        for (let i = 0; i < particlesPerGalaxy; i++) {
          const angle = Math.random() * Math.PI * 2;
          const distance = Math.random() * galaxy.radius;
          const x = galaxy.x + Math.cos(angle) * distance;
          const y = galaxy.y + Math.sin(angle) * distance;
          
          particles.push({
            x,
            y,
            vx: 0,
            vy: 0,
            size: Math.random() * 2 + 0.5,
            opacity: Math.random() * 0.3 + 0.2,
            pulseSpeed: Math.random() * 2 + 1,
            pulseOffset: Math.random() * Math.PI * 2,
            galaxyId: g,
            orbitAngle: angle,
            orbitDistance: distance,
          });
        }
      }

      // Create free-floating particles with minimum velocity
      for (let i = 0; i < freeParticles; i++) {
        // Generate velocity with minimum magnitude
        const angle = Math.random() * Math.PI * 2;
        const speed = MIN_VELOCITY + Math.random() * 0.15; // Speed between MIN_VELOCITY and MIN_VELOCITY + 0.15
        
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 2 + 1,
          opacity: Math.random() * 0.3 + 0.2,
          pulseSpeed: Math.random() * 2 + 1,
          pulseOffset: Math.random() * Math.PI * 2,
          galaxyId: null,
        });
      }

      // Create drifting asteroids for the menu sun vignette.
      for (let i = 0; i < ASTEROID_COUNT; i++) {
        asteroids.push(createAsteroid());
      }
    };

    // Resize canvas to fill screen
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      // Reinitialize galaxies on resize
      initGalaxies();
    };
    resize();
    window.addEventListener('resize', resize);

    // Animation loop
    let animationId: number;
    let lastFrameTime = Date.now();
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const currentTime = Date.now();
      const deltaTime = Math.min((currentTime - lastFrameTime) / 1000, 0.1); // Cap at 0.1s to prevent huge jumps
      lastFrameTime = currentTime;
      const time = currentTime / 1000;
      const sunX = canvas.width * 0.12;
      const sunY = canvas.height * 0.18;
      const sunRadius = Math.min(canvas.width, canvas.height) * 0.12;

      // Draw the sun glow in the top-left corner with a warm lighting gradient.
      ctx.save();
      ctx.globalAlpha = SUN_LAYER_OPACITY;
      const sunGradient = ctx.createRadialGradient(
        sunX,
        sunY,
        sunRadius * 0.2,
        sunX,
        sunY,
        sunRadius * 2.4,
      );
      sunGradient.addColorStop(0, 'rgba(255, 228, 154, 0.9)');
      sunGradient.addColorStop(0.35, 'rgba(255, 178, 92, 0.55)');
      sunGradient.addColorStop(0.7, 'rgba(255, 138, 70, 0.2)');
      sunGradient.addColorStop(1, 'rgba(255, 110, 40, 0)');
      ctx.fillStyle = sunGradient;
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunRadius * 2.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Draw asteroids with slow drift, spin, and soft shadows cast away from the sun.
      asteroids.forEach((asteroid) => {
        asteroid.x += asteroid.vx;
        asteroid.y += asteroid.vy;
        asteroid.rotation += asteroid.rotationSpeed * deltaTime;

        // Respawn asteroids once they drift off-screen so they cycle in and out.
        const driftMargin = 60;
        if (
          asteroid.x < -driftMargin ||
          asteroid.y < -driftMargin ||
          asteroid.x > canvas.width + driftMargin ||
          asteroid.y > canvas.height + driftMargin
        ) {
          Object.assign(asteroid, createAsteroid());
        }

        // Compute shadow offset based on sun direction.
        const dx = asteroid.x - sunX;
        const dy = asteroid.y - sunY;
        const dist = Math.hypot(dx, dy) || 1;
        const shadowOffset = Math.min(10, dist * 0.05);
        const shadowX = (dx / dist) * shadowOffset;
        const shadowY = (dy / dist) * shadowOffset;

        ctx.save();
        ctx.globalAlpha = SUN_LAYER_OPACITY;
        ctx.translate(asteroid.x, asteroid.y);
        ctx.rotate(asteroid.rotation);

        // Draw soft shadow first so it appears behind the asteroid.
        ctx.fillStyle = 'rgba(20, 12, 6, 0.45)';
        ctx.beginPath();
        ctx.ellipse(
          shadowX,
          shadowY,
          asteroid.size * 1.2,
          asteroid.size * 0.7,
          0,
          0,
          Math.PI * 2,
        );
        ctx.fill();

        // Draw the asteroid body with warm highlights.
        ctx.fillStyle = 'rgba(170, 142, 120, 0.85)';
        ctx.beginPath();
        ctx.ellipse(0, 0, asteroid.size, asteroid.size * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Add crater details for texture.
        ctx.fillStyle = 'rgba(120, 96, 78, 0.7)';
        asteroid.craterOffsets.forEach((crater) => {
          ctx.beginPath();
          ctx.ellipse(
            crater.x * asteroid.size,
            crater.y * asteroid.size,
            crater.size * asteroid.size,
            crater.size * asteroid.size * 0.7,
            0,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        });

        ctx.restore();
      });

      // Update galaxies (slow drift)
      galaxies.forEach((galaxy) => {
        galaxy.x += galaxy.vx;
        galaxy.y += galaxy.vy;

        // Bounce off edges (with margin)
        const margin = 50;
        if (galaxy.x < margin || galaxy.x > canvas.width - margin) {
          galaxy.vx = -galaxy.vx;
        }
        if (galaxy.y < margin || galaxy.y > canvas.height - margin) {
          galaxy.vy = -galaxy.vy;
        }
      });

      // Update and draw particles
      particles.forEach((p) => {
        if (p.galaxyId !== null && p.galaxyId < galaxies.length) {
          // Galaxy particle - orbit around center
          const galaxy = galaxies[p.galaxyId];
          
          // Update orbit angle
          if (p.orbitAngle !== undefined && p.orbitDistance !== undefined) {
            // Slower orbit speed for particles farther from center
            const orbitSpeed = galaxy.rotationSpeed / (1 + p.orbitDistance / galaxy.radius);
            p.orbitAngle += orbitSpeed * deltaTime; // Frame-rate independent
            
            // Calculate new position relative to galaxy center
            p.x = galaxy.x + Math.cos(p.orbitAngle) * p.orbitDistance;
            p.y = galaxy.y + Math.sin(p.orbitAngle) * p.orbitDistance;
          }
        } else {
          // Free particle - move with constant velocity
          p.x += p.vx;
          p.y += p.vy;

          // Wrap around screen
          if (p.x < 0) p.x = canvas.width;
          if (p.x > canvas.width) p.x = 0;
          if (p.y < 0) p.y = canvas.height;
          if (p.y > canvas.height) p.y = 0;
        }

        // Pulsing opacity
        const pulse = Math.sin(time * p.pulseSpeed + p.pulseOffset) * 0.3 + 0.7;
        const alpha = p.opacity * pulse;

        // Draw particle
        ctx.fillStyle = color.replace(')', `, ${alpha})`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Draw glow
        ctx.shadowColor = color;
        ctx.shadowBlur = p.size * 4;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw connections between nearby particles
      ctx.strokeStyle = color.replace(')', ', 0.15)');
      ctx.lineWidth = 1;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 150) {
            const opacity = (1 - dist / 150) * 0.2;
            ctx.strokeStyle = color.replace(')', `, ${opacity})`);
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw galaxy centers (subtle glow)
      galaxies.forEach((galaxy) => {
        // Draw center mass
        ctx.fillStyle = color.replace(')', ', 0.3)');
        ctx.shadowColor = color;
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(galaxy.x, galaxy.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw subtle rotation indicator (optional - for debugging)
        // ctx.strokeStyle = color.replace(')', ', 0.1)');
        // ctx.lineWidth = 0.5;
        // ctx.beginPath();
        // ctx.arc(galaxy.x, galaxy.y, galaxy.radius, 0, Math.PI * 2);
        // ctx.stroke();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    // Setup ability push effect listener (for future integration with game abilities)
    interface BackgroundPushDetail {
      x: number;
      y: number;
      force: number;
    }
    
    const handleAbilityPush = (event: Event) => {
      const customEvent = event as CustomEvent<BackgroundPushDetail>;
      const { x, y, force } = customEvent.detail;
      
      // Push nearby galaxies
      galaxies.forEach((galaxy) => {
        const dx = galaxy.x - x;
        const dy = galaxy.y - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 300) { // Push radius
          const pushMagnitude = force / (1 + dist * 0.01); // Weaker push with distance
          const angle = Math.atan2(dy, dx);
          galaxy.vx += Math.cos(angle) * pushMagnitude * 0.3; // Center mass moves less
          galaxy.vy += Math.sin(angle) * pushMagnitude * 0.3;
          
          // Clamp velocity to prevent galaxies from moving too fast
          const speed = Math.sqrt(galaxy.vx * galaxy.vx + galaxy.vy * galaxy.vy);
          if (speed > 0.3) {
            galaxy.vx = (galaxy.vx / speed) * 0.3;
            galaxy.vy = (galaxy.vy / speed) * 0.3;
          }
        }
      });
      
      // Push free particles more aggressively
      particles.forEach((p) => {
        if (p.galaxyId === null) {
          const dx = p.x - x;
          const dy = p.y - y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 300) {
            const pushMagnitude = force / (1 + dist * 0.005);
            const angle = Math.atan2(dy, dx);
            p.vx += Math.cos(angle) * pushMagnitude;
            p.vy += Math.sin(angle) * pushMagnitude;
            
            // Ensure minimum velocity after push
            const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
            if (speed > 0 && speed < MIN_VELOCITY) {
              p.vx = (p.vx / speed) * MIN_VELOCITY;
              p.vy = (p.vy / speed) * MIN_VELOCITY;
            }
            // Clamp maximum velocity
            if (speed > 2.0) {
              p.vx = (p.vx / speed) * 2.0;
              p.vy = (p.vy / speed) * 2.0;
            }
          }
        }
      });
    };

    // Listen for custom ability push events
    window.addEventListener('backgroundPush', handleAbilityPush);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
      window.removeEventListener('backgroundPush', handleAbilityPush);
    };
  }, [particleCount, color, galaxyCount]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none opacity-30"
      style={{ zIndex: 0 }}
    />
  );
}
