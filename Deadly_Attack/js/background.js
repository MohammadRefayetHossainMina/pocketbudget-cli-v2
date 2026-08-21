(function (DA) {
  const { CANVAS_HEIGHT, CANVAS_WIDTH, GROUND_HEIGHT, GROUND_Y } = DA;

  function createBackground() {
    return { t: 0 };
  }

  function updateBackground(bg, dt, playing) {
    bg.t += dt * (playing ? 1 : 0.22);
  }

  function drawBackground(ctx, bg, biome) {
    const sky = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    sky.addColorStop(0, biome.sky[0]);
    sky.addColorStop(0.55, biome.sky[1]);
    sky.addColorStop(1, biome.sky[2]);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    drawLayer(ctx, bg.t * 18, 210, biome.building2, biome.window, 0.35, 90);
    drawLayer(ctx, bg.t * 38, 160, biome.building, biome.window, 0.7, 70);

    ctx.fillStyle = biome.fog;
    ctx.fillRect(0, GROUND_Y - 80, CANVAS_WIDTH, 80);

    ctx.fillStyle = biome.street;
    ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, GROUND_HEIGHT);

    ctx.fillStyle = biome.accent;
    ctx.globalAlpha = 0.85;
    ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, 3);
    ctx.globalAlpha = 1;

    ctx.fillStyle = "rgba(255,255,255,0.05)";
    for (let i = 0; i < 8; i += 1) {
      const x = ((i * 140 + bg.t * 90) % (CANVAS_WIDTH + 40)) - 20;
      ctx.fillRect(x, GROUND_Y + 28, 46, 4);
    }
  }

  function drawLayer(ctx, scroll, spacing, fill, windowColor, alpha, minH) {
    ctx.globalAlpha = alpha;
    const offset = scroll % spacing;
    for (let i = -1; i < CANVAS_WIDTH / spacing + 2; i += 1) {
      const x = i * spacing - offset;
      const h = minH + ((i * 73 + 19) % 120);
      const w = spacing * 0.62;
      ctx.fillStyle = fill;
      ctx.fillRect(x, GROUND_Y - h, w, h);

      ctx.fillStyle = windowColor;
      const cols = 3;
      const rows = Math.max(2, Math.floor(h / 28));
      for (let r = 0; r < rows; r += 1) {
        for (let c = 0; c < cols; c += 1) {
          if ((r + c + i) % 3 === 0) {
            continue;
          }
          ctx.globalAlpha = alpha * 0.55;
          ctx.fillRect(x + 10 + c * 18, GROUND_Y - h + 12 + r * 22, 8, 10);
        }
      }
      ctx.globalAlpha = alpha;
    }
    ctx.globalAlpha = 1;
  }

  DA.createBackground = createBackground; DA.updateBackground = updateBackground; DA.drawBackground = drawBackground;
})(window.DA = window.DA || {});
