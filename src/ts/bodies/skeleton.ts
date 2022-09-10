///<reference path="../anim.ts"/>
///<reference path="../constants.ts"/>
///<reference path="../level/entity.ts"/>
///<reference path="../math/matrix.ts"/>
///<reference path="../math/shape.ts"/>
///<reference path="../math/vector.ts"/>
///<reference path="../textures/textures.ts"/>
///<reference path="../util/unpack.ts"/>
///<reference path="models.ts"/>

const SKELETON_DIMENSION = .2;
const SKELETON_DEPTH = .5;

const SKELETON_RIBCAGE_WIDTH = .1;
const SKELETON_RIBCAGE_HEIGHT = .2;
const SKELETON_RIBCAGE_DEPTH = .15;

const SKELETON_HEAD_WIDTH = .09;
const SKELETON_HEAD_HEIGHT = .08;
const SKELETON_HEAD_DEPTH = .08;
const SKELETON_NECK_LENGTH = .02;

const SKELETON_HUMERUS_WIDTH = .09;
const SKELETON_HUMERUS_DIAMETER = .04;

const SKELETON_FOREARM_WIDTH = .07;
const SKELETON_FOREARM_DIAMETER = .04;

const SKELETON_WRIST_RADIUS = .01;

const SKELETON_HIPS_WIDTH = .06;
const SKELETON_HIPS_HEIGHT = .1;
const SKELETON_HIPS_DEPTH = .08;

const SKELETON_FEMUR_LENGTH = .1;
const SKELETON_FEMUR_RADIUS = .02;

const SKELETON_SHIN_WIDTH = .12;
const SKELETON_SHIN_DIAMETER = .03;

const SKELETON_HAND_DIMENSION = .07;

const SKELETON_FOOT_WIDTH = .1;
const SKELETON_FOOT_HEIGHT = .04;
const SKELETON_FOOT_DEPTH = .04;

const SKELETON_NECK_DIMENSION = .05;

const SKELETON_PART_ID_RIBCAGE = 0;
const SKELETON_PART_ID_HEAD = 1;
const SKELETON_PART_ID_HIPS = 2;
const SKELETON_PART_ID_HUMERUS_RIGHT = 3;
const SKELETON_PART_ID_FOREARM_RIGHT = 4;
const SKELETON_PART_ID_HUMERUS_LEFT = 5;
const SKELETON_PART_ID_FOREARM_LEFT = 6;
const SKELETON_PART_ID_FEMUR_RIGHT = 7;
const SKELETON_PART_ID_FEMUR_LEFT = 8;
const SKELETON_PART_ID_SHIN_RIGHT = 9;
const SKELETON_PART_ID_SHIN_LEFT = 10;
const SKELETON_PART_ID_HAND_RIGHT = 11;
const SKELETON_PART_ID_HAND_LEFT = 12;
const SKELETON_PART_ID_FOOT_RIGHT = 13;
const SKELETON_PART_ID_FOOT_LEFT = 14;

const SKELETON_GLOW = .25;

const SKELETON_COLOR_TEXTURE_IDS: ColorTextureId[] = [COLOR_TEXTURE_ID_BONE, COLOR_TEXTURE_ID_BONE_BLACKENED, ];

const SKELETON_PART_FLIPS: Partial<Record<SkeletonPartId, SkeletonPartId>> = {
  [SKELETON_PART_ID_HUMERUS_LEFT]: SKELETON_PART_ID_HUMERUS_RIGHT,
  [SKELETON_PART_ID_FOREARM_LEFT]: SKELETON_PART_ID_FOREARM_RIGHT,
  [SKELETON_PART_ID_HAND_LEFT]: SKELETON_PART_ID_HAND_RIGHT,
  [SKELETON_PART_ID_FEMUR_LEFT]: SKELETON_PART_ID_FEMUR_RIGHT,
  [SKELETON_PART_ID_SHIN_LEFT]: SKELETON_PART_ID_SHIN_RIGHT,
  [SKELETON_PART_ID_FOOT_LEFT]: SKELETON_PART_ID_FOOT_RIGHT,
};


const SKELETON_DEFAULT_ROTATIONS = safeUnpackVector3Rotations(
  [...'/@C@@=@@@@@K@@<@@K@@<@@J@@J@@J@@J@@@@@@@@@@@@@'],
  FLAG_UNPACK_SUPPLY_ORIGINALS && [
    //SKELETON_PART_ID_RIBCAGE
    [0, Math.PI/10, 0],
    //SKELETON_PART_ID_HEAD
    [0, -Math.PI/10, 0],
    //SKELETON_PART_ID_HIPS
    [0, 0, 0],
    //SKELETON_PART_ID_HUMERUS_RIGHT
    [0, Math.PI/3, 0],
    //SKELETON_PART_ID_FOREARM_RIGHT
    [0, -Math.PI/8, 0],
    //SKELETON_PART_ID_HUMERUS_LEFT
    [0, Math.PI/3, 0],
    //SKELETON_PART_ID_FOREARM_LEFT
    [0, -Math.PI/8, 0],
    //SKELETON_PART_ID_FEMUR_RIGHT
    [0, Math.PI*3/10, 0],
    //SKELETON_PART_ID_SHIN_RIGHT
    [0, Math.PI*3/10, 0],
    //SKELETON_PART_ID_FEMUR_LEFT
    [0, Math.PI*3/10, 0],
    //SKELETON_PART_ID_SHIN_LEFT
    [0, Math.PI*3/10, 0],
    // SKELETON_PART_ID_HAND_RIGHT
    [0, 0, 0],
    // SKELETON_PART_ID_HAND_LEFT
    [0, 0, 0],
    // SKELETON_PART_ID_FOOT_RIGHT
    [0, 0, 0],
    // SKELETON_PART_ID_FOOT_LEFT
    [0, 0, 0],
  ]
) as Vector3[] & Record<SkeletonPartId, Vector3>;

