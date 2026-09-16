import type { Vec2 } from "../math/vector";

export const ColliderType = {
  Box: 0,
  Circle: 1,
  Polygon: 2,
} as const;

export type ColliderType = (typeof ColliderType)[keyof typeof ColliderType];

export abstract class Collider {
  type: ColliderType;
  isStatic: boolean;

  constructor(type: ColliderType, isStatic: boolean = false) {
    this.type = type;
    this.isStatic = isStatic;
  }
}

export class ColliderBox extends Collider {
  width: number;
  height: number;

  constructor(width: number, height: number) {
    super(ColliderType.Box);

    if (width <= 0 || height <= 0) {
      throw new Error("ColliderBox width and height must be positive");
    }
    this.width = width;
    this.height = height;
  }
}

export class ColliderCircle extends Collider {
  radius: number;

  constructor(radius: number) {
    super(ColliderType.Circle);

    if (radius <= 0) {
      throw new Error("ColliderCircle radius must be positive");
    }
    this.radius = radius;
  }
}

export class ColliderPolygon extends Collider {
  points: Vec2[];

  constructor(points: Vec2[]) {
    super(ColliderType.Polygon);

    if (points.length < 3) {
      throw new Error("ColliderPolygon must have at least 3 points");
    }
    this.points = points;
  }
}
