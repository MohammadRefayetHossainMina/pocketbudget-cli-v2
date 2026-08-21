(function (DA) {
  const { CANVAS_WIDTH } = DA;

  function drawHud(ctx, view) {
    const { player, stage, score, biomeName, bossName } = view;

    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.fillRect(0, 0, CANVAS_WIDTH, 46);

    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillRect(16, 12, 180, 14);
    const ratio = player.maxHp ? player.hp / player.maxHp : 0;
    ctx.fillStyle = ratio > 0.35 ? "#3ecf6d" : "#e74c3c";
    ctx.fillRect(16, 12, 180 * Math.max(0, ratio), 14);
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.strokeRect(16, 12, 180, 14);
    ctx.fillStyle = "#f2f2f8";
    ctx.font = "11px ui-sans-serif, system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`HP ${Math.ceil(player.hp)}`, 20, 23);

    ctx.textAlign = "center";
    ctx.font = "bold 16px ui-sans-serif, system-ui, sans-serif";
    ctx.fillStyle = "#7ec8ff";
    ctx.fillText(`STAGE ${stage} / 50`, CANVAS_WIDTH / 2, 22);
    ctx.font = "11px ui-sans-serif, system-ui, sans-serif";
    ctx.fillStyle = "#c8c8d8";
    ctx.fillText(biomeName, CANVAS_WIDTH / 2, 38);

    ctx.textAlign = "right";
    ctx.font = "bold 14px ui-sans-serif, system-ui, sans-serif";
    ctx.fillStyle = "#ffe566";
    ctx.fillText(`SCORE ${score}`, CANVAS_WIDTH - 16, 28);

    if (bossName) {
      ctx.textAlign = "center";
      ctx.fillStyle = "#ff8a7a";
      ctx.font = "bold 12px ui-sans-serif, system-ui, sans-serif";
      const prefix = bossName === "The Kingpin" ? "BOSS" : "MINI-BOSS";
      ctx.fillText(`${prefix}: ${bossName}`, CANVAS_WIDTH / 2, 58);
    }
  }

  DA.drawHud = drawHud;
})(window.DA = window.DA || {});
