(function (DA) {
  /**
   * Procedural cylinder motion. Sprite sheets can replace draw.js later;
   * this module only ticks pose fields (bob, squash, pulse, flash).
   */

  function tickFlashAndMuzzle(entity, dt) {
    entity.flash = Math.max(0, (entity.flash || 0) - dt);
    entity.muzzle = Math.max(0, (entity.muzzle || 0) - dt);
  }

  function tickBossPulse(entity, dt) {
    entity.age = (entity.age || 0) + dt;
    entity.pulse = entity.isBoss ? 1 + Math.sin(entity.age * 3.1) * 0.045 : 1;
  }

  function tickWalkBob(entity, dt, speedFactor, amplitude) {
    entity.walkPhase = (entity.walkPhase || 0) + dt * speedFactor;
    entity.bob = Math.sin(entity.walkPhase) * amplitude;
  }

  function tickHoverBob(entity, dt) {
    entity.walkPhase = (entity.walkPhase || 0) + dt * 8;
    entity.bob = Math.sin((entity.age || 0) * 5) * 2;
  }

  function tickLandSquash(entity, dt, duration = 0.22) {
    if (entity.landSquash > 0) {
      entity.landSquash -= dt;
      const t = Math.max(0, Math.min(1, entity.landSquash / duration));
      entity.squash = 0.8 + 0.2 * (1 - t);
    } else {
      entity.squash = 1;
    }
  }

  DA.tickFlashAndMuzzle = tickFlashAndMuzzle; DA.tickBossPulse = tickBossPulse; DA.tickWalkBob = tickWalkBob; DA.tickHoverBob = tickHoverBob; DA.tickLandSquash = tickLandSquash;
})(window.DA = window.DA || {});
