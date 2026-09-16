import { ColliderBox, ColliderCircle } from "../engine/components/collider";
import { SpriteCircle, SpriteRectangle } from "../engine/components/sprite";
import { World } from "../engine/core/world";
import { V, type Vec2 } from "../engine/math/vector";
import { CollisionSystem } from "../engine/systems/collision-system";
import { PhysicsSystem } from "../engine/systems/physics-system";
import { RenderSystem } from "../engine/systems/render-system";

const TICK_RATE: number = 60;
const TICK_DURATION: number = 1 / TICK_RATE;
const MAX_FRAME_DT: number = 1;

export class Game {
  public playing: boolean;

  private world: World;
  private physicsSystem: PhysicsSystem;
  private collisionSystem: CollisionSystem;
  private renderSystem: RenderSystem;

  private accumulator: number;
  private startTime: number;
  private lastFrameTime: DOMHighResTimeStamp;
  private terminationSignal: number;

  constructor(canvas: HTMLCanvasElement, canvas2DContext: CanvasRenderingContext2D) {
    this.playing = false;

    // World size tied to canvas size (logical pixels)
    this.world = new World(canvas.width, canvas.height, TICK_DURATION);

    // Systems
    this.physicsSystem = new PhysicsSystem(this.world);
    this.collisionSystem = new CollisionSystem(this.world);
    this.renderSystem = new RenderSystem(this.world, canvas2DContext);

    this.accumulator = 0;
    this.startTime = 0;
    this.lastFrameTime = 0;
    this.terminationSignal = 0;
    // Initialize the game world
    this.initGame();
  }

  start(): void {
    this.playing = true;
    // Main loop
    const updateGameFrame = (currentTime: DOMHighResTimeStamp) => {
      this.terminationSignal = requestAnimationFrame(updateGameFrame);
      const dt = Math.min((currentTime - this.lastFrameTime) / 1000, MAX_FRAME_DT);
      this.accumulator += dt;
      this.lastFrameTime = currentTime;

      // todo: understand catch-up mechanism ?
      while (this.accumulator >= TICK_DURATION) {
        this.processGameTick(TICK_DURATION);
        this.accumulator -= TICK_DURATION;
      }
      const realElapsedTime = (this.lastFrameTime - this.startTime) / 1000;
      this.renderSystem.render(dt, realElapsedTime);
    };

    // Start
    requestAnimationFrame((t) => {
      this.lastFrameTime = t;
      updateGameFrame(t);
    });
  }

  addRandomCircles(n: number = 1): void {
    for (let i = 0; i < n; i++) {
      const e = this.world.createEntity();
      this.world.positions.set(e, V.random(this.world.width, this.world.height));
      const DEFAULT_MAX_VEL = 100;
      this.world.velocities.set(
        e,
        V.between(-DEFAULT_MAX_VEL, DEFAULT_MAX_VEL, -DEFAULT_MAX_VEL, DEFAULT_MAX_VEL),
      );

      const size = this.getRandomInt(40, 120);
      this.world.sprites.set(e, new SpriteCircle(size, this.getRandomColor()));
      this.world.colliders.set(e, new ColliderCircle(size));
    }
  }

  clearEntities(): void {
    for (const entity of this.world.entities) {
      this.world.removeEntity(entity);
    }
  }

  pause(): void {
    cancelAnimationFrame(this.terminationSignal);
    this.playing = false;
  }

  tickStep() {
    this.pause();
    const realElapsedTime = (performance.now() - this.startTime) / 1000;
    this.processGameTick(TICK_DURATION);
    this.renderSystem.render(TICK_DURATION, realElapsedTime);
  }

  render() {
    this.renderSystem.render(TICK_DURATION, 0);
  }

  private processGameTick(dt: number) {
    this.physicsSystem.updatePhysics(dt);
    this.collisionSystem.detectCollisions();
    this.physicsSystem.resolveCollisions();
    this.world.tick++;
  }

  private addBorders(): void {
    const thickness = 100;
    const bottomWall = this.world.createEntity();
    const bottomWallPosition: Vec2 = { x: this.world.width / 2, y: this.world.height - 100 };
    this.world.positions.set(bottomWall, bottomWallPosition);
    const bottomWallCollider = new ColliderBox(this.world.width, thickness);
    bottomWallCollider.isStatic = true;
    this.world.colliders.set(bottomWall, bottomWallCollider);
    const bottomWallSprite = new SpriteRectangle(
      this.world.width,
      thickness,
      this.getRandomColor(),
    );
    this.world.sprites.set(bottomWall, bottomWallSprite);
  }

  private initGame(): void {
    this.addBorders();
    this.addRandomCircles(10);
  }

  private COLORS = ["red", "green", "blue", "yellow", "purple", "orange", "cyan", "magenta"];

  private getRandomInt = (lower: number, higher: number): number => {
    return lower + Math.ceil(Math.random() * higher);
  };
  private getRandomColor = (): string => {
    return this.COLORS[Math.floor(Math.random() * this.COLORS.length)];
  };
}
