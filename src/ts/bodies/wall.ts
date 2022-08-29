///<reference path="models.ts"/>
///<reference path="../textures/textures.ts"/>

const WALL_PART_ID_BODY = 0;

type WallPartId = typeof WALL_PART_ID_BODY;

const PART_WALL: Part<WallPartId> = {
  modelId: MODEL_WALL,
  id: WALL_PART_ID_BODY,
  textureId: TEXTURE_ID_BRICKS,
};

const SHAPE_WALL = shapeFromPlanes(planesCube(1, 1, 1));