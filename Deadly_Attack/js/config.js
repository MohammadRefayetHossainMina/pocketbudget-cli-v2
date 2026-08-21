/** Stage tables, enemy types, biome palettes, and scaling. Art later; color/size only. */

export const CANVAS_WIDTH = 960;
export const CANVAS_HEIGHT = 540;
export const GROUND_HEIGHT = 72;
export const GROUND_Y = CANVAS_HEIGHT - GROUND_HEIGHT;
export const STAGE_COUNT = 50;

export const COLORS = {
  player: "#3d8bfd",
  thug: "#e67e22",
  biker: "#f1c40f",
  drone: "#1abc9c",
  cyborg: "#e84393",
  elite: "#e74c3c",
  mecha: "#5d6d7e",
  kingpin: "#ffd54a",
};

export const PLAYER = {
  radius: 16,
  height: 46,
  color: COLORS.player,
  speed: 230,
  jumpForce: 430,
  gravity: 1150,
  maxHp: 100,
  fireCooldown: 0.22,
  invulnTime: 0.85,
  bulletSpeed: 520,
  bulletDamage: 14,
  name: "Ayan",
};

export const LIMITS = {
  maxEnemies: 14,
  maxBullets: 48,
  maxDt: 1 / 30,
};

export const BOSS_SIZE_MULT = 1.8;
export const BOSS_HP_MULT = 4.2;
export const HP_SCALE = 0.12;
export const SPEED_SCALE = 0.028;
export const DAMAGE_SCALE = 0.04;

export const ENEMY_TYPES = {
  thug: {
    id: "thug",
    name: "Street Thug",
    color: COLORS.thug,
    radius: 16,
    height: 44,
    speed: 72,
    hp: 28,
    damage: 8,
    score: 10,
    flying: false,
    ranged: false,
    fireCooldown: 0,
  },
  biker: {
    id: "biker",
    name: "Slide-Runner",
    color: COLORS.biker,
    radius: 15,
    height: 40,
    speed: 150,
    hp: 24,
    damage: 10,
    score: 15,
    flying: false,
    ranged: false,
    fireCooldown: 0,
  },
  drone: {
    id: "drone",
    name: "Hunter Drone",
    color: COLORS.drone,
    radius: 14,
    height: 28,
    speed: 118,
    hp: 20,
    damage: 8,
    score: 20,
    flying: true,
    ranged: false,
    fireCooldown: 0,
  },
  cyborg: {
    id: "cyborg",
    name: "Lab Cyborg",
    color: COLORS.cyborg,
    radius: 18,
    height: 50,
    speed: 88,
    hp: 55,
    damage: 14,
    score: 25,
    flying: false,
    ranged: true,
    fireCooldown: 1.65,
  },
  elite: {
    id: "elite",
    name: "Elite Guard",
    color: COLORS.elite,
    radius: 17,
    height: 48,
    speed: 102,
    hp: 70,
    damage: 16,
    score: 35,
    flying: false,
    ranged: true,
    fireCooldown: 1.35,
  },
  mecha: {
    id: "mecha",
    name: "Mecha-Suit",
    color: COLORS.mecha,
    radius: 22,
    height: 68,
    speed: 58,
    hp: 120,
    damage: 22,
    score: 50,
    flying: false,
    ranged: true,
    fireCooldown: 1.85,
  },
  kingpin: {
    id: "kingpin",
    name: "The Kingpin",
    color: COLORS.kingpin,
    radius: 30,
    height: 86,
    speed: 52,
    hp: 420,
    damage: 28,
    score: 500,
    flying: false,
    ranged: true,
    fireCooldown: 1.05,
  },
};

export const TYPE_LEGEND = [
  { id: "player", label: "Ayan", color: COLORS.player },
  { id: "thug", label: "Thug", color: COLORS.thug },
  { id: "biker", label: "Biker", color: COLORS.biker },
  { id: "drone", label: "Drone", color: COLORS.drone },
  { id: "cyborg", label: "Cyborg", color: COLORS.cyborg },
  { id: "elite", label: "Elite", color: COLORS.elite },
  { id: "mecha", label: "Mecha", color: COLORS.mecha },
  { id: "kingpin", label: "Kingpin", color: COLORS.kingpin },
];

