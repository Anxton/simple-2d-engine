export type Vec2 = { x: number; y: number };

export const V = {
  random: (maxX: number, maxY: number): Vec2 => ({
    x: Math.floor(Math.random() * maxX),
    y: Math.floor(Math.random() * maxY),
  }),
  between: (minX: number, maxX: number, minY: number, maxY: number): Vec2 => ({
    x: Math.floor(Math.random() * (maxX - minX)) + minX,
    y: Math.floor(Math.random() * (maxY - minY)) + minY,
  }),
  abs: (vec: Vec2): Vec2 => ({ x: Math.abs(vec.x), y: Math.abs(vec.y) }),
  add: (a: Vec2, b: Vec2): Vec2 => ({ x: a.x + b.x, y: a.y + b.y }),
  subtract: (a: Vec2, b: Vec2): Vec2 => ({ x: a.x - b.x, y: a.y - b.y }),
  minus: (a: Vec2, b: Vec2): Vec2 => ({ x: a.x - b.x, y: a.y - b.y }),
  scale: (a: Vec2, k: number): Vec2 => ({ x: a.x * k, y: a.y * k }),
  distance: (a: Vec2, b: Vec2): number => Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2),
  flip: (vec: Vec2): Vec2 => V.scale(vec, -1),
  magnitude: (vec: Vec2): number => Math.sqrt(vec.x * vec.x + vec.y * vec.y),
  dot: (a: Vec2, b: Vec2): number => a.x * b.x + a.y * b.y,
  normalize: (vec: Vec2): Vec2 => {
    const mag = V.magnitude(vec);
    if (mag === 0) {
      return { x: 0, y: 0 };
    }
    return { x: vec.x / mag, y: vec.y / mag };
  },
  project: (a: Vec2, b: Vec2): Vec2 => V.scale(b, V.dot(a, b)),
  // b should be a unit vector hehe, idk what happens if it isnt? probably nonsense
  reflect: (a: Vec2, b: Vec2): Vec2 => {
    const projA = V.project(a, b);
    return V.subtract(V.subtract(a, projA), projA);
  },
};
