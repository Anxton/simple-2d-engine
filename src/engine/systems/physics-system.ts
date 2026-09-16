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
      this.applyGravity(dt, e);
    }
  }

  resolveCollisions(): void {
    this.world.collisions.forEach((collision: Collision) => {
      const normalAToB = collision.normalAToB;
      const posA = this.world.positions.get(collision.entityA)!;
      const velA = this.world.velocities.get(collision.entityA)!;
      const isStaticA = this.world.colliders.get(collision.entityA)?.isStatic;
      const posB = this.world.positions.get(collision.entityB)!;
      const velB = this.world.velocities.get(collision.entityB)!;
      const isStaticB = this.world.colliders.get(collision.entityB)?.isStatic;

      if (!isStaticA) {
        // uncram the entities by moving them apart along the collision normal
        posA.x -= (normalAToB.x * collision.depth!) / (isStaticB ? 1 : 2);
        posA.y -= (normalAToB.y * collision.depth!) / (isStaticB ? 1 : 2);
        // FIXME: balls bounce higher and higher on the ground
        const updatedVelA = V.reflect(velA, V.flip(normalAToB));
        this.world.velocities.set(collision.entityA, updatedVelA);
      }
      if (!isStaticB) {
        // uncram the entities by moving them apart along the collision normal
        posB.x += (normalAToB.x * collision.depth!) / (isStaticA ? 1 : 2);
        posB.y += (normalAToB.y * collision.depth!) / (isStaticA ? 1 : 2);
        // FIXME: balls bounce higher and higher on the ground
        const updatedVelB = V.reflect(velB, normalAToB);
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
    if (this.world.draggedEntity === entity) {
      return;
    }
    const vel = this.world.velocities.get(entity);
    if (vel) {
      this.world.velocities.set(entity, { x: vel.x, y: vel.y + this.gravity * dt });
    }
  }
}
