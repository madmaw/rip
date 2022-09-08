///<reference path="../constants.ts"/>
///<reference path="../math/shape.ts"/>
///<reference path="../textures/textures.ts"/>
///<reference path="./models.ts"/>
///<reference path="./skeleton.ts"/>

const BOTTLE_RADIUS = .02;
const BOTTLE_LENGTH = .02;

// const BOTTLE_NECK_LENGTH = .02;
// const BOTTLE_NECK_RADIUS = .005;

const BOTTLE_PART_ID_BODY = 0;

type BottlePartId =
    | typeof BOTTLE_PART_ID_BODY
    ;

const BOTTLE_PART_BODY: EntityBody<BottlePartId> = {
  id: BOTTLE_PART_ID_BODY,
  modelId: MODEL_BOTTLE,
  textureId: TEXTURE_ID_GOLD, 
  jointAttachmentHeldTransform: matrix4Multiply(
      matrix4Rotate(Math.PI/2, 1, 0, 0),
      matrix4Translate(-BOTTLE_LENGTH/2 - BOTTLE_RADIUS, 0, BOTTLE_RADIUS/2)
  ),
  jointAttachmentHolderPartId: SKELETON_PART_ID_HAND_LEFT,
  jointAttachmentHolderAnims: {
    [ACTION_ID_USE_SECONDARY]: {
      maxSpeed: .001,
      blockActions: ACTION_ID_IDLE
          | ACTION_ID_RUN
          | ACTION_ID_ATTACK_HEAVY
          | ACTION_ID_ATTACK_LIGHT
          | ACTION_ID_USE_SECONDARY,
      onComplete: (e: Entity) => {
        (e.joints[SKELETON_PART_ID_HAND_LEFT].attachedEntity as Entity).health--;
        e.health = Math.min(e.health + 3, e.maxHealth);
      },
      sequences: [
        safeUnpackAnimationSequence(
            [...' !@;@! @!!@8@! @%!@<@!"@&!@3;!"@,!@=@! @'],
            FLAG_UNPACK_SUPPLY_ORIGINALS && {
              [SKELETON_PART_ID_HEAD]: [[
                [0, -Math.PI/4, 0],
              ], 1],
              [SKELETON_PART_ID_RIBCAGE]: [[
                [0, -Math.PI/6, 0],
              ], 1],
              [SKELETON_PART_ID_HUMERUS_LEFT]: [[
                [0, -Math.PI/8, 0],
              ], 1, EASE_OUT_QUAD],
              [SKELETON_PART_ID_FOREARM_LEFT]: [[
                [0, -Math.PI/2.5, -Math.PI/7],
              ], 1, EASE_OUT_QUAD],
              [SKELETON_PART_ID_HAND_LEFT]: [[
                [0, -Math.PI/10, 0],
              ], 1],
            }
        ),
      ],
    },         
  },
};

const BOTTLE_COS = Math.cos(CONST_PI_ON_2_7_1DP);
const BOTTLE_SIN = Math.sin(CONST_PI_ON_2_7_1DP);
const BOTTLE_FACES = 8;
const BOTTLE_SHAPE = shapeFromPlanes([
  ...planesCapsule(8, BOTTLE_LENGTH, BOTTLE_RADIUS),
  ...new Array(BOTTLE_FACES).fill(0).map((_, i) => {
    const a = i/BOTTLE_FACES * CONST_2_PI_0DP;
    return planeFromPointAndNormal([BOTTLE_LENGTH/2 + BOTTLE_RADIUS * 1.5, 0, 0], [BOTTLE_COS, BOTTLE_SIN * Math.cos(a), BOTTLE_SIN * Math.sin(a)]);
  }),
]);