// unused
const SKELETON_LURCH_SEQUENCE: Partial<Record<SkeletonPartId, EntityBodyPartAnimationSequence>> = {
  [SKELETON_PART_ID_HIPS]: [[
    [0, 0, Math.PI/9],
    [0, 0, -Math.PI/9],    
  ]],
  [SKELETON_PART_ID_FEMUR_LEFT]: [[
    [0, Math.PI/1.5, 0],
    [0, Math.PI/6, 0],
  ]],
  [SKELETON_PART_ID_FEMUR_RIGHT]: [[
    [0, Math.PI/6, 0],
    [0, Math.PI/1.5, 0],
  ]],
  [SKELETON_PART_ID_SHIN_LEFT]: [[
    [0, Math.PI*1/10, 0],
    [0, Math.PI*5/10, 0],
  ]],
  [SKELETON_PART_ID_SHIN_RIGHT]: [[
    [0, Math.PI*5/10, 0],
    [0, Math.PI*1/10, 0],
  ]],
  [SKELETON_PART_ID_HUMERUS_LEFT]: [[
    [0, Math.PI/2, 0],
    [0, Math.PI/4, 0],
  ]],
  [SKELETON_PART_ID_HUMERUS_RIGHT]: [[
    [0, Math.PI/4, 0],
    [0, Math.PI/2, 0],
  ]],
};

const SKELETON_DEFENSIVE_WALK_SEQUENCES = entityFlipBodyPartAnimationSequences(
    safeUnpackAnimationSequence(
        [...'!"@=@@C@  @""@B8@>5  @#"@F@@H@  @$"@0@@+@  @%"@H@@F@  @&"@0@@5@  @\'"@ME@P;  @("@P@@ME  @)"@F@@M@  @*"@M@@F@  @'],
        FLAG_UNPACK_SUPPLY_ORIGINALS && {
          [SKELETON_PART_ID_HEAD]: [[
            [0, -Math.PI/12, 0],
            [0, Math.PI/12, 0],
          ]],
          [SKELETON_PART_ID_HIPS]: [[
            [0, Math.PI/20, -Math.PI/4],
            [0, -Math.PI/20, -Math.PI/3],
          ]],
          [SKELETON_PART_ID_FEMUR_LEFT]: [[
            [0, Math.PI/2, 0],
            [0, Math.PI/2.5, Math.PI/6],
          ]],
          [SKELETON_PART_ID_FEMUR_RIGHT]: [[
            [0, Math.PI/2.5, Math.PI/6],
            [0, Math.PI/2, -Math.PI/6],
          ]],
          [SKELETON_PART_ID_SHIN_LEFT]: [[
            [0, Math.PI*4/10, 0],
            [0, Math.PI*2/10, 0],
          ]],
          [SKELETON_PART_ID_SHIN_RIGHT]: [[
            [0, Math.PI*2/10, 0],
            [0, Math.PI*4/10, 0],
          ]],
          [SKELETON_PART_ID_HUMERUS_LEFT]: [[
            [0, Math.PI/4, 0],
            [0, Math.PI/5, 0],
          ]],
          [SKELETON_PART_ID_HUMERUS_RIGHT]: [[
            [0, Math.PI/5, 0],
            [0, Math.PI/4, 0],
          ]],
          [SKELETON_PART_ID_FOREARM_LEFT]: [[
            [0, -Math.PI/2, 0],
            [0, -Math.PI/3, 0],
          ]],
          [SKELETON_PART_ID_FOREARM_RIGHT]: [[
            [0, -Math.PI/2, 0],
            [0, -Math.PI/1.5, 0],
          ]],
        },
    ),
    SKELETON_PART_FLIPS,
);

const SKELETON_RUN_SEQUENCES = entityFlipBodyPartAnimationSequences(
    safeUnpackAnimationSequence(
        [...'!"@==@=C  @""@CD@C<!#@#"@P@@@@  @$!@5@  @%"@@@@P@  @&!@5@  @\'"@<:@U<!"@("@UD@<F!"@)"@P@@J@!"@*"@J@@P@!"@'],
        FLAG_UNPACK_SUPPLY_ORIGINALS && {
          [SKELETON_PART_ID_HEAD]: [[
            [0, -Math.PI/12, -Math.PI/12],
            [0, -Math.PI/12, Math.PI/12],
          ]],
          [SKELETON_PART_ID_HIPS]: [[
            [0, Math.PI/12, Math.PI/9],
            [0, Math.PI/12, -Math.PI/9], 
          ], 1, EASE_IN_OUT_QUAD],
          [SKELETON_PART_ID_FEMUR_LEFT]: [[
            [0, Math.PI/1.5, Math.PI/9],
            [0, -Math.PI/8, Math.PI/5],
          ], 1, EASE_OUT_QUAD],
          [SKELETON_PART_ID_FEMUR_RIGHT]: [[
            [0, -Math.PI/8, -Math.PI/5],
            [0, Math.PI/1.5, -Math.PI/9],
          ], 1, EASE_OUT_QUAD],
          [SKELETON_PART_ID_SHIN_LEFT]: [[
            [0, Math.PI*3/10, 0],
            [0, Math.PI*5/10, 0],
          ], 1, EASE_OUT_QUAD],
          [SKELETON_PART_ID_SHIN_RIGHT]: [[
            [0, Math.PI*5/10, 0],
            [0, Math.PI*3/10, 0],
          ], 1, EASE_OUT_QUAD],
          [SKELETON_PART_ID_HUMERUS_LEFT]: [[
            [0, 0, 0],
            [0, Math.PI/2, 0],
          ]],
          [SKELETON_PART_ID_HUMERUS_RIGHT]: [[
            [0, Math.PI/2, 0],
            [0, 0, 0],
          ]],
          [SKELETON_PART_ID_FOREARM_LEFT]: [[
            [0, -Math.PI/3, 0],
          ]],
          [SKELETON_PART_ID_FOREARM_RIGHT]: [[
            [0, -Math.PI/3, 0],
          ]],
        }
    ),
    SKELETON_PART_FLIPS,
);

