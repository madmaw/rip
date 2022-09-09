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
    pushback: 1.5,
    colorTextureIds: [COLOR_TEXTURE_ID_WOOD, COLOR_TEXTURE_ID_BONE, COLOR_TEXTURE_ID_METAL],
    outgoingDamage: 1 + Math.sqrt(i)/2,
    jointAttachmentHeldTransform: matrix4Translate(clubWidth/3, 0, 0),
    jointAttachmentHolderPartId: SKELETON_PART_ID_HAND_RIGHT,
    jointAttachmentHolderAnims: {
      [ACTION_ID_ATTACK_LIGHT]: {
        maxSpeed: .006 - .003 * i/(i + 1),
        blockActions:
            ACTION_ID_IDLE
            | ACTION_ID_RUN
            | ACTION_ID_ATTACK_HEAVY
            | ACTION_ID_ATTACK_LIGHT
            | ACTION_ID_USE_SECONDARY,
        translated: [.1, 0, 0],
        range: .1 + i/19,
        sequences: [SKELETON_CLUB_ATTACK_LIGHT_SEQUENCE],
      },         
      [ACTION_ID_ATTACK_HEAVY]: {
        maxSpeed: .005 - .002 * i/(i + 1),
        blockActions: ACTION_ID_IDLE
            | ACTION_ID_DUCK
            | ACTION_ID_RUN
            | ACTION_ID_WALK
            | ACTION_ID_WALK_BACKWARD
            | ACTION_ID_ATTACK_HEAVY
            | ACTION_ID_ATTACK_LIGHT
            | ACTION_ID_USE_SECONDARY,
        translated: [.1, 0, -.1],
        range: .1,
        // overhead smash
        sequences: [SKELETON_CLUB_ATTACK_HEAVY_SEQUENCE],
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