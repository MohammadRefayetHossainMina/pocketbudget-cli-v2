(function (DA) {
  const { CANVAS_WIDTH, LIMITS, drawBullet } = DA;

  function makeBullet() {
    return {
      active: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      team: "player",
      damage: 0,
      radius: 4,
    };
  }

  function createBulletPool() {
    const pool = Array.from({ length: LIMITS.maxBullets }, makeBullet);

    return {
      spawn(spec) {
        const bullet = pool.find((item) => !item.active);
        if (!bullet) {
          return null;
        }
        bullet.active = true;
        bullet.x = spec.x;
        bullet.y = spec.y;
        bullet.vx = spec.vx;
        bullet.vy = spec.vy || 0;
        bullet.team = spec.team;
        bullet.damage = spec.damage;
        bullet.radius = spec.radius || 4;
        return bullet;
      },
      update(dt) {
        for (const bullet of pool) {
          if (!bullet.active) {
            continue;
          }
          bullet.x += bullet.vx * dt;
          bullet.y += bullet.vy * dt;
          if (bullet.x < -20 || bullet.x > CANVAS_WIDTH + 20 || bullet.y < -20 || bullet.y > 560) {
            bullet.active = false;
          }
        }
      },
      draw(ctx) {
        for (const bullet of pool) {
          if (bullet.active) {
            drawBullet(ctx, bullet);
          }
        }
      },
      eachActive(fn) {
        for (const bullet of pool) {
          if (bullet.active) {
            fn(bullet);
          }
        }
      },
      clear() {
        for (const bullet of pool) {
          bullet.active = false;
        }
      },
    };
  }

  DA.createBulletPool = createBulletPool;
})(window.DA = window.DA || {});