const SKELETON_USE_SECONDARY_SEQUENCE: Partial<Record<SkeletonPartId, EntityBodyPartAnimationSequence>> = safeUnpackAnimationSequence(
    [...' "@@@@@;! @""@@@@D@! @%"@U@@@D! @&"@+;@<@!!B\'"@K@@P@  @,"@@@P@P!!B'],
    {
      [SKELETON_PART_ID_RIBCAGE]: [[
        [0, 0, 0],
        [0, 0, -Math.PI/6],
      ], 1],
      [SKELETON_PART_ID_HIPS]: [[
        [0, 0, 0],
        [0, Math.PI/9, 0],
      ], 1],
      [SKELETON_PART_ID_HUMERUS_LEFT]: [[
        [0, Math.PI/1.5, 0],
        [0, 0, Math.PI/9],
      ], 1],
      [SKELETON_PART_ID_FOREARM_LEFT]: [[
        [0, -Math.PI/1.5, -Math.PI/6],
        [0, -Math.PI/9, 0],
      ], 1, EASE_IN_QUAD, .1],
      [SKELETON_PART_ID_HAND_LEFT]: [[
        [0, 0, 0],
        [Math.PI/2, 0, Math.PI/3],
      ], 1, EASE_IN_QUAD, .1],
      [SKELETON_PART_ID_FEMUR_RIGHT]: [[
        [0, Math.PI/3, 0],
        [0, Math.PI/2, 0],
      ]],
    }
);

const SKELETON_LIGHT_ATTACK_SEQUENCE: Partial<Record<SkeletonPartId, EntityBodyPartAnimationSequence>> = {
  ...entityFlipBodyPartAnimationSequences(
      SKELETON_USE_SECONDARY_SEQUENCE,
      SKELETON_PART_FLIPS,
  )[1],
  [SKELETON_PART_ID_HAND_RIGHT]: [[
    [0, 0, 0],
    [-Math.PI/2, 0, 0],
  ], 1],
};

const SKELETON_HEAVY_ATTACK_SEQUENCE: Partial<Record<SkeletonPartId, EntityBodyPartAnimationSequence>> = safeUnpackAnimationSequence(
    [...'!"@;K@;5! @""@=5@CK! @#"@K0@8@!!@$"@0@@@@!!@\'"@P:@M:! @("@FH@K@! @*"@P@@D@  @+!@@@!!P'], 
    FLAG_UNPACK_SUPPLY_ORIGINALS && {
      [SKELETON_PART_ID_HEAD]: [[
        [0, -Math.PI/6, Math.PI/3],
        [0, -Math.PI/6, -Math.PI/3],
      ], 1],
      [SKELETON_PART_ID_HIPS]: [[
        [0, -Math.PI/12, -Math.PI/3],
        [0, Math.PI/12, Math.PI/3],
      ], 1],
      [SKELETON_PART_ID_FEMUR_LEFT]: [[
        [0, Math.PI/5, Math.PI/4],
        [0, Math.PI/3, 0],
      ], 1],
      [SKELETON_PART_ID_SHIN_LEFT]: [[
        [0, Math.PI/2, 0],
        [0, Math.PI/8, 0],
      ]],
      [SKELETON_PART_ID_FEMUR_RIGHT]: [[
        [0, Math.PI/2, -Math.PI/5],
        [0, Math.PI/2.5, -Math.PI/5],
      ], 1],
      [SKELETON_PART_ID_HUMERUS_RIGHT]: [[
        [0, Math.PI/3, -Math.PI/2],
        [0, -Math.PI/4, 0],
      ], 1, EASE_IN_QUAD],
      [SKELETON_PART_ID_FOREARM_RIGHT]: [[
        [0, -Math.PI/2, 0],
        [0, 0, 0],
      ], 1, EASE_IN_QUAD],
      [SKELETON_PART_ID_HAND_RIGHT]: [[
        [0, 0, 0],
      ], 1, EASE_IN_QUAD, 1 /* damage multiplier */]
    }
);

const SKELETON_IDLE_SEQUENCE: Partial<Record<SkeletonPartId, EntityBodyPartAnimationSequence>> = safeUnpackAnimationSequence(
    [...' "@C@@@@  @!"@@@@<@  @""@@@@C@  @\'"@J@@F@  @("@J@@F@  @'],
    FLAG_UNPACK_SUPPLY_ORIGINALS && {
      [SKELETON_PART_ID_HIPS]: [[
        [0, 0, 0],
        [0, Math.PI/12, 0],
      ]],
      [SKELETON_PART_ID_RIBCAGE]: [[
        [0, Math.PI/10, 0],
        [0, 0, 0],
      ]],
      [SKELETON_PART_ID_HEAD]: [[
        [0, 0, 0],
        [0, -Math.PI/8, 0],
      ]],
      [SKELETON_PART_ID_FEMUR_LEFT]: [[
        [0, Math.PI*3/10, 0],
        [0, Math.PI*2/10, 0],
      ]],
      [SKELETON_PART_ID_FEMUR_RIGHT]: [[
        [0, Math.PI*3/10, 0],
        [0, Math.PI*2/10, 0],
      ]],
    }
);

