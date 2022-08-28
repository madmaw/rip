///<reference path="models.ts"/>
///<reference path="../textures/textures.ts"/>

type WallPartId = never;

const PART_WALL: Part<WallPartId> = {
  modelId: MODEL_WALL,
  textureId: TEXTURE_ID_BRICKS,
};

const SHAPE_WALL = shapeFromPlanes(planesCube(1, 1, 1));