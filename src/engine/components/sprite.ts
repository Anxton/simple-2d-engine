export const SpriteKind = {
  Rectangle: 0,
  Circle: 1,
  Image: 2,
} as const;

export type SpriteKind = (typeof SpriteKind)[keyof typeof SpriteKind];

export abstract class Sprite {
  type: SpriteKind;

  constructor(kind: SpriteKind) {
    this.type = kind;
  }
}

export class SpriteRectangle extends Sprite {
  width: number;
  height: number;
  color: string;

  constructor(width: number, height: number, color: string = "black") {
    super(SpriteKind.Rectangle);

    if (width <= 0 || height <= 0) {
      throw new Error("SpriteRectangle width and height must be positive");
    }
    this.width = width;
    this.height = height;
    this.color = color;
  }
}

export class SpriteCircle extends Sprite {
  radius: number;
  color: string;

  constructor(radius: number, color: string = "black") {
    super(SpriteKind.Circle);

    if (radius <= 0) {
      throw new Error("SpriteCircle radius must be positive");
    }
    this.radius = radius;
    this.color = color;
  }
}

export class SpriteImage extends Sprite {
  src: string;
  width: number;
  height: number;

  constructor(src: string, width: number, height: number) {
    super(SpriteKind.Image);

    if (width <= 0 || height <= 0) {
      throw new Error("SpriteImage width and height must be positive");
    }
    this.src = src;
    this.width = width;
    this.height = height;
  }
}
