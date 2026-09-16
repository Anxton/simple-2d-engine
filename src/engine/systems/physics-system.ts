import type { Collision } from "../components/collision";
import type { Entity } from "../core/entity";
import { World } from "../core/world";
import { V, type Vec2 } from "../math/vector";
import { isOOB } from "../utils/oob-utils";

const defaultGravity = 800;

export class PhysicsSystem {
  world: World;

  gravity: number;

  constructor(world: World) {
    this.world = world;
    this.gravity = defaultGravity;
  }

  updatePhysics(dt: number) {
    for (const [e, pos] of this.world.positions.entries()) {
      this.move(dt, e, pos);
      this.destroyEntityIfOutOfBounds(e, pos);
      // gravity
      this.applyGravity(dt, e);
    }
  }

  resolveCollisions(): void {
    this.world.collisions.forEach((collision: Collision) => {
      const normal = collision.normalAToB;
      const posA = this.world.positions.get(collision.entityA)!;
      const velA = this.world.velocities.get(collision.entityA)!;
      const posB = this.world.positions.get(collision.entityB)!;
      const velB = this.world.velocities.get(collision.entityB)!;

      if (!this.world.colliders.get(collision.entityA)?.isStatic) {
        // unstuck the entities by moving them apart along the collision normal
        // todo remove / 2 only if the other is static
        posA.x -= (normal.x * collision.depth!) / 2;
        posA.y -= (normal.y * collision.depth!) / 2;
        // todo: reflect velocity vector according to normal
        // fixme : balls bounce higher and higher on the ground : substract magnitude gained ?
        const updatedVelA = V.scale(V.flip(normal), V.magnitude(velA));
        this.world.velocities.set(collision.entityA, updatedVelA);
      }
      if (!this.world.colliders.get(collision.entityB)?.isStatic) {
        // unstuck the entities by moving them apart along the collision normal
        posB.x += (normal.x * collision.depth!) / 2;
        posB.y += (normal.y * collision.depth!) / 2;
        // todo: reflect
        // fixme : balls bounce higher and higher on the ground
        const updatedVelB = V.scale(normal, V.magnitude(velB));
        this.world.velocities.set(collision.entityB, updatedVelB);
      }
    });
  }

  private move(dt: number, entity: Entity, pos: Vec2) {
    const velocity = this.world.velocities.get(entity);
    if (velocity) {
      pos.x += velocity.x * dt;
      pos.y += velocity.y * dt;
    }
  }

  private destroyEntityIfOutOfBounds(entity: number, pos: Vec2) {
    const collider = this.world.colliders.get(entity);
    if (collider && isOOB(pos, collider, this.world)) {
      this.world.removeEntity(entity);
    }
  }
  private applyGravity(dt: number, entity: number) {
    const vel = this.world.velocities.get(entity);
    if (vel) {
      this.world.velocities.set(entity, { x: vel.x, y: vel.y + this.gravity * dt });
    }
  }
}
