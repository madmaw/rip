///<reference path="models.ts"/>

type WallPartId = never;

const PART_WALL: Part<WallPartId> = {
  modelId: MODEL_WALL,
};

const SHAPE_WALL = shapeFromPlanes(planesCube(1, 1, 1));