///<reference path="models.ts"/>
///<reference path="../textures/textures.ts"/>

const WALL_PART_ID_BODY = 0;

const WALL_COLOR_TEXTURE_IDS: ColorTextureId[] = [COLOR_TEXTURE_ID_SANDSTONE, COLOR_TEXTURE_ID_GRANITE, COLOR_TEXTURE_ID_WOOD, COLOR_TEXTURE_ID_BONE];
const WALL_NORMAL_TEXTURE_IDS: NormalTextureId[] = [NORMAL_TEXTURE_ID_BRICKS_3, NORMAL_TEXTURE_ID_BRICKS_2, NORMAL_TEXTURE_ID_BRICKS_1];

type WallPartId = typeof WALL_PART_ID_BODY;

const PART_WALL: Part<WallPartId> = {
  modelId: MODEL_WALL,
  id: WALL_PART_ID_BODY,
  colorTextureIds: WALL_COLOR_TEXTURE_IDS,
  normalTextureIds: WALL_NORMAL_TEXTURE_IDS,
  incomingDamageMultiplier: -1,
};

const SHAPE_WALL = shapeFromPlanes(planesCube(1, 1, 1));