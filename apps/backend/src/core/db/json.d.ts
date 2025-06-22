import type { Vector2 } from '@libs/utils';

declare global {
  namespace PrismaJson {
    type Vector2Db = Vector2;
    type Vector2ArrayDb = Vector2[];
  }
}
