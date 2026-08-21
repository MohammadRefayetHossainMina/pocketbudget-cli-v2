(function (DA) {
  const { mixTowardWhite, shadeHex } = DA;

  /**
   * 2D cylinder (capsule body + ellipse cap). Color = type, size = rank.
   * Optional motion: bob, squash/stretch, walk legs, hit flash, boss pulse.
   */
  function drawCylinder(ctx, spec) {
    const {
      x,
      y,
      radius,
      height,
      color,
      squash = 1,
      stretch = 1,
      bob = 0,
      flash = 0,
      facing = 1,
      walkPhase = 0,
      isBoss = false,
      pulse = 1,
      muzzle = 0,
      typeId = "",
      hpRatio = 1,
      moving = false,
    } = spec;

    const r = Math.max(6, (radius * pulse) / Math.max(0.72, squash));
    const h = Math.max(r * 1.35, height * stretch * squash);
    const baseY = y + bob;
    const topY = baseY - h;
    const fill = flash > 0 ? mixTowardWhite(color, Math.min(0.75, flash * 4)) : color;
    const dark = shadeHex(fill, -40);
    const cap = shadeHex(fill, 36);
    const stride = moving ? Math.sin(walkPhase) * Math.min(9, r * 0.42) : 0;

    ctx.save();

    if (!spec.flying) {
      drawLeg(ctx, x - r * 0.35 - stride * 0.2, baseY, r * 0.28, dark, facing);
      drawLeg(ctx, x + r * 0.35 + stride * 0.2, baseY, r * 0.28, dark, facing);
    }

    ctx.fillStyle = dark;
    ctx.beginPath();
    ctx.ellipse(x, baseY - 2, r, r * 0.38, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = fill;
    ctx.fillRect(x - r, topY, r * 2, h - 2);

    ctx.fillStyle = cap;
    ctx.beginPath();
    ctx.ellipse(x, topY, r, r * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.beginPath();
    ctx.ellipse(x - r * 0.28, topY + h * 0.28, r * 0.18, h * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();

    const visorX = x + facing * r * 0.28;
    const visorY = topY + Math.min(16, h * 0.22);
    ctx.fillStyle = "rgba(10, 14, 22, 0.72)";
    ctx.beginPath();
    ctx.ellipse(visorX, visorY, r * 0.42, Math.max(4, r * 0.22), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(180, 230, 255, 0.35)";
    ctx.beginPath();
    ctx.ellipse(visorX + facing * 2, visorY - 1, r * 0.16, r * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();

    if (isBoss) {
      ctx.strokeStyle = shadeHex(fill, 50);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(x, topY + h * 0.38, r * 0.92, r * 0.22, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (typeId === "kingpin") {
      ctx.fillStyle = "#fff3b0";
      ctx.beginPath();
      ctx.moveTo(x - r * 0.55, topY - 2);
      ctx.lineTo(x, topY - r * 0.7);
      ctx.lineTo(x + r * 0.55, topY - 2);
      ctx.closePath();
      ctx.fill();
    }

    if (muzzle > 0) {
      ctx.fillStyle = "#ffe566";
      ctx.beginPath();
      ctx.ellipse(
        x + facing * (r + 10),
        topY + h * 0.42,
        10 + muzzle * 40,
        4,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }

    if (isBoss && hpRatio < 1) {
      const bw = r * 2;
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      ctx.fillRect(x - r, topY - 12, bw, 5);
      ctx.fillStyle = hpRatio > 0.4 ? "#3ecf6d" : "#e74c3c";
      ctx.fillRect(x - r, topY - 12, bw * Math.max(0, hpRatio), 5);
    }

    ctx.restore();
  }

  function drawLeg(ctx, lx, ly, lr, color, facing) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(lx + facing * 2, ly + 4, lr, lr * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawBullet(ctx, b) {
    ctx.fillStyle = b.team === "player" ? "#cfe8ff" : "#ff8a7a";
    ctx.beginPath();
    ctx.ellipse(b.x, b.y, b.team === "player" ? 7 : 6, 3.2, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawActor(ctx, entity) {
    const moving = entity.flying ? true : Math.abs(entity.vx || 0) > 8 || (!entity.onGround && !entity.flying);
    drawCylinder(ctx, {
      x: entity.x,
      y: entity.y,
      radius: entity.radius,
      height: entity.height,
      color: entity.color,
      squash: entity.squash ?? 1,
      stretch: entity.stretch ?? 1,
      bob: entity.bob ?? 0,
      flash: entity.flash ?? 0,
      facing: entity.facing ?? 1,
      walkPhase: entity.walkPhase ?? 0,
      isBoss: !!entity.isBoss,
      pulse: entity.pulse ?? 1,
      muzzle: entity.muzzle ?? 0,
      typeId: entity.typeId || "",
      hpRatio: entity.maxHp ? entity.hp / entity.maxHp : 1,
      flying: !!entity.flying,
      moving: entity.onGround ? Math.abs(entity.vx || entity._chaseSpeed || 0) > 12 : moving,
    });
  }

  DA.drawCylinder = drawCylinder; DA.drawBullet = drawBullet; DA.drawActor = drawActor;
})(window.DA = window.DA || {});
