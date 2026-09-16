import { ColliderBox, ColliderCircle, ColliderType, type Collider } from "../components/collider";
import type { Position } from "../components/position";
import {
  Sprite,
  SpriteCircle,
  SpriteRectangle,
  SpriteKind as SpriteType,
} from "../components/sprite";
import { World } from "../core/world";

const DEBUG: boolean = true;

export class RenderSystem {
  world: World;
  ctx: CanvasRenderingContext2D;

  debugCooldown: number;
  debugDt: number;

  constructor(world: World, ctx: CanvasRenderingContext2D) {
    this.world = world;
    this.ctx = ctx;
    this.debugCooldown = 0;
    this.debugDt = world.tickDuration;
  }

  render = (dt: number, realElapsedTime: number): void => {
    this.clear();
    if (DEBUG) {
      this.renderDebugGrid();
    }
    this.renderEntities();
    this.renderNumberOfEntities();

    if (DEBUG) {
      this.updateDebugInfo(dt);
      this.renderDebugInfo(realElapsedTime);
    }
  };

  /** Clear the canvas */
  private clear = () => {
    this.ctx.clearRect(0, 0, this.world.width, this.world.height);
  };

  /** Write in the center of the canvas the number of entities */
  private renderNumberOfEntities = () => {
    this.ctx.fillStyle = "black";
    this.ctx.font = "200px JetBrainsMono Nerd Font";
    this.ctx.textBaseline = "middle";
    const text = this.world.numberOfEntities.toString();
    const textMetrics = this.ctx.measureText(text);
    // center
    const x = this.world.width / 2 - textMetrics.width / 2;
    const y = this.world.height / 2;
    this.ctx.fillText(text, x, y);
  };

  /** Render all entities */
  private renderEntities() {
    for (const entity of this.world.entities) {
      const pos = this.world.positions.get(entity);
      if (!pos) {
        continue;
      }
      const sprite = this.world.sprites.get(entity);
      if (!sprite) {
        continue;
      }
      this.drawShape(pos, sprite);
    }
    if (DEBUG) {
      for (const entity of this.world.entities) {
        const pos = this.world.positions.get(entity);
        const velocity = this.world.velocities.get(entity);
        const collider = this.world.colliders.get(entity);
        if (!pos) {
          continue;
        }
        this.ctx.strokeStyle = "red";
        this.ctx.strokeRect(pos.x, pos.y, 1, 1);
        this.ctx.fillStyle = "black";
        this.ctx.font = "22px JetBrainsMono Nerd Font";
        // this.ctx.textBaseline = "middle";
        const idText = entity.toString();
        this.ctx.fillText(idText, pos.x - 6, pos.y - 22);
        const posText = `x: ${pos.x.toFixed(2)} | y: ${pos.y.toFixed(2)}`;
        this.ctx.fillText(posText, pos.x, pos.y);
        if (velocity) {
          const velText = `vx: ${velocity.x.toFixed(2)} | vy: ${velocity.y.toFixed(2)}`;
          this.ctx.fillText(velText, pos.x, pos.y + 20);
        }

        if (collider) {
          this.drawCollider(pos, collider);
        }
      }
    }
  }

  private drawShape(pos: Position, sprite: Sprite) {
    switch (sprite.type) {
      case SpriteType.Circle:
        this.drawCircle(pos, sprite as SpriteCircle);
        break;
      case SpriteType.Rectangle:
        this.drawRectangle(pos, sprite as SpriteRectangle);
        break;
      case SpriteType.Image:
        // todo this.drawImage(pos, sprite as Image);
        break;
      default:
        break;
    }
  }

  private drawCollider(pos: Position, collider: Collider) {
    switch (collider.type) {
      case ColliderType.Circle:
        this.drawCircleCollider(pos, collider as ColliderCircle);
        break;
      case ColliderType.Box:
        this.drawBoxCollider(pos, collider as ColliderBox);
        break;
      case ColliderType.Polygon:
        // todo
        break;
      default:
        break;
    }
  }

  private drawCircle(pos: Position, circle: SpriteCircle) {
    this.ctx.fillStyle = circle.color;
    this.ctx.beginPath();
    this.ctx.arc(pos.x, pos.y, circle.radius, 0, Math.PI * 2);
    this.ctx.fill();
  }

  private drawRectangle(pos: Position, rect: SpriteRectangle) {
    this.ctx.fillStyle = rect.color;
    this.ctx.fillRect(pos.x - rect.width / 2, pos.y - rect.height / 2, rect.width, rect.height);
  }

  private drawCircleCollider(pos: Position, collider: ColliderCircle) {
    this.ctx.strokeStyle = "red";
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.arc(pos.x, pos.y, collider.radius, 0, Math.PI * 2);
    this.ctx.stroke();
  }

  private drawBoxCollider(pos: Position, collider: ColliderBox) {
    this.ctx.strokeStyle = "red";
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.strokeRect(
      pos.x - collider.width / 2,
      pos.y - collider.height / 2,
      collider.width,
      collider.height,
    );
  }

  private updateDebugInfo(dt: number): void {
    this.debugCooldown -= dt;
    if (this.debugCooldown <= 0) {
      this.debugDt = dt;
      this.debugCooldown = 1;
    }
  }

  private renderDebugInfo(realElapsedTime: number): void {
    this.ctx.fillStyle = "black";
    this.ctx.font = "26px JetBrainsMono Nerd Font";
    this.ctx.textBaseline = "top";

    const debugInfo = [
      `FPS: ${(1 / this.debugDt).toFixed(2)}`,
      `dt: ${this.debugDt.toFixed(4)}`,
      `Real time: ${realElapsedTime.toFixed(2)}s`,
      `World time: ${this.world.elapsedTime.toFixed(2)}s`,
      `Tick: ${this.world.tick}`,
      `Tick duration: ${this.world.tickDuration}`,
      `Entities: [${this.world.entities}]`,
      `Collisions: [${this.world.collisions.map((c) => `(${c.entityA}, ${c.entityB})`)}]`,
    ];
    for (let i = 0; i < debugInfo.length; i++) {
      this.ctx.fillText(debugInfo[i], 10, 10 + i * 26);
    }
  }

  private renderDebugGrid(): void {
    this.ctx.strokeStyle = "grey";
    this.ctx.lineWidth = 1;
    this.ctx.lineJoin = "round";
    // left-to-right, draw vertical lines
    for (let i = 0; i < this.world.width; i += 100) {
      this.ctx.beginPath();
      this.ctx.moveTo(i, 0);
      this.ctx.lineTo(i, this.world.height);
      this.ctx.stroke();
    }
    // up-to-down, draw horizontal lines
    for (let i = 100; i < this.world.height; i += 100) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, i);
      this.ctx.lineTo(this.world.width, i);
      this.ctx.stroke();
    }
  }
}