const SKELETON_CLUB_ATTACK_LIGHT_SEQUENCE: EntityBodyAnimationSequence<number> = {
  // adjust existing attack
  ...SKELETON_HEAVY_ATTACK_SEQUENCE,
  [SKELETON_PART_ID_HAND_RIGHT]: [[
    [CONST_PI_ON_1_5_1DP, 0, 0],
    [0, CONST_PI_ON_1_5_1DP, 0],
  ], 1, EASE_IN_QUAD, 1],
};

const SKELETON_CLUB_ATTACK_HEAVY_SEQUENCE: EntityBodyAnimationSequence<number> = safeUnpackAnimationSequence(
  [...' "@:@@D@! @!"@<@@@@! @""@@@@E@! @#"@=@@H@!!@$"@0@@@@! @\'"@P@@P@! @("@@@@8@! @)"@H@@P@! @*"@P@@U@! @+"@F@@@@!!X'],
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
    ], 1, EASE_IN_QUAD, 1.5],
  },
);

// for when the bone is used as a weapon
const SKELETON_FEMUR_ATTACHMENT_INFO: Pick<
    Part<SkeletonPartId>, 
    'jointAttachmentHolderPartId'
    | 'jointAttachmentHeldTransform'
    | 'jointAttachmentHolderTransform'
    | 'jointAttachmentHolderAnims'
    | 'outgoingDamage'
> = {
  jointAttachmentHolderPartId: SKELETON_PART_ID_HAND_RIGHT,
  jointAttachmentHeldTransform: matrix4Multiply(
      matrix4Rotate(Math.PI, 0, 1, 0),
      matrix4Translate(-SKELETON_FEMUR_LENGTH/2, (SKELETON_FEMUR_RADIUS - SKELETON_HAND_DIMENSION)/2, 0),
  ),
  jointAttachmentHolderAnims: {
    [ACTION_ID_ATTACK_LIGHT]: {
      maxSpeed: .005,
      blockActions:
          ACTION_ID_IDLE 
          | ACTION_ID_RUN 
          | ACTION_ID_USE_SECONDARY 
          | ACTION_ID_ATTACK_LIGHT 
          | ACTION_ID_ATTACK_HEAVY
          ,
      translated: [.1, 0, 0],
      range: .1,
      sequences: [SKELETON_CLUB_ATTACK_LIGHT_SEQUENCE],
    },
    [ACTION_ID_ATTACK_HEAVY]: {
      maxSpeed: .004,
      blockActions: 
          ACTION_ID_IDLE
          | ACTION_ID_RUN
          | ACTION_ID_WALK
          | ACTION_ID_JUMP
          | ACTION_ID_USE_SECONDARY
          | ACTION_ID_ATTACK_LIGHT
          | ACTION_ID_ATTACK_HEAVY
          ,
      translated: [.1, 0, -.1],
      range: .05,
      sequences: [SKELETON_CLUB_ATTACK_HEAVY_SEQUENCE],
    }
  },
  outgoingDamage: 1,
};

type SkeletonPartId = 
    | typeof SKELETON_PART_ID_RIBCAGE
    | typeof SKELETON_PART_ID_HEAD
    | typeof SKELETON_PART_ID_HIPS
    | typeof SKELETON_PART_ID_HUMERUS_RIGHT
    | typeof SKELETON_PART_ID_FOREARM_RIGHT
    | typeof SKELETON_PART_ID_HUMERUS_LEFT
    | typeof SKELETON_PART_ID_FOREARM_LEFT
    | typeof SKELETON_PART_ID_FEMUR_RIGHT
    | typeof SKELETON_PART_ID_FEMUR_LEFT
    | typeof SKELETON_PART_ID_SHIN_RIGHT
    | typeof SKELETON_PART_ID_SHIN_LEFT
    | typeof SKELETON_PART_ID_HAND_RIGHT
    | typeof SKELETON_PART_ID_HAND_LEFT
    | typeof SKELETON_PART_ID_FOOT_RIGHT
    | typeof SKELETON_PART_ID_FOOT_LEFT
    ;


