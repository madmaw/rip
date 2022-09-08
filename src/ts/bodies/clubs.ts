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
    outgoingDamage: 1 + Math.sqrt(i)/2,
    jointAttachmentHeldTransform: matrix4Translate(clubWidth/3, 0, 0),
    jointAttachmentHolderPartId: SKELETON_PART_ID_HAND_RIGHT,
    jointAttachmentHolderAnims: {
      [ACTION_ID_ATTACK_LIGHT]: {
        maxSpeed: .006 - .003 * i/(i + 1),
        blockActions: ACTION_ID_IDLE | ACTION_ID_RUN,
        translated: [.1, 0, 0],
        range: .1 + i/19,
        sequences: [{
          // adjust existing attack
          ...SKELETON_HEAVY_ATTACK_SEQUENCE,
          [SKELETON_PART_ID_HAND_RIGHT]: [[
            [CONST_PI_ON_1_5_1DP, 0, 0],
            [0, CONST_PI_ON_1_5_1DP, 0],
          ], 1, EASE_IN_QUAD, 1],
        }],
      },         
      [ACTION_ID_ATTACK_HEAVY]: {
        maxSpeed: .005 - .002 * i/(i + 1),
        blockActions: ACTION_ID_IDLE
            | ACTION_ID_DUCK
            | ACTION_ID_RUN
            | ACTION_ID_WALK
            | ACTION_ID_WALK_BACKWARD,
        translated: [.2, 0, -.1],
        range: .2,
        // overhead smash
        sequences: [
          safeUnpackAnimationSequence(
              [...' "@:@@D@! @!"@<@@@@! @""@@@@E@! @#"@=@@H@!!@$"@0@@@@! @\'"@P@@P@! @("@@@@8@! @)"@H@@P@! @*"@P@@U@! @+"@F@@@@!!`'],
              FLAG_UNPACK_SUPPLY_ORIGINALS && {
                [SKELETON_PART_ID_HIPS]: [[
                  [0, 0, 0],
                  [0, Math.PI/7, 0],
                ], 1],
                [SKELETON_PART_ID_FEMUR_RIGHT]: [[
                  [0, Math.PI/2, 0],
                  [0, Math.PI/2, 0],
                ], 1],
                [SKELETON_PART_ID_SHIN_RIGHT]: [[
                  [0, Math.PI/4, 0],
                  [0, Math.PI/2, 0],
                ], 1],
                [SKELETON_PART_ID_FEMUR_LEFT]: [[
                  [0, 0, 0],
                  [0, -Math.PI/4, 0],
                ], 1],
                [SKELETON_PART_ID_SHIN_LEFT]: [[
                  [0, Math.PI/2, 0],
                  [0, Math.PI/1.5, 0],
                ], 1],
                [SKELETON_PART_ID_HEAD]: [[
                  [0, -Math.PI/9, 0],
                  [0, 0, 0],
                ], 1],
                [SKELETON_PART_ID_RIBCAGE]: [[
                  [0, -Math.PI/5, 0],
                  [0, Math.PI/8, 0],
                ], 1],
                [SKELETON_PART_ID_HUMERUS_RIGHT]: [[
                  [0, -Math.PI/12, 0],
                  [0, Math.PI/4, 0],
                ], 1, EASE_IN_QUAD],
                [SKELETON_PART_ID_FOREARM_RIGHT]: [[
                  [0, -Math.PI/2, 0],
                  [0, 0, 0],
                ], 1],
                [SKELETON_PART_ID_HAND_RIGHT]: [[
                  [0, Math.PI/5, 0],
                  [0, 0, 0],
                ], 1, EASE_IN_QUAD, 2],
              },
          )
        ],
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