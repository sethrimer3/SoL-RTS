/**
 * Camera system for smooth zooming and panning
 */

import { GameState, Vector2, ARENA_WIDTH_METERS, ARENA_HEIGHT_METERS, PIXELS_PER_METER } from './types';
import { getViewportScale, getViewportOffset, getViewportDimensions, getArenaHeight, getPlayfieldRotationRadians } from './gameUtils';

// Camera constants
const ZOOM_SPEED = 0.1;
const PAN_SPEED = 10; // meters per second
const CAMERA_SMOOTHING = 0.15; // Lerp factor for smooth transitions
const WALL_PEEK_PIXELS = 24; // Allow a tiny peek beyond the arena to keep walls visible.

/**
 * Estimate the pixel height reserved for the bottom action bar on mobile button mode.
 * This keeps the zoom bounds aligned with the visible playfield above the controls.
 */
function getMobileButtonBarHeight(state: GameState): number {
  // Only reserve space when the mobile button-based control mode is active.
  if (!state.isMobile || state.settings.controlMode !== 'buttons') {
    return 0;
  }

  // Mirror the button row sizing (70px buttons + padding) with a conservative buffer.
  return 110;
}

/**
 * Calculate minimum zoom level to show the entire playing field.
 * This ensures players can't zoom out beyond seeing the whole arena.
 */
function calculateMinZoom(state: GameState): number {
  const viewportDimensions = getViewportDimensions();
  const arenaHeight = getArenaHeight();
  const reservedHeight = getMobileButtonBarHeight(state);
  const availableHeight = Math.max(0, viewportDimensions.height - reservedHeight);
  
  if (viewportDimensions.width <= 0 || availableHeight <= 0) {
    return MIN_ZOOM; // Fallback value
  }
  
  // Calculate the zoom level where the entire arena fits in the viewport
  const arenaWidthMeters = ARENA_WIDTH_METERS;
  const arenaHeightMeters = arenaHeight;
  const arenaWidthPixels = arenaWidthMeters * PIXELS_PER_METER * getViewportScale();
  const arenaHeightPixels = arenaHeightMeters * PIXELS_PER_METER * getViewportScale();
  
  const zoomX = viewportDimensions.width / arenaWidthPixels;
  const zoomY = availableHeight / arenaHeightPixels;
  
  // Use the smaller zoom to ensure entire field is visible.
  // Avoid flooring to a fixed minimum so the "full field fits" zoom is the max zoom-out.
  return Math.min(zoomX, zoomY);
}

const MIN_ZOOM = 0.3; // Absolute minimum fallback
const MAX_ZOOM = 3.0; // Allow zooming in really far as requested

type CameraInitializationOptions = {
  initialZoom?: number;
  focusPosition?: Vector2;
};

/**
 * Clamp a camera offset so the visible view stays within the arena bounds.
 * This keeps players from panning outside the playfield when zoomed in.
 */
function clampCameraOffset(state: GameState, offset: Vector2, zoom: number): Vector2 {
  const viewportDimensions = getViewportDimensions();
  const viewportScale = getViewportScale();
  const arenaHeight = getArenaHeight();
  // Use arena dimensions directly without rotation
  const arenaWidthMeters = ARENA_WIDTH_METERS;
  const arenaHeightMeters = arenaHeight;
  const arenaWidthPixels = arenaWidthMeters * PIXELS_PER_METER * viewportScale;
  const arenaHeightPixels = arenaHeightMeters * PIXELS_PER_METER * viewportScale;
  const halfViewWidth = viewportDimensions.width / (2 * zoom);
  const halfViewHeight = viewportDimensions.height / (2 * zoom);
  const paddingPixels = WALL_PEEK_PIXELS;

  // Compute how far the camera can pan before the arena edge leaves the view.
  const maxOffsetPixelsX = Math.max(0, arenaWidthPixels / 2 + paddingPixels - halfViewWidth);
  const maxOffsetPixelsY = Math.max(0, arenaHeightPixels / 2 + paddingPixels - halfViewHeight);

  // Convert pixel bounds back into world meters for the camera offset.
  const maxOffsetMetersX = maxOffsetPixelsX / (PIXELS_PER_METER * viewportScale);
  const maxOffsetMetersY = maxOffsetPixelsY / (PIXELS_PER_METER * viewportScale);

  return {
    x: Math.max(-maxOffsetMetersX, Math.min(maxOffsetMetersX, offset.x)),
    y: Math.max(-maxOffsetMetersY, Math.min(maxOffsetMetersY, offset.y)),
  };
}

/**
 * Initialize camera for game state
 * On mobile, start zoomed out so the playing field is visible above the bottom UI buttons
 */
