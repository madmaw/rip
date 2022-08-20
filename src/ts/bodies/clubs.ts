///<reference path="./models.ts"/>
///<reference path="../math/shape.ts"/>

const NUM_CLUBS = 2;

type ClubPartId = never;

const PARTS_CLUBS: EntityBody<ClubPartId>[] = new Array(NUM_CLUBS).fill(0).map((_, i) => {
  return {
    modelId: MODEL_CLUB_1 + i,
  };
});

const SHAPES_CLUBS: Shape[] = new Array(NUM_CLUBS).fill(0).map((_, i) => {
  return shapeFromPlanes(planesCapsule(12, .2 + .2 * i, .01, .02 + i * .01));
});