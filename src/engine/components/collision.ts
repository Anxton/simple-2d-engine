import type { Entity } from "../core/entity";
import type { Vec2 } from "../math/vector";

export type Collision = {
  entityA: Entity;
  entityB: Entity;
  normalAToB: Vec2;
  contactPoint?: Vec2;
  depth?: number;
};
