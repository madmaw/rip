///<reference path="../level/entity.ts"/>
///<reference path="models.ts"/>
///<reference path="wall.ts"/>

const STEP_PART_ID_BODY = 0;

type StepPartId = typeof STEP_PART_ID_BODY;

const NUM_STEPS = 5;
const STEP_DEPTH = 1/NUM_STEPS;
const STEP_WIDTH = STEP_DEPTH;

const PART_STEPS = new Array(NUM_STEPS).fill(0).map<Part<StepPartId>>((_, i) => {
  const d = 1 - STEP_WIDTH * i;
  return {
    id: STEP_PART_ID_BODY,
    modelId: MODEL_STEP_1 + i as ModelId,
    colorTextureIds: WALL_COLOR_TEXTURE_IDS,
    normalTextureIds: [NORMAL_TEXTURE_ID_BRICKS_1],
    preRotationTransform: matrix4Translate(d/2, .5, 0),
    postRotationTransform: matrix4Translate(-d/2, -.5, 0),
    vulnerability: -1,
  };
});

const SHAPE_STEPS: Shape[] = new Array(NUM_STEPS).fill(0).map<Shape>((_, i) => {
  const d = 1 - STEP_WIDTH * i;
  // TODO maybe can remove the position and remove the translation above
  return shapeFromPlanes(planesCube(d, 1, STEP_DEPTH));
});
