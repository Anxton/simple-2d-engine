import type { Entity } from "./entity";

export class ComponentStore<T> {
  private store: Map<Entity, T> = new Map();

  has(entity: Entity): boolean {
    return this.store.has(entity);
  }

  get(entity: Entity): T | undefined {
    return this.store.get(entity);
  }

  set(entity: Entity, component: T): void {
    this.store.set(entity, component);
  }

  remove(entity: Entity): boolean {
    return this.store.delete(entity);
  }

  entries(): Array<[Entity, T]> {
    return Array.from(this.store.entries());
  }
}
