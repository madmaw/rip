///<reference path="../math/shape.ts"/>
///<reference path="models.ts"/>
///<reference path="skeleton.ts"/>

const NUM_CLUBS = 5;

const BASE_CLUB_WIDTH = .15;
const CLUB_WIDTH_FACTOR = .05;
const CLUB_RADIUS_LEFT = .015;
const BASE_CLUB_RADIUS_RIGHT = .02;
const CLUB_RADIUS_RIGHT_FACTOR = .005;

const CLUB_PART_ID_BODY = 0;

type ClubPartId = typeof CLUB_PART_ID_BODY;

const PARTS_CLUBS: EntityBody<ClubPartId>[] = new Array(NUM_CLUBS).fill(0).map((_, i) => {
  const clubWidth = BASE_CLUB_WIDTH + i * CLUB_WIDTH_FACTOR;
  return {
    id: CLUB_PART_ID_BODY,
    modelId: MODEL_CLUB_1 + i as ModelId,
    textureId: TEXTURE_ID_WOOD,
    jointAttachmentHeldTransform: matrix4Translate(clubWidth/3, 0, 0),
    jointAttachmentHolderPartId: SKELETON_PART_ID_HAND_RIGHT,
    jointAttachmentHolderAnims: {
      [ACTION_ID_ATTACK_LIGHT]: {
        maxSpeed: .005,
        blockActions: ACTION_ID_JUMP | ACTION_ID_IDLE | ACTION_ID_RUN,
        translate: [.1, 0, 0],
        // adjust existing attack
        sequences: [{
          ...SKELETON_LIGHT_ATTACK_SEQUENCE,
          [SKELETON_PART_ID_HAND_RIGHT]: [[
            [Math.PI/1.5, 0, 0],
            [0, Math.PI/1.5, 0],
          ], 1, EASE_IN_QUAD, 1.5],
        }],
      },         
      [ACTION_ID_ATTACK_HEAVY]: {
        maxSpeed: .001 + .003 * i/(i + 1),
        blockActions: ACTION_ID_JUMP | ACTION_ID_IDLE | ACTION_ID_RUN | ACTION_ID_WALK | ACTION_ID_WALK_BACKWARD,
        // overhead smash
        sequences: [{
          [SKELETON_PART_ID_HIPS]: [[
            [0, 0, 0],
            [0, Math.PI/9, 0],
          ], 1],
          [SKELETON_PART_ID_HEAD]: [[
            [0, -Math.PI/9, 0],
            [0, 0, 0],
          ], 1],
          [SKELETON_PART_ID_RIBCAGE]: [[
            [0, -Math.PI/5 - i/3, 0],
            [0, Math.PI/8, 0],
          ], 1],
          [SKELETON_PART_ID_HUMERUS_RIGHT]: [[
            [0, -Math.PI/4 - i/2, 0],
            [0, Math.PI/3, 0],
          ], 1, EASE_IN_QUAD],
          [SKELETON_PART_ID_FOREARM_RIGHT]: [[
            [0, -Math.PI/2 - i/2, 0],
            [0, 0, 0],
          ], 1],
          [SKELETON_PART_ID_HAND_RIGHT]: [[
            [0, 0, 0],
            [0, Math.PI/3, 0],
          ], 1, EASE_IN_QUAD, 2 + i/2],
        }],
      },   
    }
  };
});

const SHAPES_CLUBS: Shape[] = new Array(NUM_CLUBS).fill(0).map((_, i) => {
  return shapeFromPlanes(planesCapsule(
      6,
      BASE_CLUB_WIDTH + CLUB_WIDTH_FACTOR * i,
      CLUB_RADIUS_LEFT,
      BASE_CLUB_RADIUS_RIGHT + i * CLUB_RADIUS_RIGHT_FACTOR,
  ));
});