const PART_SKELETON_BODY: EntityBody<SkeletonPartId> = {
  defaultJointRotations: SKELETON_DEFAULT_ROTATIONS,
  anims: {
    [ACTION_ID_IDLE]: {
      maxSpeed: .001,
      sequences: [SKELETON_IDLE_SEQUENCE]
    },
    [ACTION_ID_WALK]: {
      maxSpeed: .004,
      sequences: SKELETON_DEFENSIVE_WALK_SEQUENCES,
    },
    [ACTION_ID_WALK_BACKWARD]: {
      maxSpeed: .003,
      sequences: SKELETON_DEFENSIVE_WALK_SEQUENCES,
    },
    [ACTION_ID_RUN]: {
      maxSpeed: .006,
      sequences: SKELETON_RUN_SEQUENCES,
    },
    [ACTION_ID_JUMP]: {
      maxSpeed: .01,
      blockActions: 
          ACTION_ID_IDLE
          | ACTION_ID_WALK
          | ACTION_ID_WALK_BACKWARD
          | ACTION_ID_RUN
          | ACTION_ID_JUMP,
      //translate: [0, 0, -SKELETON_FEMUR_LENGTH],
      sequences: [
        safeUnpackAnimationSequence(
            [...'"!@D@!"@#!@X@  @$!@5@  @%!@X@  @&!@5@  @\'"@;@@@@  @("@;@@@@  @'],
            FLAG_UNPACK_SUPPLY_ORIGINALS && {
              [SKELETON_PART_ID_HIPS]: [[
                [0, Math.PI/8, 0],
              ], 1, EASE_OUT_QUAD],
              [SKELETON_PART_ID_FEMUR_LEFT]: [[
                [0, -Math.PI/6, 0],
                [0, 0, 0],
              ]],
              [SKELETON_PART_ID_FEMUR_RIGHT]: [[
                [0, -Math.PI/6, 0],
                [0, 0, 0],
              ]],
              [SKELETON_PART_ID_HUMERUS_RIGHT]: [[
                [0, Math.PI*3/4, 0],
              ]],
              [SKELETON_PART_ID_FOREARM_RIGHT]: [[
                [0, -Math.PI/3, 0],
              ]],
              [SKELETON_PART_ID_HUMERUS_LEFT]: [[
                [0, Math.PI*3/4, 0],
              ]],
              [SKELETON_PART_ID_FOREARM_LEFT]: [[
                [0, -Math.PI/3, 0],
              ]],
            }
        )
      ]
    },
    [ACTION_ID_DUCK]: {
      maxSpeed: .005,
      // AI uses duck to pick things up, so the range indicates how far we need
      // to be away
      range: PICK_UP_ITEM_RADIUS,
      blockActions:
          ACTION_ID_IDLE
          | ACTION_ID_WALK
          | ACTION_ID_WALK_BACKWARD
          | ACTION_ID_RUN
          | ACTION_ID_ATTACK_HEAVY
          | ACTION_ID_USE_SECONDARY,
      translated: [0, 0, -SKELETON_SHIN_WIDTH],
      sequences: [
        safeUnpackAnimationSequence(
            [...'!!@;@! @"!@E@!"@\'!@C:! @(!@:F! @)!@V@! @*!@PF! @'],
            FLAG_UNPACK_SUPPLY_ORIGINALS && {
              [SKELETON_PART_ID_HEAD]: [[
                [0, -Math.PI/6, 0],
              ], 1],
              [SKELETON_PART_ID_HIPS]: [[
                [0, Math.PI/6, 0],
              ], 1, EASE_OUT_QUAD],
              [SKELETON_PART_ID_FEMUR_LEFT]: [[
                [0, -Math.PI*2/10, Math.PI/5],
              ], 1],
              [SKELETON_PART_ID_SHIN_LEFT]: [[
                [0, Math.PI*5/10, Math.PI/5],
              ], 1],
              [SKELETON_PART_ID_FEMUR_RIGHT]: [[
                [0, Math.PI*1/10, -Math.PI/5],
              ], 1],
              [SKELETON_PART_ID_SHIN_RIGHT]: [[
                [0, Math.PI*7/10, 0],
              ], 1],
            },
        )
      ],
    },
    [ACTION_ID_ATTACK_LIGHT]: {
      maxSpeed: .01,
      blockActions: ACTION_ID_IDLE
          | ACTION_ID_RUN
          | ACTION_ID_ATTACK_HEAVY
          | ACTION_ID_ATTACK_LIGHT
          | ACTION_ID_USE_SECONDARY,
      translated: [.1, 0, 0],
      range: .1, 
      sequences: [{
        ...SKELETON_LIGHT_ATTACK_SEQUENCE,
        // make the forearm damaging so the hand
        // (which should be empty if you're using the default attack) inherits it
        [SKELETON_PART_ID_FOREARM_RIGHT]: [[
          [0, -Math.PI/1.5, Math.PI/6],
          [0, -Math.PI/9, 0],
        ], 1, EASE_IN_QUAD, .5],
      }],
    },
    [ACTION_ID_ATTACK_HEAVY]: {
      maxSpeed: .005,
      blockActions: ACTION_ID_IDLE | ACTION_ID_RUN,
      translated: [.1, 0, 0],
      range: .2, 
      sequences: [{
        ...SKELETON_HEAVY_ATTACK_SEQUENCE,
        // make the forearm damaging so the hand
        // (which should be empty if you're using the default attack) inherits it
        [SKELETON_PART_ID_FOREARM_RIGHT]: [[
          [0, -Math.PI/2, 0],
          [0, 0, 0],
        ], 1, EASE_IN_QUAD, 1],
      }],
    },    
    [ACTION_ID_USE_SECONDARY]: {
      maxSpeed: .01,
      blockActions: 
          ACTION_ID_IDLE
          | ACTION_ID_RUN
          | ACTION_ID_ATTACK_HEAVY
          | ACTION_ID_ATTACK_LIGHT
          | ACTION_ID_USE_SECONDARY,
      range: .1, 
      sequences: [SKELETON_USE_SECONDARY_SEQUENCE],
    },
    [ACTION_ID_TAKE_DAMAGE]: {
      maxSpeed: .007,
      blockActions: ACTION_ID_JUMP
          | ACTION_ID_IDLE
          | ACTION_ID_WALK
          | ACTION_ID_RUN
          | ACTION_ID_ATTACK_LIGHT
          | ACTION_ID_ATTACK_HEAVY
          | ACTION_ID_USE_SECONDARY,
      sequences: entityFlipBodyPartAnimationSequences(
          safeUnpackAnimationSequence(
              [...' !@@5! @!!@;5!"@"!@=5!"@#!@D5! @$!@E@! @%!@<K! @\'!@C5! @)!@V@! @'], 
              FLAG_UNPACK_SUPPLY_ORIGINALS && {
                [SKELETON_PART_ID_HEAD]: [
                  [[0, -Math.PI/6, -Math.PI/3]], 
                  1, EASE_OUT_QUAD],
                [SKELETON_PART_ID_HIPS]: [
                  [[0, -Math.PI/12, -Math.PI/3]], 
                  1, EASE_OUT_QUAD],
                [SKELETON_PART_ID_RIBCAGE]: [
                  [[0, 0, -Math.PI/3]],
                  1],
                [SKELETON_PART_ID_HUMERUS_RIGHT]: [
                  [[0, Math.PI/9, -Math.PI/3]],
                  1],
                [SKELETON_PART_ID_FOREARM_RIGHT]: [
                  [[0, Math.PI/6, 0]],
                  1],
                [SKELETON_PART_ID_HUMERUS_LEFT]: [
                  [[0, -Math.PI/9, Math.PI/3]],
                  1],
                [SKELETON_PART_ID_FEMUR_RIGHT]: [
                  [[0, Math.PI*1/10, -Math.PI/3]],
                  1],
                [SKELETON_PART_ID_SHIN_RIGHT]: [
                  [[0, Math.PI*7/10, 0]],
                  1],
              }
          ),
          SKELETON_PART_FLIPS,
      ),
    }
  },
  id: SKELETON_PART_ID_HIPS,
  modelId: MODEL_SKELETON_HIPS,
  colorTextureIds: SKELETON_COLOR_TEXTURE_IDS,
  normalTextureIds: [NORMAL_TEXTURE_ID_HIPS],
  pushback: 2,
  incomingDamageMultiplier: 1,
  preRotationTransform: matrix4Translate(
      -SKELETON_DIMENSION/4,
      0,
      SKELETON_FEMUR_LENGTH + SKELETON_SHIN_WIDTH + SKELETON_FOOT_DEPTH/2 - SKELETON_DEPTH/2,
  ),
  // postRotationTransform: matrix4Translate(
  //     0,
  //     0,
  //     0,
  // ),
  childs: [
    // upper body
    {
      id: SKELETON_PART_ID_RIBCAGE,
      modelId: MODEL_SKELETON_TORSO,
      colorTextureIds: SKELETON_COLOR_TEXTURE_IDS,
      normalTextureIds: [NORMAL_TEXTURE_ID_RIBCAGE],
      incomingDamageMultiplier: 1,
      preRotationTransform: matrix4Translate(
          0,
          0,
          SKELETON_HIPS_DEPTH/2,
      ),
      postRotationTransform: matrix4Translate(0, 0, SKELETON_RIBCAGE_DEPTH/2),  
      childs: [
        // head
        {
          id: SKELETON_PART_ID_HEAD,
          modelId: MODEL_SKELETON_HEAD,
          colorTextureIds: [COLOR_TEXTURE_ID_SKULL, COLOR_TEXTURE_ID_SKULL_BLACKENED],
          normalTextureIds: [NORMAL_TEXTURE_ID_SKULL],
          incomingDamageMultiplier: 2,
          preRotationTransform: matrix4Translate(
              0,
              0,
              SKELETON_RIBCAGE_DEPTH/2 + SKELETON_HEAD_DEPTH/2 + SKELETON_NECK_LENGTH,
          ),
          jointAttachmentHolderPartId: SKELETON_PART_ID_HAND_LEFT,
          jointAttachmentHeldTransform: matrix4Rotate(Math.PI/3, 0, 1, 0),
        },
        // right shoulder
        {
          id: SKELETON_PART_ID_HUMERUS_RIGHT,
          modelId: MODEL_SKELETON_HUMERUS,
          colorTextureIds: SKELETON_COLOR_TEXTURE_IDS,
          normalTextureIds: [NORMAL_TEXTURE_ID_BONE],
          preRotationTransform: matrix4Translate(
              0,
              -SKELETON_RIBCAGE_HEIGHT/2 + SKELETON_HUMERUS_DIAMETER/2,
              SKELETON_RIBCAGE_DEPTH/2 - SKELETON_HUMERUS_DIAMETER,
          ),
          postRotationTransform: matrix4Translate(
              SKELETON_HUMERUS_WIDTH/2,
              0, 
              0,
          ),
          ...SKELETON_FEMUR_ATTACHMENT_INFO,
          childs: [{
            id: SKELETON_PART_ID_FOREARM_RIGHT,
            modelId: MODEL_SKELETON_FOREARM,
            colorTextureIds: SKELETON_COLOR_TEXTURE_IDS,
            normalTextureIds: [NORMAL_TEXTURE_ID_BONE],
            preRotationTransform: matrix4Translate(
                SKELETON_HUMERUS_WIDTH/2 + SKELETON_HUMERUS_DIAMETER/2,
                0,
                0,
            ),
            postRotationTransform: matrix4Translate(
                SKELETON_FOREARM_WIDTH/2,
                0,
                0,
            ),
            childs: [{
              id: SKELETON_PART_ID_HAND_RIGHT,
              modelId: MODEL_SKELETON_HAND,
              colorTextureIds: SKELETON_COLOR_TEXTURE_IDS,
              normalTextureIds: [NORMAL_TEXTURE_ID_HAND_RIGHT],
              outgoingDamage: 1,
              preRotationTransform: matrix4Translate(
                  SKELETON_FOREARM_WIDTH/2,
                  0,
                  0,
              ),
              postRotationTransform: matrix4Translate(
                  SKELETON_HAND_DIMENSION/2,
                  0,
                  0
              ),
              jointAttachmentHolderTransform: matrix4Multiply(
                  matrix4Rotate(
                      -Math.PI/2,
                      0,
                      1, 
                      0,
                  ),
                  matrix4Translate(
                    SKELETON_HAND_DIMENSION/2,
                    SKELETON_HAND_DIMENSION/3,
                    0,
                ),
              ),
            }]
          }]
        },
        // left shoulder
        {
          id: SKELETON_PART_ID_HUMERUS_LEFT,
          modelId: MODEL_SKELETON_HUMERUS,
          colorTextureIds: SKELETON_COLOR_TEXTURE_IDS,
          normalTextureIds: [NORMAL_TEXTURE_ID_BONE],
          // TODO flip model
          preRotationTransform: matrix4Translate(
              0,
              SKELETON_RIBCAGE_HEIGHT/2 - SKELETON_HUMERUS_DIAMETER/2,
              SKELETON_RIBCAGE_DEPTH/2 - SKELETON_HUMERUS_DIAMETER,
          ),
          postRotationTransform: matrix4Translate(
              SKELETON_HUMERUS_WIDTH/2,
              0, 
              0,
          ),
          ...SKELETON_FEMUR_ATTACHMENT_INFO,
          childs: [{
            id: SKELETON_PART_ID_FOREARM_LEFT,
            modelId: MODEL_SKELETON_FOREARM,
            colorTextureIds: SKELETON_COLOR_TEXTURE_IDS,
            normalTextureIds: [NORMAL_TEXTURE_ID_BONE],
              // TODO flip model
            preRotationTransform: matrix4Translate(
                SKELETON_HUMERUS_WIDTH/2 + SKELETON_HUMERUS_DIAMETER/2,
                0,
                0,
            ),
            postRotationTransform: matrix4Translate(
                SKELETON_FOREARM_WIDTH/2,
                0,
                0,
            ),
            childs: [{
              id: SKELETON_PART_ID_HAND_LEFT,
              modelId: MODEL_SKELETON_HAND,
              outgoingDamage: 1,
              colorTextureIds: SKELETON_COLOR_TEXTURE_IDS,
              normalTextureIds: [NORMAL_TEXTURE_ID_HAND_LEFT],
              preRotationTransform: matrix4Translate(
                  SKELETON_FOREARM_WIDTH/2,
                  0,
                  0,
              ),
              postRotationTransform: matrix4Translate(
                  SKELETON_HAND_DIMENSION/2,
                  0,
                  0
              ),
              jointAttachmentHolderTransform: matrix4Multiply(
                  matrix4Rotate(
                      -Math.PI/2,
                      0,
                      1, 
                      0,
                  ),
                  matrix4Translate(
                    SKELETON_HAND_DIMENSION/2,
                    -SKELETON_HAND_DIMENSION/3,
                    0,
                ),
              ),
            }]            
          }]
        },
      ],
    },
    // right leg
    {
      id: SKELETON_PART_ID_FEMUR_RIGHT,
      modelId: MODEL_SKELETON_FEMUR,
      colorTextureIds: SKELETON_COLOR_TEXTURE_IDS,
      normalTextureIds: [NORMAL_TEXTURE_ID_BONE],
      preRotationTransform: matrix4Translate(
          0,
          -SKELETON_HIPS_HEIGHT/2,
          -SKELETON_HIPS_DEPTH/2 + SKELETON_FEMUR_RADIUS,
      ),
      postRotationTransform: matrix4Translate(
          SKELETON_FEMUR_LENGTH/2,
          0,
          0,
      ),
      ...SKELETON_FEMUR_ATTACHMENT_INFO,
      childs: [{
        id: SKELETON_PART_ID_SHIN_RIGHT,
        modelId: MODEL_SKELETON_SHIN,
        colorTextureIds: SKELETON_COLOR_TEXTURE_IDS,
        normalTextureIds: [NORMAL_TEXTURE_ID_BONE],
        preRotationTransform: matrix4Translate(
            SKELETON_FEMUR_LENGTH/2,
            0,
            0,
        ),
        postRotationTransform: matrix4Translate(
            // TODO this should be SKELETON_FEMUR_LENGTH          
            SKELETON_SHIN_WIDTH/2,
            0, 
            0
        ),
        childs: [{
          id: SKELETON_PART_ID_FOOT_RIGHT,
          modelId: MODEL_SKELETON_FOOT,
          colorTextureIds: SKELETON_COLOR_TEXTURE_IDS,
          normalTextureIds: [NORMAL_TEXTURE_ID_FOOT],
          preRotationTransform: matrix4Translate(
              SKELETON_SHIN_WIDTH,
              0,
              0,
          ),
          postRotationTransform: matrix4Multiply(
              matrix4Rotate(
                  Math.PI/2.5,
                  0,
                  1, 
                  0,
              ),
              matrix4Translate(
                  -SKELETON_FOOT_WIDTH/2,
                  0, 
                  -SKELETON_FOOT_DEPTH,
              ),
          ),
        }],
      }],
    },
    // left leg
    {
      id: SKELETON_PART_ID_FEMUR_LEFT,
      modelId: MODEL_SKELETON_FEMUR,
      colorTextureIds: SKELETON_COLOR_TEXTURE_IDS,
      normalTextureIds: [NORMAL_TEXTURE_ID_BONE],
      // TODO flip model
      preRotationTransform: matrix4Translate(
          0,
          SKELETON_HIPS_HEIGHT/2,
          -SKELETON_HIPS_DEPTH/2 + SKELETON_FEMUR_RADIUS,
      ),
      postRotationTransform: matrix4Translate(
          SKELETON_FEMUR_LENGTH/2,
          0,
          0,
      ),
      ...SKELETON_FEMUR_ATTACHMENT_INFO,
      childs: [{
        id: SKELETON_PART_ID_SHIN_LEFT,
        modelId: MODEL_SKELETON_SHIN,
        colorTextureIds: SKELETON_COLOR_TEXTURE_IDS,
        normalTextureIds: [NORMAL_TEXTURE_ID_BONE],
          // TODO flip model
        preRotationTransform: matrix4Translate(
            // TODO this should be SKELETON_FEMUR_LENGTH
            SKELETON_FEMUR_LENGTH/2,
            0,
            0,
        ),
        postRotationTransform: matrix4Translate(
            SKELETON_SHIN_WIDTH/2,
            0, 
            0
        ),
        childs: [{
          id: SKELETON_PART_ID_FOOT_RIGHT,
          modelId: MODEL_SKELETON_FOOT,
          colorTextureIds: SKELETON_COLOR_TEXTURE_IDS,
          normalTextureIds: [NORMAL_TEXTURE_ID_FOOT],
              preRotationTransform: matrix4Translate(
              SKELETON_SHIN_WIDTH,
              0,
              0,
          ),
          postRotationTransform: matrix4Multiply(
              matrix4Rotate(
                  Math.PI/2.5,
                  0,
                  1, 
                  0,
              ),
              matrix4Translate(
                  -SKELETON_FOOT_WIDTH/2,
                  0, 
                  -SKELETON_FOOT_DEPTH,
              ),
          ),
        }],        
      }],      
    }
  ],
};