export function initializeCamera(state: GameState, options: CameraInitializationOptions = {}): void {
  if (!state.camera) {
    // Determine the minimum zoom that keeps the full arena visible.
    const minZoom = calculateMinZoom(state);
    // On mobile, start zoomed out to the minimum allowed so the field clears the bottom controls.
    const defaultZoom = state.isMobile ? minZoom : 1.0;
    // Respect any provided zoom preference while still honoring the minimum zoom-out limit.
    const initialZoom = Math.max(minZoom, options.initialZoom ?? defaultZoom);
    // Center on a provided focus position (like the player's base) if available.
    const focusPosition = options.focusPosition;
    const initialOffset = focusPosition ? { x: -focusPosition.x, y: -focusPosition.y } : { x: 0, y: 0 };
    
    state.camera = {
      offset: initialOffset,
      targetOffset: initialOffset,
      zoom: initialZoom,
      targetZoom: initialZoom,
      smoothing: CAMERA_SMOOTHING,
    };
  }
}

/**
 * Update camera position and zoom with smooth interpolation
 */
export function updateCamera(state: GameState, deltaTime: number): void {
  if (!state.camera) return;

  // Smooth zoom interpolation
  const zoomDiff = state.camera.targetZoom - state.camera.zoom;
  state.camera.zoom += zoomDiff * state.camera.smoothing;

  // Clamp zoom to valid range (recalculate min zoom for dynamic bounds)
  const minZoom = calculateMinZoom(state);
  state.camera.zoom = Math.max(minZoom, Math.min(MAX_ZOOM, state.camera.zoom));
  state.camera.targetZoom = Math.max(minZoom, Math.min(MAX_ZOOM, state.camera.targetZoom));

  // Clamp the target offset so the camera never pans outside the arena bounds.
  state.camera.targetOffset = clampCameraOffset(state, state.camera.targetOffset, state.camera.targetZoom);

  // Smooth offset interpolation
  const offsetDiffX = state.camera.targetOffset.x - state.camera.offset.x;
  const offsetDiffY = state.camera.targetOffset.y - state.camera.offset.y;
  
  state.camera.offset.x += offsetDiffX * state.camera.smoothing;
  state.camera.offset.y += offsetDiffY * state.camera.smoothing;

  // Clamp the current offset to prevent overshoot from smoothing.
  state.camera.offset = clampCameraOffset(state, state.camera.offset, state.camera.zoom);
}

/**
 * Zoom camera in or out (for mouse wheel)
 */
export function zoomCamera(state: GameState, delta: number): void {
  if (!state.camera) {
    initializeCamera(state);
  }
  
  const minZoom = calculateMinZoom(state);
  state.camera!.targetZoom += delta * ZOOM_SPEED;
  state.camera!.targetZoom = Math.max(minZoom, Math.min(MAX_ZOOM, state.camera!.targetZoom));
}

/**
 * Zoom camera at a specific screen point (for pinch-to-zoom)
 * This keeps the point under the pinch center stable as you zoom
 */
export function zoomCameraAtPoint(state: GameState, delta: number, screenPoint: Vector2, canvas: HTMLCanvasElement): void {
  if (!state.camera) {
    initializeCamera(state);
  }
  
  const camera = state.camera!;
  const oldZoom = camera.targetZoom;
  
  // Calculate new zoom level
  const minZoom = calculateMinZoom(state);
  const newZoom = Math.max(minZoom, Math.min(MAX_ZOOM, oldZoom + delta * ZOOM_SPEED));
  
  if (newZoom === oldZoom) return; // No zoom change
  
  // Get viewport information for coordinate transformation
  const viewportScale = getViewportScale();
  const viewportOffset = getViewportOffset();
  const viewportDimensions = getViewportDimensions();
  const centerX = viewportDimensions.width > 0 ? viewportOffset.x + viewportDimensions.width / 2 : canvas.width / 2;
  const centerY = viewportDimensions.height > 0 ? viewportOffset.y + viewportDimensions.height / 2 : canvas.height / 2;
  
  // Get world coordinates at the pinch point before zoom using target offset to avoid drift.
  const worldPointX = (screenPoint.x - centerX) / oldZoom - camera.targetOffset.x * PIXELS_PER_METER * viewportScale + centerX;
  const worldPointY = (screenPoint.y - centerY) / oldZoom - camera.targetOffset.y * PIXELS_PER_METER * viewportScale + centerY;
  
  // Apply zoom
  camera.targetZoom = newZoom;
  
  // Calculate what the world point would be after zoom with current offset
  const newWorldPointX = (screenPoint.x - centerX) / newZoom - camera.targetOffset.x * PIXELS_PER_METER * viewportScale + centerX;
  const newWorldPointY = (screenPoint.y - centerY) / newZoom - camera.targetOffset.y * PIXELS_PER_METER * viewportScale + centerY;
  
  // Adjust offset to keep the world point at the same screen position
  const offsetDiffX = (newWorldPointX - worldPointX) / (PIXELS_PER_METER * viewportScale);
  const offsetDiffY = (newWorldPointY - worldPointY) / (PIXELS_PER_METER * viewportScale);
  
  camera.targetOffset.x -= offsetDiffX;
  camera.targetOffset.y -= offsetDiffY;

  // Keep the adjusted zoom focus within the arena bounds.
  camera.targetOffset = clampCameraOffset(state, camera.targetOffset, camera.targetZoom);
}

