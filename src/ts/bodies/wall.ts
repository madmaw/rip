///<reference path="models.ts"/>
///<reference path="../textures/textures.ts"/>

const WALL_PART_ID_BODY = 0;

const WALL_COLOR_TEXTURE_IDS: ColorTextureId[] = [
  COLOR_TEXTURE_ID_STONE_1,
  COLOR_TEXTURE_ID_STONE_2,
  COLOR_TEXTURE_ID_STONE_3,
  COLOR_TEXTURE_ID_STONE_4,
  COLOR_TEXTURE_ID_STONE_5,
  COLOR_TEXTURE_ID_METAL,
  COLOR_TEXTURE_ID_BONE,
  COLOR_TEXTURE_ID_BONE_BLACKENED,
];

const WALL_NORMAL_TEXTURE_IDS: NormalTextureId[] = [
  NORMAL_TEXTURE_ID_BRICKS_4,
  NORMAL_TEXTURE_ID_BRICKS_3,
  /* intentional blank entry so it uses default solid block */,
  NORMAL_TEXTURE_ID_BRICKS_2,
  NORMAL_TEXTURE_ID_BRICKS_1,
];

type WallPartId = typeof WALL_PART_ID_BODY;

const PART_WALL: Part<WallPartId> = {
  modelId: MODEL_WALL,
  id: WALL_PART_ID_BODY,
  colorTextureIds: WALL_COLOR_TEXTURE_IDS,
  normalTextureIds: WALL_NORMAL_TEXTURE_IDS,
  incomingDamageMultiplier: -1,
};

const SHAPE_WALL = shapeFromPlanes(planesCube(1, 1, 1));