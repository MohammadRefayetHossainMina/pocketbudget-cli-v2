const TRACKED = new Set([
  "KeyA",
  "KeyD",
  "KeyW",
  "KeyS",
  "KeyK",
  "Space",
  "Enter",
  "KeyR",
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
]);

export function createInput() {
  const held = new Set();
  const pressed = new Set();

  window.addEventListener("keydown", (event) => {
    if (TRACKED.has(event.code)) {
      event.preventDefault();
    }
    if (!held.has(event.code)) {
      pressed.add(event.code);
    }
    held.add(event.code);
  });

  window.addEventListener("keyup", (event) => {
    held.delete(event.code);
  });

  window.addEventListener("blur", () => {
    held.clear();
    pressed.clear();
  });

  return {
    down(code) {
      return held.has(code);
    },
    pressed(code) {
      return pressed.has(code);
    },
    endFrame() {
      pressed.clear();
    },
  };
}
