///<reference path="./models.ts"/>
///<reference path="../math/shape.ts"/>

const NUM_CLUBS = 2;

const BASE_CLUB_WIDTH = .15;
const CLUB_WIDTH_FACTOR = .05;
const CLUB_RADIUS_LEFT = .015;
const BASE_CLUB_RADIUS_RIGHT = .02;
const CLUB_RADIUS_RIGHT_FACTOR = .005;

type ClubPartId = never;

const PARTS_CLUBS: EntityBody<ClubPartId>[] = new Array(NUM_CLUBS).fill(0).map((_, i) => {
  const clubWidth = BASE_CLUB_WIDTH + i * CLUB_WIDTH_FACTOR;
  return {
    modelId: MODEL_CLUB_1 + i,
    jointAttachmentHeldTransform: matrix4Translate(clubWidth/3, 0, 0),
  };
});

const SHAPES_CLUBS: Shape[] = new Array(NUM_CLUBS).fill(0).map((_, i) => {
  return shapeFromPlanes(planesCapsule(
      8,
      BASE_CLUB_WIDTH + CLUB_WIDTH_FACTOR * i,
      CLUB_RADIUS_LEFT,
      BASE_CLUB_RADIUS_RIGHT + i * CLUB_RADIUS_RIGHT_FACTOR,
  ));
});