//const SHAPE_SKELETON = shapeFromPlanes(planesCube(SKELETON_DIMENSION, SKELETON_DIMENSION, SKELETON_DEPTH));

const SHAPE_SKELETON_TORSO = shapeFromPlanes([
  ...planesCube(
      SKELETON_RIBCAGE_WIDTH,
      SKELETON_RIBCAGE_HEIGHT,
      SKELETON_RIBCAGE_DEPTH,
  ),
  ...planeFlipAndDuplicateOnAxis(
      planeFlipAndDuplicateOnAxis(
          safeUnpackPlanes(
              [...'#@WWZ@^6M/Z7F'],
              FLAG_UNPACK_SUPPLY_ORIGINALS && [
                // shoulder
                {
                  d: .09,
                  normal: vectorNNormalize([0, 1, 1])
                },
                // waist
                {
                  d: .07,
                  normal: vectorNNormalize([0, 3, -1])
                },
                // back rounding
                {
                  d: .06,
                  normal: vectorNNormalize([-2, 3, -1])
                },
              ]
          ),
          1,
      ),
      0,
  ),
  ...safeUnpackPlanes(
      [...'"W@WV)@WM'],
      FLAG_UNPACK_SUPPLY_ORIGINALS && [
        // collar
        {
          d: .085, 
          normal: vectorNNormalize([1, 0, 1])
        },
        // back
        {
          d: .07, 
          normal: vectorNNormalize([-1, 0, 1])
        },
      ]
  ),
]);

