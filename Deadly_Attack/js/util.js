export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function shadeHex(hex, amount) {
  const raw = hex.replace("#", "");
  const full =
    raw.length === 3
      ? raw
          .split("")
          .map((ch) => ch + ch)
          .join("")
      : raw;
  const n = parseInt(full, 16);
  const r = clamp((n >> 16) + amount, 0, 255);
  const g = clamp(((n >> 8) & 255) + amount, 0, 255);
  const b = clamp((n & 255) + amount, 0, 255);
  return `rgb(${r},${g},${b})`;
}

export function mixTowardWhite(hex, t) {
  const raw = hex.replace("#", "");
  const full =
    raw.length === 3
      ? raw
          .split("")
          .map((ch) => ch + ch)
          .join("")
      : raw;
  const n = parseInt(full, 16);
  const r = (n >> 16) + (255 - (n >> 16)) * t;
  const g = ((n >> 8) & 255) + (255 - ((n >> 8) & 255)) * t;
  const b = (n & 255) + (255 - (n & 255)) * t;
  return `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
}

export function cylindersOverlap(a, b) {
  return (
    a.x - a.radius < b.x + b.radius &&
    a.x + a.radius > b.x - b.radius &&
    a.y - a.height < b.y &&
    a.y > b.y - b.height
  );
}

export function circleHitsCylinder(cx, cy, cr, body) {
  const nx = clamp(cx, body.x - body.radius, body.x + body.radius);
  const ny = clamp(cy, body.y - body.height, body.y);
  const dx = cx - nx;
  const dy = cy - ny;
  return dx * dx + dy * dy <= cr * cr;
}
