///<reference path="../math/shape.ts"/>
///<reference path="models.ts"/>
///<reference path="skeleton.ts"/>

const NUM_CLUBS = 5;

const CLUB_WIDTH = .2;
const CLUB_RADIUS_LEFT = .01;
const CLUB_RADIUS_RIGHT = .02;

const CLUB_PART_ID_BODY = 0;

type ClubPartId = typeof CLUB_PART_ID_BODY;

const CLUB_BODY: EntityBody<ClubPartId> = {
  id: CLUB_PART_ID_BODY,
  modelId: MODEL_CLUB,
  pushback: 1.5,
  colorTextureIds: [COLOR_TEXTURE_ID_WOOD, COLOR_TEXTURE_ID_BONE, COLOR_TEXTURE_ID_METAL],
  outgoingDamage: 1,
  jointAttachmentHeldTransform: matrix4Translate(CLUB_WIDTH/4, 0, 0),
  jointAttachmentHolderPartId: SKELETON_PART_ID_HAND_RIGHT,
  jointAttachmentHolderAnims: {
    [ACTION_ID_ATTACK_LIGHT]: {
      maxSpeed: .006,
      blockActions:
          ACTION_ID_IDLE
          | ACTION_ID_RUN
          | ACTION_ID_ATTACK_HEAVY
          | ACTION_ID_ATTACK_LIGHT
          | ACTION_ID_USE_SECONDARY,
      translated: [.1, 0, 0],
      range: .1,
      sequences: [SKELETON_CLUB_ATTACK_LIGHT_SEQUENCE],
    },         
    [ACTION_ID_ATTACK_HEAVY]: {
      maxSpeed: .005,
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

const SHAPE_CLUB: Shape = shapeFromPlanes(planesCapsule(
    5,
    CLUB_WIDTH,
    CLUB_RADIUS_LEFT,
    CLUB_RADIUS_RIGHT,
));