const SHAPE_SKELETON_HEAD = shapeFromPlanes([
  ...planesCube(
      SKELETON_HEAD_WIDTH,
      SKELETON_HEAD_HEIGHT,
      SKELETON_HEAD_DEPTH,
  ),
  ...planeFlipAndDuplicateOnAxis(
      safeUnpackPlanes(
          [...'*6@":`@@@.@[:VVG@R@[=SX6@@R[:*VG:*V9=@W)='],
          FLAG_UNPACK_SUPPLY_ORIGINALS && [
            // under jaw
            {
              d: .04,
              normal: vectorNNormalize([-1, 0, -3]),
            },
            // front of face
            {
              d: .05,
              normal: vectorNNormalize([1, 0, 0]),
            },
            // top of back of head
            {
              d: .04,
              normal: vectorNNormalize([-2, 0, 3]),
            },
            // side of face
            {
              d: .05,
              normal: vectorNNormalize([3, 3, 1]),
            },
            // forehead
            {
              d: .045,
              normal: vectorNNormalize([2, 0, 3]),
            },
            // right cheek narrowing
            {
              d: .05,
              normal: vectorNNormalize([4, 5, -2])
            },
            // right cranium rounding
            {
              d: .04,
              normal: vectorNNormalize([0, 2, 3])
            },
            // right back of head rounding (top)
            {
              d: .04,
              normal: vectorNNormalize([-3, 3, 1])
            },
            // right back of head rounding (bottom)
            {
              d: .045,
              normal: vectorNNormalize([-3, 3, -1])
            },
            // right bottom of head rounding
            {
              d: .045,
              normal: vectorNNormalize([0, 1, -1])
            },
          ]
      ), 1),
]);

