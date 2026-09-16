import type { Entity } from "../core/entity";
import type { World } from "../core/world";
import { V, type Vec2 } from "../math/vector";

export class MouseSystem {
  world: World;

  prevMouseClicked: boolean;

  constructor(world: World) {
    this.world = world;
    this.prevMouseClicked = false;
  }

  handleMouse() {
    // console.log(this.prevMouseClicked);
    if (this.world.mouseClicked) {
      // first tick where mouse clicks
      if (!this.prevMouseClicked) {
        const closestEntitiesToMouse: Array<[Entity, Vec2]> = this.world.positions
          .entries()
          .toSorted(
            ([, pos1], [, pos2]) =>
              V.distance(this.world.mouse, pos1) - V.distance(this.world.mouse, pos2),
          );
        const closestEntityToMouse: [Entity, Vec2] = closestEntitiesToMouse[0];
        // set draggedEntity to be the closest entity
        this.world.draggedEntity = closestEntityToMouse[0];
        this.world.vecBetweenDraggedAndMouse = V.subtract(
          closestEntityToMouse[1],
          this.world.mouse,
        );
      }
      this.prevMouseClicked = true;
      if (!this.world.draggedEntity) {
        return;
      }
      // dragging
      const newPos = V.add(this.world.mouse, this.world.vecBetweenDraggedAndMouse);
      this.world.positions.set(this.world.draggedEntity, newPos);
      if (!this.world.velocities.has(this.world.draggedEntity)) {
        return;
      }
      this.world.velocities.set(this.world.draggedEntity, { x: 0, y: 0 });
    } else {
      this.world.draggedEntity = null;
      this.prevMouseClicked = false;
    }
  }
}