export const BIOMES = {
  slums: {
    id: "slums",
    name: "The Slums & Backalleys",
    sky: ["#140c1c", "#3a1d3a", "#1a1020"],
    building: "#241428",
    building2: "#1a0e1c",
    window: "#ffb347",
    street: "#161218",
    accent: "#ff6b35",
    fog: "rgba(80, 30, 50, 0.18)",
  },
  subway: {
    id: "subway",
    name: "The Abandoned Subway",
    sky: ["#0a1218", "#102028", "#0c141c"],
    building: "#152028",
    building2: "#0e181e",
    window: "#3ec6ff",
    street: "#101418",
    accent: "#1abc9c",
    fog: "rgba(20, 50, 60, 0.22)",
  },
  labs: {
    id: "labs",
    name: "Cyber-Laboratories",
    sky: ["#06140e", "#0c2418", "#081810"],
    building: "#0e2218",
    building2: "#0a1a12",
    window: "#39ff9a",
    street: "#0c1410",
    accent: "#e84393",
    fog: "rgba(20, 80, 50, 0.16)",
  },
  skyscraper: {
    id: "skyscraper",
    name: "The Neon Skyscraper",
    sky: ["#0a1028", "#1a2050", "#101838"],
    building: "#141a38",
    building2: "#0e1230",
    window: "#7ec8ff",
    street: "#101428",
    accent: "#e74c3c",
    fog: "rgba(30, 40, 90, 0.2)",
  },
  penthouse: {
    id: "penthouse",
    name: "The Penthouse & Bunker",
    sky: ["#120e0a", "#2a1c0c", "#18100a"],
    building: "#22180e",
    building2: "#18120c",
    window: "#ffd54a",
    street: "#140e0a",
    accent: "#ffd54a",
    fog: "rgba(60, 40, 10, 0.2)",
  },
};

export function biomeIdFor(stage) {
  if (stage <= 10) return "slums";
  if (stage <= 20) return "subway";
  if (stage <= 30) return "labs";
  if (stage <= 40) return "skyscraper";
  return "penthouse";
}

export function biomeFor(stage) {
  return BIOMES[biomeIdFor(stage)];
}

export function scaleStat(base, stage, perStage) {
  return base * (1 + perStage * (stage - 1));
}

export function scaledEnemyStats(typeId, stage, isBoss) {
  const t = ENEMY_TYPES[typeId];
  let hp = scaleStat(t.hp, stage, HP_SCALE);
  let speed = Math.min(scaleStat(t.speed, stage, SPEED_SCALE), t.speed * 2.1);
  let radius = t.radius;
  let height = t.height;
  let damage = scaleStat(t.damage, stage, DAMAGE_SCALE);

  if (isBoss) {
    if (typeId === "kingpin") {
      radius *= 1.25;
      height *= 1.15;
      hp *= 1.2;
      damage *= 1.4;
    } else {
      radius *= BOSS_SIZE_MULT;
      height *= BOSS_SIZE_MULT;
      hp *= BOSS_HP_MULT;
      damage *= 1.6;
    }
  }

  return {
    ...t,
    hp: Math.round(hp),
    speed,
    radius,
    height,
    damage: Math.round(damage),
    score: t.score * (isBoss ? 5 : 1) + stage,
  };
}

export function typesForStage(stage) {
  if (stage <= 4) return ["thug"];
  if (stage <= 10) return ["thug"];
  if (stage <= 15) return ["thug", "biker"];
  if (stage <= 20) return ["biker", "drone"];
  if (stage <= 25) return ["cyborg"];
  if (stage <= 30) return ["cyborg", "drone"];
  if (stage <= 35) return ["elite"];
  if (stage <= 40) return ["elite", "cyborg"];
  if (stage <= 45) return ["elite", "mecha"];
  if (stage <= 49) return ["mecha"];
  return ["elite"];
}

export function miniBossType(stage) {
  if (stage === 50) return "kingpin";
  if (stage <= 10) return "thug";
  if (stage <= 15) return "biker";
  if (stage <= 20) return "drone";
  if (stage <= 30) return "cyborg";
  if (stage <= 40) return "elite";
  return "mecha";
}

export function regularCount(stage) {
  if (stage === 50) return 4;
  return Math.min(6 + Math.floor((stage - 1) / 2), 14);
}

export function spawnInterval(stage) {
  return Math.max(0.42, 1.35 - stage * 0.016);
}

function buildStages() {
  const stages = [];
  for (let i = 1; i <= STAGE_COUNT; i += 1) {
    stages.push({
      id: i,
      biome: biomeIdFor(i),
      biomeName: biomeFor(i).name,
      types: typesForStage(i),
      regularCount: regularCount(i),
      spawnInterval: spawnInterval(i),
      miniBossType: miniBossType(i),
    });
  }
  return stages;
}

export const STAGES = buildStages();
