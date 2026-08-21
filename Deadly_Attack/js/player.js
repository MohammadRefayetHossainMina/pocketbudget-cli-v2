import { tickFlashAndMuzzle, tickLandSquash } from "./animation.js";
import { CANVAS_WIDTH, GROUND_Y, PLAYER } from "./config.js";
import { drawActor } from "./draw.js";
import { clamp } from "./util.js";

export function createPlayer() {
  return {
    x: 140,
    y: GROUND_Y,
    vx: 0,
    vy: 0,
    radius: PLAYER.radius,
    height: PLAYER.height,
    color: PLAYER.color,
    hp: PLAYER.maxHp,
    maxHp: PLAYER.maxHp,
    onGround: true,
    facing: 1,
    walkPhase: 0,
    shootCooldown: 0,
    invuln: 0,
    landSquash: 0,
    muzzle: 0,
    flash: 0,
    squash: 1,
    stretch: 1,
    bob: 0,
    pulse: 1,
    typeId: "player",
    isBoss: false,
    flying: false,
  };
}

export function resetPlayer(player) {
  player.x = 140;
  player.y = GROUND_Y;
  player.vx = 0;
  player.vy = 0;
  player.hp = PLAYER.maxHp;
  player.onGround = true;
  player.facing = 1;
  player.walkPhase = 0;
  player.shootCooldown = 0;
  player.invuln = 0;
  player.landSquash = 0;
  player.muzzle = 0;
  player.flash = 0;
  player.squash = 1;
  player.stretch = 1;
  player.bob = 0;
}

export function hurtPlayer(player, amount) {
  if (player.invuln > 0 || player.hp <= 0) {
    return false;
  }
  player.hp = Math.max(0, player.hp - amount);
  player.invuln = PLAYER.invulnTime;
  player.flash = 0.18;
  player.vx = -player.facing * 90;
  return true;
}

export function updatePlayer(player, dt, input, bullets) {
  const left = input.down("KeyA") || input.down("ArrowLeft");
  const right = input.down("KeyD") || input.down("ArrowRight");
  const jump =
    input.pressed("KeyW") || input.pressed("ArrowUp") || input.pressed("KeyK");
  const shoot = input.down("Space");

  player.vx = 0;
  if (left) {
    player.vx = -PLAYER.speed;
    player.facing = -1;
  }
  if (right) {
    player.vx = PLAYER.speed;
    player.facing = 1;
  }

  if (jump && player.onGround) {
    player.vy = -PLAYER.jumpForce;
    player.onGround = false;
    player.stretch = 1.12;
  }

  player.vy += PLAYER.gravity * dt;
  player.x += player.vx * dt;
  player.y += player.vy * dt;

  if (player.y >= GROUND_Y) {
    if (!player.onGround && player.vy > 90) {
      player.landSquash = 0.22;
    }
    player.y = GROUND_Y;
    player.vy = 0;
    player.onGround = true;
  } else {
    player.onGround = false;
  }

  player.x = clamp(player.x, player.radius + 10, CANVAS_WIDTH * 0.58);

  if (player.onGround && Math.abs(player.vx) > 1) {
    player.walkPhase += dt * 11;
    player.bob = Math.sin(player.walkPhase) * 3.2;
    player.stretch = 1;
  } else if (!player.onGround) {
    player.walkPhase += dt * 3;
    player.bob = 0;
    player.stretch = 1.08;
  } else {
    player.walkPhase += dt * 2;
    player.bob = Math.sin(player.walkPhase * 0.6) * 1.1;
    player.stretch = 1;
  }

  tickLandSquash(player, dt);
  player.shootCooldown = Math.max(0, player.shootCooldown - dt);
  player.invuln = Math.max(0, player.invuln - dt);
  tickFlashAndMuzzle(player, dt);

  if (shoot && player.shootCooldown <= 0 && player.hp > 0) {
    bullets.spawn({
      x: player.x + player.facing * (player.radius + 10),
      y: player.y - player.height * 0.55,
      vx: PLAYER.bulletSpeed * player.facing,
      vy: 0,
      team: "player",
      damage: PLAYER.bulletDamage,
    });
    player.shootCooldown = PLAYER.fireCooldown;
    player.muzzle = 0.08;
  }
}

export function drawPlayer(ctx, player) {
  if (player.invuln > 0 && Math.floor(player.invuln * 12) % 2 === 0) {
    ctx.globalAlpha = 0.4;
    drawActor(ctx, player);
    ctx.globalAlpha = 1;
    return;
  }
  drawActor(ctx, player);
}
