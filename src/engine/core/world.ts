import { Collider } from "../components/collider";
import type { Collision } from "../components/collision";
import type { Position } from "../components/position";
import { Sprite } from "../components/sprite";
import type { Velocity } from "../components/velocity";
import { ComponentStore } from "./component-store";
import type { Entity } from "./entity";

export class World {
  width: number;
  height: number;

  private _entities: Entity[];
  collisions: Collision[];
  positions: ComponentStore<Position>;
  velocities: ComponentStore<Velocity>;
  colliders: ComponentStore<Collider>;
  sprites: ComponentStore<Sprite>;
  stores: ComponentStore<any>[];

  tick: number;
  tickDuration: number;

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
