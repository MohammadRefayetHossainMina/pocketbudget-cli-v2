import { CANVAS_HEIGHT, CANVAS_WIDTH, TYPE_LEGEND } from "./config.js";

export function drawOverlay(ctx, mode, extra) {
  ctx.fillStyle = "rgba(4, 4, 12, 0.62)";
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.textAlign = "center";

  if (mode === "title") {
    ctx.fillStyle = "#7ec8ff";
    ctx.font = "bold 42px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText("DEADLY ATTACK", CANVAS_WIDTH / 2, 150);
    ctx.fillStyle = "#f2f2f8";
    ctx.font = "18px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText("The Neon Shadow — Neon Crime City, 2086", CANVAS_WIDTH / 2, 186);
    ctx.font = "14px ui-sans-serif, system-ui, sans-serif";
    ctx.fillStyle = "#c8c8d8";
    ctx.fillText(
      "Ayan. 50 floors. The Kingpin waits at the bottom.",
      CANVAS_WIDTH / 2,
      220,
    );

    ctx.font = "12px ui-sans-serif, system-ui, sans-serif";
    const startX = 140;
    TYPE_LEGEND.forEach((item, i) => {
      const x = startX + i * 90;
      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.ellipse(x, 300, 10, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ddd";
      ctx.fillText(item.label, x, 328);
    });
    ctx.fillStyle = "#8b8ba0";
    ctx.fillText("Color = type · bigger cylinder = boss", CANVAS_WIDTH / 2, 360);

    ctx.fillStyle = "#ffe566";
    ctx.font = "bold 16px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText("Press Enter to start", CANVAS_WIDTH / 2, 430);
    return;
  }

  if (mode === "cleared") {
    ctx.fillStyle = "#3ecf6d";
    ctx.font = "bold 40px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText("STAGE CLEARED", CANVAS_WIDTH / 2, 230);
    ctx.fillStyle = "#f2f2f8";
    ctx.font = "16px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText(`Floor ${extra.stage} is down. Score ${extra.score}`, CANVAS_WIDTH / 2, 270);
    ctx.fillStyle = "#ffe566";
    ctx.fillText("Enter — next floor (auto in a moment)", CANVAS_WIDTH / 2, 320);
    return;
  }

  if (mode === "gameover") {
    ctx.fillStyle = "#e74c3c";
    ctx.font = "bold 42px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText("GAME OVER", CANVAS_WIDTH / 2, 230);
    ctx.fillStyle = "#f2f2f8";
    ctx.font = "16px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText(`Fell on stage ${extra.stage} · Score ${extra.score}`, CANVAS_WIDTH / 2, 270);
    ctx.fillStyle = "#ffe566";
    ctx.fillText("Press R to restart from stage 1", CANVAS_WIDTH / 2, 320);
    return;
  }

  if (mode === "victory") {
    ctx.fillStyle = "#ffd54a";
    ctx.font = "bold 36px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText("THE KINGPIN FALLS", CANVAS_WIDTH / 2, 220);
    ctx.fillStyle = "#f2f2f8";
    ctx.font = "16px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText("Neon Crime City is quiet. For now.", CANVAS_WIDTH / 2, 262);
    ctx.fillText(`Final score ${extra.score}`, CANVAS_WIDTH / 2, 292);
    ctx.fillStyle = "#ffe566";
    ctx.fillText("Press R to run the 50 floors again", CANVAS_WIDTH / 2, 340);
  }
}
