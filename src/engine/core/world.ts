import { Collider } from "../components/collider";
import type { Collision } from "../components/collision";
import type { Position } from "../components/position";
import { Sprite } from "../components/sprite";
import type { Velocity } from "../components/velocity";
import type { Vec2 } from "../math/vector";
import { ComponentStore } from "./component-store";
import type { Entity } from "./entity";

export class World {
  width: number;
  height: number;

  // data
  private _entities: Entity[];
  collisions: Collision[];
  positions: ComponentStore<Position>;
  velocities: ComponentStore<Velocity>;
  colliders: ComponentStore<Collider>;
  sprites: ComponentStore<Sprite>;
  stores: ComponentStore<any>[];

  // tick
  tick: number;
  tickDuration: number;

  // mouse stuff
  mouse: Vec2;
  mouseClicked: boolean;
  draggedEntity: Entity | null;
  vecBetweenDraggedAndMouse: Vec2;
  constructor(width: number, height: number, tickDuration: number) {
    this.width = width;
    this.height = height;

    this._entities = [];
    this.collisions = [];
    this.positions = new ComponentStore<Position>();
    this.velocities = new ComponentStore<Velocity>();
    this.colliders = new ComponentStore<Collider>();
    this.sprites = new ComponentStore<Sprite>();
    this.stores = [this.positions, this.velocities, this.colliders, this.sprites];

    this.tick = 0;
    this.tickDuration = tickDuration;

    // mouse stuff
    this.mouse = { x: width / 2, y: height / 2 };
    this.mouseClicked = false;
    this.draggedEntity = null;
    this.vecBetweenDraggedAndMouse = { x: 0, y: 0 };

    addEventListener("mousemove", (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });
    addEventListener("mousedown", () => (this.mouseClicked = true));
    addEventListener("mouseup", () => (this.mouseClicked = false));
  }

  createEntity = (): number => {
    const id = Math.max(...this._entities, 0) + 1;
    this._entities.push(id);
    return id;
  };

  removeEntity = (entity: Entity): void => {
    this.stores.forEach((store) => store.remove(entity));
    this._entities = this._entities.filter((ent) => ent !== entity);
    this.collisions = this.collisions.filter(
      ({ entityA, entityB }) => entity !== entityA && entity !== entityB,
    );
  };

  get numberOfEntities(): number {
    return this._entities.length;
  }

  /**
   * Get a copy of the entities array
   * @return array of entities
   */
  get entities(): Entity[] {
    return [...this._entities];
  }

  get elapsedTime(): number {
    return this.tick * this.tickDuration;
  }
}
