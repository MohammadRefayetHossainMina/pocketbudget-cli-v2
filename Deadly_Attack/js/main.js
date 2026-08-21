(function (DA) {
  const { CANVAS_HEIGHT, CANVAS_WIDTH, ENEMY_TYPES, LIMITS, biomeFor, createBackground, drawBackground, updateBackground, createBulletPool, createEnemyManager, drawHud, createInput, createPlayer, drawPlayer, resetPlayer, updatePlayer, drawOverlay, createStageController } = DA;

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d", { alpha: false });

  const input = createInput();
  const player = createPlayer();
  const enemies = createEnemyManager();
  const bullets = createBulletPool();
  const stage = createStageController();
  const background = createBackground();

  const game = {
    mode: "title",
    score: 0,
    clearTimer: 0,
  };

  function startRun() {
    game.mode = "playing";
    game.score = 0;
    game.clearTimer = 0;
    resetPlayer(player);
    enemies.clear();
    bullets.clear();
    stage.reset(1);
  }

  function restartSameRun() {
    startRun();
  }

  function continueNextStage() {
    if (stage.index >= 50) {
      game.mode = "victory";
      return;
    }
    stage.next();
    enemies.clear();
    bullets.clear();
    player.hp = Math.min(player.maxHp, player.hp + 18);
    player.invuln = 0.4;
    game.mode = "playing";
    game.clearTimer = 0;
  }

  function update(dt) {
    const playing = game.mode === "playing";
    updateBackground(background, dt, playing);

    if (game.mode === "title" && input.pressed("Enter")) {
      startRun();
    }

    if (game.mode === "cleared") {
      game.clearTimer -= dt;
      if (input.pressed("Enter") || game.clearTimer <= 0) {
        continueNextStage();
      }
    }

    if ((game.mode === "gameover" || game.mode === "victory") && input.pressed("KeyR")) {
      restartSameRun();
    }

    if (game.mode === "playing" && input.pressed("KeyR")) {
      restartSameRun();
    }

    if (game.mode !== "playing") {
      return;
    }

    updatePlayer(player, dt, input, bullets);
    stage.update(dt, enemies);
    game.score += enemies.update(dt, player, bullets);
    bullets.update(dt);

    if (player.hp <= 0) {
      game.mode = "gameover";
      return;
    }

    if (stage.isCleared(enemies)) {
      if (stage.index >= 50) {
        game.mode = "victory";
      } else {
        game.mode = "cleared";
        game.clearTimer = 2.2;
      }
    }
  }

  function draw() {
    const biome = biomeFor(stage.index);
    drawBackground(ctx, background, biome);

    if (game.mode !== "title") {
      enemies.draw(ctx);
      bullets.draw(ctx);
      drawPlayer(ctx, player);
      const def = stage.def();
      drawHud(ctx, {
        player,
        stage: stage.index,
        score: game.score,
        biomeName: biome.name,
        bossName: enemies.hasBoss() ? ENEMY_TYPES[def.miniBossType].name : "",
      });
    }

    if (game.mode !== "playing") {
      drawOverlay(ctx, game.mode, { stage: stage.index, score: game.score });
    }
  }

  let last = performance.now();

  function loop(now) {
    const dt = Math.min(LIMITS.maxDt, (now - last) / 1000);
    last = now;
    update(dt);
    draw();
    input.endFrame();
    requestAnimationFrame(loop);
  }

  ctx.fillStyle = "#07070f";
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  requestAnimationFrame(loop);
})(window.DA = window.DA || {});
