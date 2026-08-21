import { tickBossPulse, tickFlashAndMuzzle, tickHoverBob, tickWalkBob } from "./animation.js";
import {
  CANVAS_WIDTH,
  GROUND_Y,
  LIMITS,
  PLAYER,
  scaledEnemyStats,
} from "./config.js";
import { drawActor } from "./draw.js";
import { hurtPlayer } from "./player.js";
import { circleHitsCylinder, cylindersOverlap } from "./util.js";

function makeEnemy() {
  return {
    active: false,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    radius: 16,
    height: 44,
    color: "#e67e22",
    hp: 1,
    maxHp: 1,
    speed: 70,
    damage: 8,
    score: 10,
    flying: false,
    ranged: false,
    fireCooldown: 1,
    fireTimer: 0,
    facing: -1,
    onGround: true,
    walkPhase: 0,
    flash: 0,
    bob: 0,
    pulse: 1,
    squash: 1,
    stretch: 1,
    muzzle: 0,
    isBoss: false,
    typeId: "thug",
    age: 0,
    _chaseSpeed: 0,
  };
}

export function createEnemyManager() {
  const pool = Array.from({ length: LIMITS.maxEnemies }, makeEnemy);

  function live() {
    return pool.filter((enemy) => enemy.active);
  }

  return {
    canSpawn() {
      return pool.some((enemy) => !enemy.active);
    },
    liveCount() {
      return pool.reduce((n, enemy) => n + (enemy.active ? 1 : 0), 0);
    },
    hasBoss() {
      return pool.some((enemy) => enemy.active && enemy.isBoss);
    },
    spawn(typeId, { stage, isBoss }) {
      const slot = pool.find((enemy) => !enemy.active);
      if (!slot) {
        return null;
      }
      const stats = scaledEnemyStats(typeId, stage, isBoss);
      slot.active = true;
      slot.typeId = typeId;
      slot.isBoss = isBoss;
      slot.radius = stats.radius;
      slot.height = stats.height;
      slot.color = stats.color;
      slot.hp = stats.hp;
      slot.maxHp = stats.hp;
      slot.speed = stats.speed;
      slot.damage = stats.damage;
      slot.score = stats.score;
      slot.flying = stats.flying;
      slot.ranged = stats.ranged;
      slot.fireCooldown = stats.fireCooldown;
      slot.fireTimer = isBoss ? 0.6 : 0.4 + Math.random() * 0.8;
      slot.x = CANVAS_WIDTH + slot.radius + 8;
      slot.y = slot.flying ? GROUND_Y - 120 : GROUND_Y;
      slot.vx = 0;
      slot.vy = 0;
      slot.facing = -1;
      slot.onGround = !slot.flying;
      slot.walkPhase = Math.random() * Math.PI * 2;
      slot.flash = 0;
      slot.bob = 0;
      slot.pulse = 1;
      slot.squash = 1;
      slot.stretch = 1;
      slot.muzzle = 0;
      slot.age = 0;
      slot._chaseSpeed = stats.speed;
      return slot;
    },
    update(dt, player, bullets) {
      let scoreGain = 0;
      for (const enemy of pool) {
        if (!enemy.active) {
          continue;
        }
        tickBossPulse(enemy, dt);
        const dx = player.x - enemy.x;
        const dir = dx === 0 ? -1 : Math.sign(dx);
        enemy.facing = dir;
        enemy.vx = dir * enemy.speed;

        if (enemy.flying) {
          const hoverY = GROUND_Y - 108 - Math.sin(enemy.age * 2.4) * 16;
          const targetY = Math.abs(dx) < 170 ? player.y - enemy.height * 0.35 : hoverY;
          enemy.y += (targetY - enemy.y) * Math.min(1, dt * 2.8);
          enemy.x += enemy.vx * dt;
          enemy.onGround = false;
          tickHoverBob(enemy, dt);
        } else {
          enemy.x += enemy.vx * dt;
          enemy.vy += PLAYER.gravity * dt;
          enemy.y += enemy.vy * dt;
          if (enemy.y >= GROUND_Y) {
            enemy.y = GROUND_Y;
            enemy.vy = 0;
            enemy.onGround = true;
          }
          tickWalkBob(enemy, dt, enemy.speed / 16, 2.4);
        }

        tickFlashAndMuzzle(enemy, dt);
        enemy.x = Math.max(enemy.radius + 4, Math.min(CANVAS_WIDTH - 8, enemy.x));

        if (enemy.ranged) {
          enemy.fireTimer -= dt;
          if (enemy.fireTimer <= 0 && Math.abs(dx) < 540 && player.hp > 0) {
            bullets.spawn({
              x: enemy.x + enemy.facing * (enemy.radius + 6),
              y: enemy.y - enemy.height * 0.55,
              vx: enemy.facing * (enemy.isBoss ? 320 : 260),
              vy: 0,
              team: "enemy",
              damage: Math.max(6, Math.round(enemy.damage * 0.65)),
            });
            enemy.fireTimer = enemy.fireCooldown;
            enemy.muzzle = 0.08;
          }
        }

        if (player.hp > 0 && cylindersOverlap(enemy, player)) {
          hurtPlayer(player, enemy.damage);
        }
      }

      bullets.eachActive((bullet) => {
        if (!bullet.active) {
          return;
        }
        if (bullet.team === "player") {
          for (const enemy of pool) {
            if (!enemy.active) {
              continue;
            }
            if (circleHitsCylinder(bullet.x, bullet.y, bullet.radius, enemy)) {
              bullet.active = false;
              enemy.hp -= bullet.damage;
              enemy.flash = 0.12;
              if (enemy.hp <= 0) {
                enemy.active = false;
                scoreGain += enemy.score;
              }
              break;
            }
          }
        } else if (player.hp > 0 && circleHitsCylinder(bullet.x, bullet.y, bullet.radius, player)) {
          bullet.active = false;
          hurtPlayer(player, bullet.damage);
        }
      });

      return scoreGain;
    },
    draw(ctx) {
      const ordered = live().sort((a, b) => a.y - b.y);
      for (const enemy of ordered) {
        drawActor(ctx, enemy);
      }
    },
    clear() {
      for (const enemy of pool) {
        enemy.active = false;
      }
    },
  };
}
