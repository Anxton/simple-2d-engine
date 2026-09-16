import { ColliderBox, ColliderCircle, ColliderType } from "../components/collider";
import type { Collision } from "../components/collision";
import type { Position } from "../components/position";
import type { Entity } from "../core/entity";
import { World } from "../core/world";
import { V } from "../math/vector";

export class CollisionSystem {
  world: World;

  constructor(world: World) {
    this.world = world;
  }

  detectCollisions() {
    this.world.collisions.length = 0;
    const entities = this.world.entities;

    // TODO: divide world into chunks
    // TODO: only iterate through colliders
    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) {
        const entityA = entities[i];
        const entityB = entities[j];
        const collision: Collision | null = this.checkCollision(entityA, entityB);
        if (collision) {
          this.world.collisions.push(collision);
        }
      }
    }
  }

  private checkCollision(entityA: Entity, entityB: Entity): Collision | null {
    const colliderA = this.world.colliders.get(entityA);
    const colliderB = this.world.colliders.get(entityB);
    const posA = this.world.positions.get(entityA);
    const posB = this.world.positions.get(entityB);

    if (!colliderA || !colliderB || !posA || !posB || (colliderA.isStatic && colliderB.isStatic)) {
      return null;
    }

    switch (colliderA.type) {
      case ColliderType.Circle:
        switch (colliderB.type) {
          case ColliderType.Circle:
            return this.checkCircleToCircleCollision(
              entityA,
              posA,
              colliderA as ColliderCircle,
              entityB,
              posB,
              colliderB as ColliderCircle,
            );
          case ColliderType.Box:
            return this.checkBoxToCircleCollision(
              entityB,
              posB,
              colliderB as ColliderBox,
              entityA,
              posA,
              colliderA as ColliderCircle,
            );

          default:
            return null;
        }

      case ColliderType.Box:
        switch (colliderB.type) {
          case ColliderType.Box:
            return this.checkBoxToBoxCollision(
              entityA,
              posA,
              colliderA as ColliderBox,
              entityB,
              posB,
              colliderB as ColliderBox,
            );

          case ColliderType.Circle:
            return this.checkBoxToCircleCollision(
              entityA,
              posA,
              colliderA as ColliderBox,
              entityB,
              posB,
              colliderB as ColliderCircle,
            );

          default:
            return null;
        }

      default:
        return null;
    }
  }

  private checkBoxToCircleCollision(
    entityA: Entity,
    posA: Position,
    colA: ColliderBox,
    entityB: Entity,
    posB: Position,
    colB: ColliderCircle,
  ): Collision | null {
    const absVecDist = V.abs(V.subtract(posB, posA));
    if (
      absVecDist.x - colA.width / 2 - colB.radius <= 0 &&
      absVecDist.y - colA.height / 2 - colB.radius <= 0
    ) {
      const penetrationDepth = colA.height / 2 + colB.radius - absVecDist.y;
      return {
        entityA,
        entityB,
        normalAToB: {
          x: 0,
          // TODO: normal thats not only up or down
          y: -1,
          // V.dot(V.subtract(posB, posA), { x: 0, y: 1 }) > 0 ? 1 : -1,
        },
        depth: penetrationDepth,
      };
    }

    return null;
  }

  private checkCircleToCircleCollision(
    entityA: Entity,
    posA: Position,
    colA: ColliderCircle,
    entityB: Entity,
    posB: Position,
    colB: ColliderCircle,
  ): Collision | null {
    // if circle centers are closer than the sum of their radii, they are colliding
    if (V.distance(posA, posB) <= colA.radius + colB.radius) {
      const penetrationDepth = colA.radius + colB.radius - V.distance(posA, posB);
      const normal = V.normalize(V.subtract(posB, posA));
      console.log(
        `circle collision:\n  A: ${entityA}, B: ${entityB}\n  normal A to B: ${normal.x.toFixed(2)}, ${normal.y.toFixed(2)}\n  penetration: ${penetrationDepth.toFixed(2)}`,
      );
      return {
        entityA,
        entityB,
        normalAToB: normal,
        // depth is how much the radii "stick out" of the distance between the centers
        depth: penetrationDepth,
      };
    }

    return null;
  }

  private checkBoxToBoxCollision(
    entityA: Entity,
    posA: Position,
    colA: ColliderBox,
    entityB: Entity,
    posB: Position,
    colB: ColliderBox,
  ): Collision | null {
    return null;
  }
}
