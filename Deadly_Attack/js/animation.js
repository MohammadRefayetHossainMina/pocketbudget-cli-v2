/**
 * Procedural cylinder motion. Sprite sheets can replace draw.js later;
 * this module only ticks pose fields (bob, squash, pulse, flash).
 */

export function tickFlashAndMuzzle(entity, dt) {
  entity.flash = Math.max(0, (entity.flash || 0) - dt);
  entity.muzzle = Math.max(0, (entity.muzzle || 0) - dt);
}

export function tickBossPulse(entity, dt) {
  entity.age = (entity.age || 0) + dt;
  entity.pulse = entity.isBoss ? 1 + Math.sin(entity.age * 3.1) * 0.045 : 1;
}

export function tickWalkBob(entity, dt, speedFactor, amplitude) {
  entity.walkPhase = (entity.walkPhase || 0) + dt * speedFactor;
  entity.bob = Math.sin(entity.walkPhase) * amplitude;
}

export function tickHoverBob(entity, dt) {
  entity.walkPhase = (entity.walkPhase || 0) + dt * 8;
  entity.bob = Math.sin((entity.age || 0) * 5) * 2;
}

export function tickLandSquash(entity, dt, duration = 0.22) {
  if (entity.landSquash > 0) {
    entity.landSquash -= dt;
    const t = Math.max(0, Math.min(1, entity.landSquash / duration));
    entity.squash = 0.8 + 0.2 * (1 - t);
  } else {
    entity.squash = 1;
  }
}
