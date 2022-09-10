const SPEAR_LENGTH = .4;
const SPEAR_RADIUS = .01;

const SPEAR_PART_ID_BODY = 0;

type SpearPartId = 
    | typeof SPEAR_PART_ID_BODY
    ;

const SPEAR_PART: EntityBody<SpearPartId> = {
  id: SPEAR_PART_ID_BODY,
  modelId: MODEL_SPEAR,
  colorTextureIds: [COLOR_TEXTURE_ID_WOOD, COLOR_TEXTURE_ID_BONE, COLOR_TEXTURE_ID_METAL],
  jointAttachmentHeldTransform: matrix4Translate(SPEAR_LENGTH/4, 0, 0),
  jointAttachmentHolderPartId: SKELETON_PART_ID_HAND_RIGHT,
  outgoingDamage: 1,
  jointAttachmentHolderAnims: {
    [ACTION_ID_ATTACK_LIGHT]: {
      maxSpeed: .005,
      blockActions: ACTION_ID_IDLE
          | ACTION_ID_RUN
          | ACTION_ID_ATTACK_HEAVY
          | ACTION_ID_ATTACK_LIGHT
          | ACTION_ID_USE_SECONDARY,
      range: SPEAR_LENGTH/2,
      translated: [.1, 0, 0],
      sequences: [{
        // adjust existing attack
        ...SKELETON_HEAVY_ATTACK_SEQUENCE,
        [SKELETON_PART_ID_HUMERUS_RIGHT]: [[
          [0, CONST_PI_ON_1_5_1DP, 0],
          [0, -CONST_PI_ON_4_1DP, -CONST_PI_ON_3_1DP],
        ], 1, EASE_IN_QUAD],
        [SKELETON_PART_ID_HAND_RIGHT]: [[
          [0, 0, 0],
          [0, CONST_PI_ON_2_1DP, 0],
        ], 1, EASE_IN_QUAD, 1],
      }],
    },
    [ACTION_ID_ATTACK_HEAVY]: {
      maxSpeed: .004,
      blockActions: ACTION_ID_IDLE
          | ACTION_ID_RUN
          | ACTION_ID_WALK
          | ACTION_ID_ATTACK_HEAVY
          | ACTION_ID_ATTACK_LIGHT
          | ACTION_ID_USE_SECONDARY,
      range: SPEAR_LENGTH,
      translated: [.1, 0, 0],
      sequences: [{
        ...SKELETON_CLUB_ATTACK_LIGHT_SEQUENCE,
        [SKELETON_PART_ID_HAND_RIGHT]: [[
          [CONST_PI_ON_1_5_1DP, 0, 0],
          [0, CONST_PI_ON_1_5_1DP, 0],
        ], 1, EASE_IN_QUAD, 1.5],
      }],
    },

  },
};

const SPEAR_COS = Math.cos(CONST_PI_ON_2_5_1DP);
const SPEAR_SIN = Math.sin(CONST_PI_ON_2_5_1DP);
const SHAPE_SPEAR_BODY = shapeFromPlanes([
  ...planesCapsule(3, SPEAR_LENGTH, SPEAR_RADIUS),
  ...new Array(4).fill(0).map((_, i) => {
    const a = i/4 * CONST_2_PI_0DP;
    return planeFromPointAndNormal([SPEAR_LENGTH/2, 0, 0], [SPEAR_COS, SPEAR_SIN * Math.cos(a), SPEAR_SIN * Math.sin(a)]);
  })
]);