const SHAPE_SKELETON_HIPS = shapeFromPlanes([
  ...planesCube(
      SKELETON_HIPS_WIDTH,
      SKELETON_HIPS_HEIGHT,
      SKELETON_HIPS_DEPTH,
  ),
  // ...planeFlipAndDuplicateOnAxis([
  //   {
  //     d: .04,
  //     normal: vectorNNormalize([0, 2, -1])
  //   }
  // ], 1)
]);

const SHAPE_SKELETON_HUMERUS = shapeFromPlanes(
    planesCapsule(6, SKELETON_HUMERUS_WIDTH, SKELETON_HUMERUS_DIAMETER/2)
    //planesCube(SKELETON_HUMERUS_WIDTH, SKELETON_HUMERUS_DIAMETER, SKELETON_HUMERUS_DIAMETER)
);

const SHAPE_SKELETON_FOREARM = shapeFromPlanes(
  planesCube(SKELETON_FOREARM_WIDTH, SKELETON_FOREARM_DIAMETER, SKELETON_FOREARM_DIAMETER),
)

const SHAPE_SKELETON_FEMUR = shapeFromPlanes(
    planesCapsule(6, SKELETON_FEMUR_LENGTH, SKELETON_FEMUR_RADIUS)
);

const SHAPE_SKELETON_SHIN = shapeFromPlanes(
    //planesCapsule(8, SKELETON_SHIN_LENGTH, SKELETON_SHIN_RADIUS, SKELETON_ANKLE_RADIUS)
    planesCube(SKELETON_SHIN_WIDTH, SKELETON_SHIN_DIAMETER, SKELETON_SHIN_DIAMETER)
);

const SHAPE_SKELETON_HAND = shapeFromPlanes(
    planesCube(SKELETON_HAND_DIMENSION, SKELETON_HAND_DIMENSION, SKELETON_HAND_DIMENSION),
);

const SHAPE_SKELETON_FOOT = shapeFromPlanes(
    planesCube(SKELETON_FOOT_WIDTH, SKELETON_FOOT_HEIGHT, SKELETON_FOOT_DEPTH),
);