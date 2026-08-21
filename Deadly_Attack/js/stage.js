import { STAGES } from "./config.js";

export function createStageController() {
  return {
    index: 1,
    spawnedRegular: 0,
    bossSpawned: false,
    spawnTimer: 0.45,

    def() {
      return STAGES[this.index - 1];
    },

    reset(stageNumber) {
      this.index = stageNumber;
      this.spawnedRegular = 0;
      this.bossSpawned = false;
      this.spawnTimer = 0.45;
    },

    next() {
      this.reset(Math.min(50, this.index + 1));
    },

    update(dt, enemies) {
      const def = this.def();
      this.spawnTimer -= dt;

      if (this.spawnTimer <= 0 && this.spawnedRegular < def.regularCount) {
        if (enemies.canSpawn()) {
          const type = def.types[this.spawnedRegular % def.types.length];
          enemies.spawn(type, { stage: this.index, isBoss: false });
          this.spawnedRegular += 1;
          this.spawnTimer = def.spawnInterval;
        }
      }

      if (
        this.spawnedRegular >= def.regularCount &&
        !this.bossSpawned &&
        enemies.liveCount() <= 2
      ) {
        if (enemies.canSpawn()) {
          enemies.spawn(def.miniBossType, { stage: this.index, isBoss: true });
          this.bossSpawned = true;
        }
      }
    },

    isCleared(enemies) {
      const def = this.def();
      return (
        this.spawnedRegular >= def.regularCount &&
        this.bossSpawned &&
        enemies.liveCount() === 0
      );
    },
  };
}