/**
 * Pan camera in a direction
 */
export function panCamera(state: GameState, direction: Vector2, deltaTime: number): void {
  if (!state.camera) {
    initializeCamera(state);
  }

  const speed = PAN_SPEED * deltaTime;
  state.camera!.targetOffset.x += direction.x * speed;
  state.camera!.targetOffset.y += direction.y * speed;
}

/**
 * Reset camera to default position and zoom
 */
export function resetCamera(state: GameState): void {
  if (!state.camera) {
    initializeCamera(state);
    return;
  }

  state.camera.targetOffset = { x: 0, y: 0 };
  state.camera.targetZoom = 1.0;
}

/**
 * Focus camera on a specific position
 */
export function focusCamera(state: GameState, position: Vector2): void {
  if (!state.camera) {
    initializeCamera(state);
  }

  // Camera offset is in world coordinates
  state.camera!.targetOffset = { 
    x: -position.x, 
    y: -position.y 
  };
}

/**
 * Apply camera transformation to canvas context
 */
export function applyCameraTransform(ctx: CanvasRenderingContext2D, state: GameState, canvas: HTMLCanvasElement): void {
  if (!state.camera) return;

  const viewportScale = getViewportScale();
  const viewportOffset = getViewportOffset();
  const viewportDimensions = getViewportDimensions();
  // Use the arena viewport center so zoom/pan are consistent across aspect ratios
  const centerX = viewportDimensions.width > 0 ? viewportOffset.x + viewportDimensions.width / 2 : canvas.width / 2;
  const centerY = viewportDimensions.height > 0 ? viewportOffset.y + viewportDimensions.height / 2 : canvas.height / 2;
  
  ctx.save();
  
  // Translate to center of the letterboxed arena viewport
  ctx.translate(centerX, centerY);
  
  // Apply zoom
  ctx.scale(state.camera.zoom, state.camera.zoom);
  
  // Apply camera offset (convert meters to pixels with viewport scale)
  ctx.translate(state.camera.offset.x * PIXELS_PER_METER * viewportScale, state.camera.offset.y * PIXELS_PER_METER * viewportScale);
  
  // Translate back from viewport center
  ctx.translate(-centerX, -centerY);
}

/**
 * Remove camera transformation from canvas context
 */
export function removeCameraTransform(ctx: CanvasRenderingContext2D): void {
  ctx.restore();
}

/**
 * Convert screen position to world position accounting for camera
 */
export function screenToWorld(screenPos: Vector2, state: GameState, canvas: HTMLCanvasElement): Vector2 {
  if (!state.camera) {
    return { x: screenPos.x, y: screenPos.y };
  }

  const viewportScale = getViewportScale();
  const viewportOffset = getViewportOffset();
  const viewportDimensions = getViewportDimensions();
  // Anchor the camera conversion on the arena viewport center
  const centerX = viewportDimensions.width > 0 ? viewportOffset.x + viewportDimensions.width / 2 : canvas.width / 2;
  const centerY = viewportDimensions.height > 0 ? viewportOffset.y + viewportDimensions.height / 2 : canvas.height / 2;

  // Reverse the transformations
  const x = (screenPos.x - centerX) / state.camera.zoom - state.camera.offset.x * PIXELS_PER_METER * viewportScale + centerX;
  const y = (screenPos.y - centerY) / state.camera.zoom - state.camera.offset.y * PIXELS_PER_METER * viewportScale + centerY;

  return { x, y };
}

/**
 * Convert world position to screen position accounting for camera
 */
export function worldToScreen(worldPos: Vector2, state: GameState, canvas: HTMLCanvasElement): Vector2 {
  if (!state.camera) {
    return { x: worldPos.x, y: worldPos.y };
  }

  const viewportScale = getViewportScale();
  const viewportOffset = getViewportOffset();
  const viewportDimensions = getViewportDimensions();
  // Anchor the camera conversion on the arena viewport center
  const centerX = viewportDimensions.width > 0 ? viewportOffset.x + viewportDimensions.width / 2 : canvas.width / 2;
  const centerY = viewportDimensions.height > 0 ? viewportOffset.y + viewportDimensions.height / 2 : canvas.height / 2;

  const x = (worldPos.x - centerX + state.camera.offset.x * PIXELS_PER_METER * viewportScale) * state.camera.zoom + centerX;
  const y = (worldPos.y - centerY + state.camera.offset.y * PIXELS_PER_METER * viewportScale) * state.camera.zoom + centerY;

  return { x, y };
}
